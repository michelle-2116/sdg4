import os
import json
from google import genai
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from dotenv import load_dotenv

load_dotenv()

# ── Sentence Embedding Model ───────────────────────────────────────
model = SentenceTransformer("sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2")

# ── Gemini Setup ───────────────────────────────────────────────────
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


# ── Core Grading Functions ─────────────────────────────────────────

def get_embedding(text: str):
    return model.encode(text)


def compute_similarity(text1: str, text2: str):
    emb1 = get_embedding(text1)
    emb2 = get_embedding(text2)
    similarity = cosine_similarity([emb1], [emb2])[0][0]
    return float(similarity)


def calculate_marks(similarity: float, max_marks: int):
    return round(similarity * max_marks, 2)


def evaluate_concepts(tagged_concepts: dict, student_answer: str, similarity: float = None):
    """
    Derive concept scores from the overall similarity score.
    All concepts tagged to a question get the same score as the question similarity,
    since the similarity already measures how well the student answered.
    """
    concept_scores = {}
    for concept in tagged_concepts:
        concept_scores[concept] = round(similarity, 3)
    return concept_scores


# ── Explainable Scoring ────────────────────────────────────────────

def get_similarity_label(similarity: float) -> str:
    if similarity >= 0.85:
        return "Excellent"
    elif similarity >= 0.70:
        return "Good"
    elif similarity >= 0.50:
        return "Partial"
    else:
        return "Poor"


def explain_score(
    question_text: str,
    model_answer: str,
    student_answer: str,
    similarity: float,
    concept_scores: dict,
    weak_concept_threshold: float = 0.5,
    medium_concept_threshold: float = 0.7
) -> dict:

    matched_concepts = []
    missing_concepts = []
    partial_concepts = []

    for concept, score in concept_scores.items():
        if score >= medium_concept_threshold:
            matched_concepts.append({"concept": concept, "score": round(score, 3)})
        elif score >= weak_concept_threshold:
            partial_concepts.append({"concept": concept, "score": round(score, 3)})
        else:
            missing_concepts.append({"concept": concept, "score": round(score, 3)})

    label = get_similarity_label(similarity)

    if label == "Excellent":
        feedback = "Your answer demonstrates strong understanding and closely matches the expected response."
    elif label == "Good":
        feedback = "Your answer captures the main ideas well but could be more complete."
    elif label == "Partial":
        feedback = "Your answer shows partial understanding. Some key concepts are missing or underdeveloped."
    else:
        feedback = "Your answer does not sufficiently address the question. Please review the topic carefully."

    if missing_concepts:
        names = ", ".join([c["concept"] for c in missing_concepts])
        feedback += f" Missing concepts: {names}."

    if partial_concepts:
        names = ", ".join([c["concept"] for c in partial_concepts])
        feedback += f" Partially covered: {names}."

    return {
        "similarity_label": label,
        "similarity_percentage": round(similarity * 100, 1),
        "feedback": feedback,
        "matched_concepts": matched_concepts,
        "partial_concepts": partial_concepts,
        "missing_concepts": missing_concepts,
    }


# ── AI Remediation via Gemini ──────────────────────────────────────

def get_difficulty_level(mastery_score: float) -> str:
    if mastery_score < 0.5:
        return "beginner (use very simple language, basic analogies, avoid jargon)"
    elif mastery_score < 0.7:
        return "intermediate (assume basic knowledge, build on it)"
    else:
        return "advanced (student nearly has it, focus on nuance and edge cases)"


def generate_remediation(
    concept: str,
    question_text: str,
    model_answer: str,
    student_answer: str,
    mastery_score: float
) -> dict:

    difficulty = get_difficulty_level(mastery_score)

    prompt = f"""
You are an expert tutor helping a student who answered an exam question incorrectly or incompletely.

CONCEPT BEING TESTED: {concept}
DIFFICULTY LEVEL: {difficulty}
MASTERY SCORE: {round(mastery_score * 100)}% (higher = closer to understanding)

EXAM QUESTION:
{question_text}

MODEL ANSWER (what a correct answer looks like):
{model_answer}

STUDENT'S ACTUAL ANSWER:
{student_answer}

Your task is to help this specific student understand what they missed.

Respond in this EXACT JSON format (no markdown, no code blocks, just raw JSON):
{{
  "what_student_got_right": "1-2 sentences on what they did correctly (be encouraging)",
  "what_was_missing": "1-2 sentences specifically identifying the gap in their answer",
  "micro_lesson": "3-5 sentences explaining the concept clearly at the appropriate difficulty level. Use a simple analogy if beginner.",
  "practice_questions": [
    "Practice question 1 related to {concept}",
    "Practice question 2 related to {concept}",
    "Practice question 3 related to {concept}"
  ],
  "study_tip": "One specific actionable tip for remembering this concept"
}}
"""

    try:
        response = client.models.generate_content(
            model="models/gemini-flash-latest",
            contents=prompt
        )
        raw = response.text.strip()

        # Strip markdown code fences if present
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        raw = raw.strip()

        parsed = json.loads(raw)
        parsed["concept"] = concept
        parsed["mastery_score"] = round(mastery_score * 100)
        parsed["difficulty_level"] = difficulty.split(" ")[0]
        return parsed

    except Exception as e:
        print("GEMINI ERROR:", str(e))
        return {
            "concept": concept,
            "mastery_score": round(mastery_score * 100),
            "difficulty_level": "unknown",
            "what_student_got_right": "Could not analyse your answer at this time.",
            "what_was_missing": f"Please review the concept: {concept}.",
            "micro_lesson": f"Revise the fundamentals of {concept} and ensure you understand its core definition and application.",
            "practice_questions": [
                f"Define {concept} in your own words.",
                f"Give an example of {concept} in real life.",
                f"Explain why {concept} is important in this topic."
            ],
            "study_tip": f"Re-read your notes on {concept} and try summarising it in 2-3 sentences.",
            "error": str(e)
        }