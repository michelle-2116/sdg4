from fastapi.middleware.cors import CORSMiddleware
from app.config import WEAK_CONCEPT_THRESHOLD, MEDIUM_CONCEPT_THRESHOLD
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from pathlib import Path
from youtubesearchpython import VideosSearch
from app.models import QuestionCreate, StudentAnswer
import json
from app.database import (
    add_question, get_question, add_student_record,
    get_student_mastery, get_class_mastery, get_student_trend,
    load_questions, get_all_students, create_paper, get_paper,
    load_submissions, save_submissions, load_papers
)

from app.grading import (
    compute_similarity, calculate_marks, evaluate_concepts,
    explain_score, generate_remediation, client
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
### ── SYLLABUS ROUTES ── append these to main.py ──────────────────────
### Also add to imports at top of main.py:
###   from pathlib import Path
###   import json, fitz  (already imported)
###   (youtube_search_python: pip install youtube-search-python)
###   from youtubesearchpython import VideosSearch

### ── DATA PATHS ────────────────────────────────────────────────────────
SYLLABUS_META_PATH = Path("data/syllabus.json")   # stores extracted topics + raw text per page
SYLLABUS_PDF_PATH  = Path("data/syllabus.pdf")    # the uploaded PDF


def load_syllabus_meta():
    if not SYLLABUS_META_PATH.exists():
        return None
    with open(SYLLABUS_META_PATH) as f:
        return json.load(f)


def save_syllabus_meta(meta):
    SYLLABUS_META_PATH.parent.mkdir(exist_ok=True)
    with open(SYLLABUS_META_PATH, "w") as f:
        json.dump(meta, f, indent=2)


### ── 1. TEACHER: Upload + extract syllabus ───────────────────────────
@app.post("/upload-syllabus")
async def upload_syllabus(file: UploadFile = File(...)):
    """
    Teacher uploads a syllabus PDF.
    - Extracts full text per page using PyMuPDF
    - Uses Gemini to extract a structured topic list with page references
    - Saves both the PDF and the structured metadata
    """
    pdf_bytes = await file.read()

    # Save raw PDF for potential re-processing
    SYLLABUS_PDF_PATH.parent.mkdir(exist_ok=True)
    with open(SYLLABUS_PDF_PATH, "wb") as f:
        f.write(pdf_bytes)

    # Extract text per page
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    pages = []
    full_text_for_ai = ""
    for i, page in enumerate(doc):
        text = page.get_text().strip()
        pages.append({"page": i + 1, "text": text})
        full_text_for_ai += f"\n[Page {i+1}]\n{text}\n"

    # Use Gemini to extract structured topic list
    prompt = f"""
You are a curriculum analyst. Below is the full text of an educational syllabus document extracted from a PDF.

Your task:
1. Extract ALL topics and subtopics mentioned in the syllabus.
2. For each topic, identify the page number(s) where it appears.
3. Infer the academic level/difficulty (beginner / intermediate / advanced) based on context clues.

Respond ONLY in this exact JSON format (no markdown, no backticks):
{{
  "subject": "Overall subject name (e.g. Biology, Physics)",
  "level": "Overall academic level (e.g. Grade 10, Undergraduate Year 1)",
  "topics": [
    {{
      "id": "t1",
      "name": "Topic name",
      "subtopics": ["subtopic 1", "subtopic 2"],
      "pages": [1, 2],
      "difficulty": "beginner|intermediate|advanced",
      "keywords": ["keyword1", "keyword2"]
    }}
  ]
}}

SYLLABUS TEXT:
{full_text_for_ai[:12000]}
"""

    try:
        response = client.models.generate_content(
            model="models/gemini-flash-latest",
            contents=prompt
        )
        raw = response.text.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        raw = raw.strip()
        structured = json.loads(raw)
    except Exception as e:
        return {"error": f"Failed to parse syllabus: {str(e)}"}

    meta = {
        "filename": file.filename,
        "total_pages": len(pages),
        "pages": pages,
        "structured": structured,
    }
    save_syllabus_meta(meta)

    return {
        "message": "Syllabus uploaded and processed successfully",
        "filename": file.filename,
        "total_pages": len(pages),
        "subject": structured.get("subject"),
        "level": structured.get("level"),
        "topic_count": len(structured.get("topics", [])),
        "topics": structured.get("topics", []),
    }


### ── 2. GET: Return stored syllabus topics ──────────────────────────
@app.get("/syllabus")
def get_syllabus():
    """Returns the currently stored syllabus metadata and topic list."""
    meta = load_syllabus_meta()
    if not meta:
        return {"available": False}
    s = meta["structured"]
    return {
        "available": True,
        "filename": meta["filename"],
        "total_pages": meta["total_pages"],
        "subject": s.get("subject"),
        "level": s.get("level"),
        "topics": s.get("topics", []),
    }


### ── 3. STUDENT: Search topic → cite syllabus + YouTube link ────────
@app.post("/search-topic")
async def search_topic(payload: dict):
    """
    Student submits a topic query.
    - Searches the stored syllabus for matching content
    - Returns page citations and difficulty level
    - Finds a relevant YouTube video at the right academic level
    """
    query = payload.get("query", "").strip()
    if not query:
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    meta = load_syllabus_meta()

    syllabus_context = ""
    syllabus_available = meta is not None

    if syllabus_available:
        s = meta["structured"]
        topics_json = json.dumps(s.get("topics", []), indent=2)
        syllabus_context = f"""
The student's institution uses this syllabus:
Subject: {s.get("subject", "Unknown")}
Level: {s.get("level", "Unknown")}
Topics (with page references):
{topics_json}
"""

    # Use Gemini to match topic to syllabus + generate search query
    prompt = f"""
You are an academic assistant helping a student find learning resources.

{syllabus_context if syllabus_available else "No syllabus has been uploaded yet."}

Student query: "{query}"

Your task:
1. Search the syllabus topics above for the closest matching topic to the student's query.
2. If found: note the topic name, page numbers, and difficulty level.
3. If not found in the syllabus: state clearly it is not in the syllabus but still help the student.
4. Generate the BEST possible YouTube search query to find a high-quality educational video at the right difficulty level.

Respond ONLY in this exact JSON format (no markdown, no backticks):
{{
  "found_in_syllabus": true,
  "matched_topic": "Exact topic name from syllabus",
  "matched_subtopics": ["relevant subtopic"],
  "pages": [1, 2],
  "difficulty": "beginner|intermediate|advanced",
  "syllabus_note": "Brief note about where/how this appears in the syllabus, or why it was not found",
  "youtube_search_query": "specific search query for YouTube e.g. 'photosynthesis light reactions explained GCSE'"
}}
"""

    try:
        response = client.models.generate_content(
            model="models/gemini-flash-latest",
            contents=prompt
        )
        raw = response.text.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        ai_result = json.loads(raw.strip())
    except Exception as e:
        return {"error": f"AI analysis failed: {str(e)}"}

    # YouTube search
    import urllib.parse
    youtube_results = []
    yt_query = ai_result.get("youtube_search_query", query)
    try:
        from youtubesearchpython import VideosSearch
        vs = VideosSearch(yt_query, limit=3)
        results = vs.result()
        for v in (results.get("result") or []):
            youtube_results.append({
                "title": v.get("title"),
                "url": f"https://www.youtube.com/watch?v={v.get('id')}",
                "channel": v.get("channel", {}).get("name"),
                "duration": v.get("duration"),
                "views": v.get("viewCount", {}).get("short"),
                "thumbnail": v.get("thumbnails", [{}])[0].get("url"),
            })
    except Exception as e:
        print(f"YouTube search error: {e}")
    print(f"YouTube results count: {len(youtube_results)}")
    print(f"YouTube results: {youtube_results}")
    # Always fallback to a search link so the student gets something
    if not youtube_results:
        youtube_results = [{
            "title": f"Search YouTube: {yt_query}",
            "url": f"https://www.youtube.com/results?search_query={urllib.parse.quote(yt_query)}",
            "channel": None,
            "duration": None,
            "views": None,
            "thumbnail": None,
            "is_search_link": True,
        }]

    return {
        "query": query,
        "syllabus_available": syllabus_available,
        "found_in_syllabus": ai_result.get("found_in_syllabus", False),
        "matched_topic": ai_result.get("matched_topic"),
        "matched_subtopics": ai_result.get("matched_subtopics", []),
        "pages": ai_result.get("pages", []),
        "difficulty": ai_result.get("difficulty"),
        "syllabus_note": ai_result.get("syllabus_note"),
        "youtube_search_query": ai_result.get("youtube_search_query"),
        "youtube_results": youtube_results,
    }