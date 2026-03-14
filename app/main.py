from fastapi.middleware.cors import CORSMiddleware
from app.config import WEAK_CONCEPT_THRESHOLD, MEDIUM_CONCEPT_THRESHOLD
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from app.models import QuestionCreate, StudentAnswer
from app.database import (
    add_question, get_question, add_student_record,
    get_student_mastery, get_class_mastery, get_student_trend,
    load_questions, get_all_students, create_paper, get_paper,
    load_submissions, save_submissions, load_papers
)
from app.grading import (
    compute_similarity, calculate_marks, evaluate_concepts,
    explain_score, generate_remediation
)
import re
import fitz  # PyMuPDF


app = FastAPI(title="Semantic Evaluation Platform")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/add-question")
def create_question(question: QuestionCreate):
    add_question(question.dict())
    return {"message": "Question added successfully"}

@app.get("/questions")
def get_questions():
    questions = load_questions()
    return [
        {"question_id": q["question_id"], "question_text": q["question_text"]}
        for q in questions
    ]

@app.get("/questions-full")
def get_questions_full():
    return load_questions()

@app.post("/submit-answer")
def submit_answer(answer: StudentAnswer):
    question = get_question(answer.question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    similarity = compute_similarity(question["model_answer"], answer.student_answer)
    marks = calculate_marks(similarity, question["max_marks"])
    concept_scores = evaluate_concepts(
        question["tagged_concepts"],
        student_answer,
        similarity=similarity
    )

    add_student_record({
        "student_id": answer.student_id,
        "question_id": answer.question_id,
        "concept_scores": concept_scores
    })

    mastery = get_student_mastery(answer.student_id)

    explanation = explain_score(
        question_text=question["question_text"],
        model_answer=question["model_answer"],
        student_answer=answer.student_answer,
        similarity=similarity,
        concept_scores=concept_scores,
        weak_concept_threshold=WEAK_CONCEPT_THRESHOLD,
        medium_concept_threshold=MEDIUM_CONCEPT_THRESHOLD
    )

    weak_concepts = [
        concept for concept, score in mastery.items()
        if score < WEAK_CONCEPT_THRESHOLD
    ]

    # replace the remediation loop in submit_answer with this:
    remediation = {}
    for concept in weak_concepts:
        remediation[concept] = generate_remediation(
            concept=concept,
            question_text=question["question_text"],
            model_answer=question["model_answer"],
            student_answer=answer.student_answer,
            mastery_score=mastery.get(concept, 0.0)
        )

    trend = get_student_trend(answer.student_id)

    return {
        "similarity_score": round(similarity, 3),
        "marks_awarded": marks,
        "max_marks": question["max_marks"],
        "explanation": explanation,
        "concept_breakdown": concept_scores,
        "current_mastery": mastery,
        "weak_concepts": weak_concepts,
        "remediation": remediation,
        "trend_analysis": trend
    }

@app.post("/submit-paper")
def submit_paper(
    student_id: str = Form(...),
    paper_id: str = Form(...),
    file: UploadFile = File(...)
):
    paper = get_paper(paper_id)
    if not paper:
        return {"error": "Paper not found"}

    submissions = load_submissions()

    for s in submissions:
        if s["student_id"] == student_id and s["paper_id"] == paper_id:
            raise HTTPException(
                status_code=400,
                detail="Student has already submitted this paper"
            )

    pdf_bytes = file.file.read()
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    full_text = ""
    for page in doc:
        full_text += page.get_text()

    pattern = r"Q(\d+)[\.\:]\s*(.*?)(?=Q\d+[\.\:]|\Z)"
    matches = re.findall(pattern, full_text, re.DOTALL)
    answer_map = {num: text.strip() for num, text in matches}

    total_marks = 0
    question_results = {}

    for q in paper["questions"]:
        q_num = str(q["question_number"])
        q_id = q["question_id"]

        question = get_question(q_id)
        if not question:
            continue

        student_answer = answer_map.get(q_num)

        if not student_answer:
            question_results[q_num] = {
                "marks": 0,
                "max_marks": question["max_marks"],
                "similarity": 0,
                "concept_scores": {},
                "explanation": {
                    "similarity_label": "Poor",
                    "similarity_percentage": 0,
                    "feedback": "No answer was found for this question.",
                    "matched_concepts": [],
                    "partial_concepts": [],
                    "missing_concepts": []
                },
                "error": "Answer not found"
            }
            continue

        similarity = compute_similarity(question["model_answer"], student_answer)
        marks = calculate_marks(similarity, question["max_marks"])
        total_marks += marks

        concept_scores = evaluate_concepts(
            question["tagged_concepts"],
            student_answer,
            similarity=similarity
        )

        add_student_record({
            "student_id": student_id,
            "question_id": q_id,
            "concept_scores": concept_scores
        })

        explanation = explain_score(
            question_text=question["question_text"],
            model_answer=question["model_answer"],
            student_answer=student_answer,
            similarity=similarity,
            concept_scores=concept_scores,
            weak_concept_threshold=WEAK_CONCEPT_THRESHOLD,
            medium_concept_threshold=MEDIUM_CONCEPT_THRESHOLD
        )

        question_results[q_num] = {
            "marks": marks,
            "max_marks": question["max_marks"],
            "similarity": round(similarity, 3),
            "concept_scores": concept_scores,
            "explanation": explanation
        }

    # Use current attempt's concept scores, not running average
    current_concept_scores = {}
    for q_num, q_result in question_results.items():
        for concept, score in q_result.get("concept_scores", {}).items():
            if concept not in current_concept_scores:
                current_concept_scores[concept] = []
            current_concept_scores[concept].append(score)

    # Average across questions if concept appears in multiple
    current_concept_min = {
        concept: min(scores)
        for concept, scores in current_concept_scores.items()
    }

    weak_concepts = [
        concept for concept, score in current_concept_min.items()
        if score < WEAK_CONCEPT_THRESHOLD
    ]

    remediation = {}
    for concept in weak_concepts:
        context_question = None
        context_answer = None
        context_model = None
        for q in paper["questions"]:
            q_data = get_question(q["question_id"])
            if q_data and concept in q_data.get("tagged_concepts", {}):
                q_num = str(q["question_number"])
                context_question = q_data["question_text"]
                context_model = q_data["model_answer"]
                context_answer = answer_map.get(q_num, "No answer provided")
                break

        remediation[concept] = generate_remediation(
            concept=concept,
            question_text=context_question or "General concept question",
            model_answer=context_model or "",
            student_answer=context_answer or "No answer provided",
            mastery_score=current_concept_min.get(concept, 0.0)
        )

    submissions.append({
        "student_id": student_id,
        "paper_id": paper_id,
        "total_marks": total_marks,
        "question_results": question_results
    })
    save_submissions(submissions)

    return {
        "student_id": student_id,
        "paper_id": paper_id,
        "total_marks": total_marks,
        "question_results": question_results,
        "weak_concepts": weak_concepts,
        "remediation": remediation
    }

@app.get("/class-analytics")
def class_analytics():
    class_mastery = get_class_mastery()
    weak_concepts = [
        concept for concept, score in class_mastery.items()
        if score < WEAK_CONCEPT_THRESHOLD
    ]
    return {
        "class_mastery": class_mastery,
        "weak_concepts_classwide": weak_concepts
    }

@app.get("/students")
def list_students():
    return get_all_students()

@app.get("/student/{student_id}")
def student_detail(student_id: str):
    mastery = get_student_mastery(student_id)
    trend = get_student_trend(student_id)
    weak = [c for c, v in mastery.items() if v < WEAK_CONCEPT_THRESHOLD]
    return {"mastery": mastery, "trend": trend, "weak_concepts": weak}

@app.get("/submissions/{student_id}")
def get_student_submissions(student_id: str):
    submissions = load_submissions()
    return [s for s in submissions if s["student_id"] == student_id]


@app.post("/create-paper")
def create_exam_paper(paper: dict):
    existing = get_paper(paper["paper_id"])
    if existing:
        raise HTTPException(status_code=400, detail="Paper ID already exists")
    create_paper(paper)
    return {"message": "Paper created successfully"}

@app.get("/paper/{paper_id}")
def get_exam_paper(paper_id: str):
    paper = get_paper(paper_id)
    if not paper:
        return {"error": "Paper not found"}
    questions = []
    for q in paper["questions"]:
        q_data = get_question(q["question_id"])
        questions.append({
            "question_number": q["question_number"],
            "question_id": q["question_id"],
            "question_text": q_data["question_text"],
            "max_marks": q_data["max_marks"]
        })
    return {"paper_id": paper["paper_id"], "title": paper["title"], "questions": questions}

@app.get("/papers")
def list_papers():
    return load_papers()

@app.get("/paper-results/{paper_id}")
def get_paper_results(paper_id: str):
    submissions = load_submissions()
    paper_subs = [s for s in submissions if s["paper_id"] == paper_id]

    if not paper_subs:
        return {"message": "No submissions yet"}

    total_students = len(paper_subs)
    avg_marks = sum(s["total_marks"] for s in paper_subs) / total_students

    question_aggregate = {}
    for s in paper_subs:
        for q_num, data in s["question_results"].items():
            if q_num not in question_aggregate:
                question_aggregate[q_num] = []
            question_aggregate[q_num].append(data["marks"])

    question_average = {
        q: round(sum(scores) / len(scores), 2)
        for q, scores in question_aggregate.items()
    }

    return {
        "total_students": total_students,
        "average_marks": round(avg_marks, 2),
        "question_average": question_average,
        "submissions": paper_subs
    }