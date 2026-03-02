from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

model = SentenceTransformer("all-MiniLM-L6-v2")

def get_embedding(text: str):
    return model.encode(text)

def compute_similarity(text1: str, text2: str):
    emb1 = get_embedding(text1)
    emb2 = get_embedding(text2)
    similarity = cosine_similarity([emb1], [emb2])[0][0]
    return float(similarity)

def calculate_marks(similarity: float, max_marks: int):
    return round(similarity * max_marks, 2)

def evaluate_concepts(tagged_concepts: dict, student_answer: str):
    concept_scores = {}

    for concept, concept_description in tagged_concepts.items():
        similarity = compute_similarity(concept_description, student_answer)
        concept_scores[concept] = round(similarity, 3)

    return concept_scores