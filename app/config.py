import os
from dotenv import load_dotenv

load_dotenv()

SIMILARITY_THRESHOLD = float(os.getenv("SIMILARITY_THRESHOLD", 0.75))
WEAK_CONCEPT_THRESHOLD = float(os.getenv("WEAK_CONCEPT_THRESHOLD", 0.5))
MEDIUM_CONCEPT_THRESHOLD = float(os.getenv("MEDIUM_CONCEPT_THRESHOLD", 0.7))