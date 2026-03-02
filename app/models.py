from pydantic import BaseModel
from typing import List, Dict

class QuestionCreate(BaseModel):
    question_id: str
    question_text: str
    model_answer: str
    max_marks: int
    tagged_concepts: Dict[str, str]
    # format:
    # {
    #   "ConceptName": "short expected description",
    #   ...
    # }

class StudentAnswer(BaseModel):
    question_id: str
    student_answer: str