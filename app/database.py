import json
from pathlib import Path

DATA_PATH = Path("data/questions.json")

def load_questions():
    if not DATA_PATH.exists():
        return []
    with open(DATA_PATH, "r") as f:
        return json.load(f)

def save_questions(questions):
    with open(DATA_PATH, "w") as f:
        json.dump(questions, f, indent=4)

def add_question(question):
    questions = load_questions()
    questions.append(question)
    save_questions(questions)

def get_question(question_id):
    questions = load_questions()
    for q in questions:
        if q["question_id"] == question_id:
            return q
    return None

STUDENT_PATH = Path("data/student_records.json")

def load_student_records():
    if not STUDENT_PATH.exists():
        return []
    with open(STUDENT_PATH, "r") as f:
        return json.load(f)

def save_student_records(records):
    with open(STUDENT_PATH, "w") as f:
        json.dump(records, f, indent=4)

def add_student_record(record):
    records = load_student_records()
    records.append(record)
    save_student_records(records)

def get_student_mastery(student_id):
    records = load_student_records()
    concept_totals = {}
    concept_counts = {}

    for r in records:
        if r["student_id"] == student_id:
            for concept, score in r["concept_scores"].items():
                concept_totals[concept] = concept_totals.get(concept, 0) + score
                concept_counts[concept] = concept_counts.get(concept, 0) + 1

    mastery = {}
    for concept in concept_totals:
        mastery[concept] = round(
            concept_totals[concept] / concept_counts[concept], 3
        )

    return mastery

def get_class_mastery():
    records = load_student_records()

    concept_totals = {}
    concept_counts = {}

    for r in records:
        for concept, score in r["concept_scores"].items():
            concept_totals[concept] = concept_totals.get(concept, 0) + score
            concept_counts[concept] = concept_counts.get(concept, 0) + 1

    class_mastery = {}
    for concept in concept_totals:
        class_mastery[concept] = round(
            concept_totals[concept] / concept_counts[concept], 3
        )

    return class_mastery

def get_student_trend(student_id):
    records = load_student_records()

    concept_history = {}

    # Collect chronological scores
    for r in records:
        if r["student_id"] == student_id:
            for concept, score in r["concept_scores"].items():
                if concept not in concept_history:
                    concept_history[concept] = []
                concept_history[concept].append(score)

    trend_analysis = {}

    for concept, scores in concept_history.items():
        if len(scores) < 2:
            trend_analysis[concept] = {
                "scores": scores,
                "improving": False,
                "declining": False
            }
            continue

        change = scores[-1] - scores[0]

        trend_analysis[concept] = {
            "scores": scores,
            "improving": change > 0.1,
            "declining": change < -0.1
        }

    return trend_analysis

def get_all_students():
    records = load_student_records()

    student_data = {}

    for r in records:
        sid = r["student_id"]
        if sid not in student_data:
            student_data[sid] = []

        avg_score = sum(r["concept_scores"].values()) / len(r["concept_scores"])
        student_data[sid].append(avg_score)

    result = []
    for sid, scores in student_data.items():
        result.append({
            "student_id": sid,
            "average_mastery": round(sum(scores) / len(scores), 3)
        })

    return result