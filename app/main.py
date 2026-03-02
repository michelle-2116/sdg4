from fastapi import FastAPI, HTTPException
from app.models import QuestionCreate, StudentAnswer
from app.database import add_question, get_question, add_student_record, get_student_mastery
from app.grading import compute_similarity, calculate_marks, evaluate_concepts

app = FastAPI(title="Semantic Evaluation Platform")

@app.post("/add-question")
def create_question(question: QuestionCreate):
    add_question(question.dict())
    return {"message": "Question added successfully"}

@app.post("/submit-answer")
def submit_answer(answer: StudentAnswer):
    question = get_question(answer.question_id)

    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    similarity = compute_similarity(
        question["model_answer"],
        answer.student_answer
    )

    marks = calculate_marks(similarity, question["max_marks"])

    concept_scores = evaluate_concepts(
        question["tagged_concepts"],
        answer.student_answer
    )

    # Store student record
    add_student_record({
        "student_id": answer.student_id,
        "question_id": answer.question_id,
        "concept_scores": concept_scores
    })

    mastery = get_student_mastery(answer.student_id)

    return {
        "similarity_score": round(similarity, 3),
        "marks_awarded": marks,
        "max_marks": question["max_marks"],
        "concept_breakdown": concept_scores,
        "current_mastery": mastery
    }