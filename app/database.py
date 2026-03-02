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