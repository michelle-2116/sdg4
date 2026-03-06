import json
from pathlib import Path

QUESTION_PATH = Path("data/questions.json")
PAPER_PATH = Path("data/papers.json")
SUBMISSION_PATH = Path("data/submissions.json")
STUDENT_RECORD_PATH = Path("data/student_records.json")


def load_questions():
    if not QUESTION_PATH.exists():
        return []
    with open(QUESTION_PATH, "r") as f:
        return json.load(f)


def save_questions(questions):
    with open(QUESTION_PATH, "w") as f:
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


def load_papers():
    if not PAPER_PATH.exists():
        return []
    with open(PAPER_PATH, "r") as f:
        return json.load(f)


def save_papers(papers):
    with open(PAPER_PATH, "w") as f:
        json.dump(papers, f, indent=2)


def create_paper(paper):
    papers = load_papers()
    papers.append(paper)
    save_papers(papers)


def get_paper(paper_id):
    papers = load_papers()
    for p in papers:
        if p["paper_id"] == paper_id:
            return p
    return None


def load_submissions():
    if not SUBMISSION_PATH.exists():
        return []
    with open(SUBMISSION_PATH, "r") as f:
        return json.load(f)


def save_submissions(submissions):
    with open(SUBMISSION_PATH, "w") as f:
        json.dump(submissions, f, indent=2)


def load_student_records():
    if not STUDENT_RECORD_PATH.exists():
        return {}
    with open(STUDENT_RECORD_PATH, "r") as f:
        return json.load(f)


def save_student_records(records):
    with open(STUDENT_RECORD_PATH, "w") as f:
        json.dump(records, f, indent=4)


def add_student_record(record):

    records = load_student_records()

    student_id = record["student_id"]
    concept_scores = record["concept_scores"]

    if student_id not in records:
        records[student_id] = {
            "concept_mastery": {},
            "history": []
        }

    student = records[student_id]

    for concept, score in concept_scores.items():

        if concept in student["concept_mastery"]:
            old = student["concept_mastery"][concept]
            student["concept_mastery"][concept] = round((old + score) / 2, 3)
        else:
            student["concept_mastery"][concept] = round(score, 3)

    student["history"].append(record)

    save_student_records(records)


def get_student_mastery(student_id):

    records = load_student_records()

    if student_id not in records:
        return {}

    return records[student_id]["concept_mastery"]


def get_class_mastery():

    records = load_student_records()

    concept_totals = {}
    concept_counts = {}

    for student in records.values():

        for concept, score in student["concept_mastery"].items():

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

    if student_id not in records:
        return {}

    history = records[student_id]["history"]

    concept_history = {}

    for r in history:
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

    result = []

    for sid, student in records.items():

        mastery = student["concept_mastery"]

        if mastery:
            avg = sum(mastery.values()) / len(mastery)
        else:
            avg = 0

        result.append({
            "student_id": sid,
            "average_mastery": round(avg, 3)
        })

    return result