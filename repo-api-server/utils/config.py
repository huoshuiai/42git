# config.py
from dotenv import load_dotenv
import os

load_dotenv()

PORT = int(os.getenv("PORT"))
QDRANT_URL = os.getenv('QDRANT_URL')
QDRANT_PORT = int(os.getenv('QDRANT_PORT'))
QDRANT_COLLECTION = os.getenv('QDRANT_COLLECTION')
QDRANT_KEY = os.getenv('QDRANT_KEY')
EMBEDDINGS_MODEL = os.getenv('TEXT_EMBEDDING_MODEL')
