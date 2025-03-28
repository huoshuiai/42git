import pandas as pd
from utils.helper import load_csv, format_data
from db.qdrant_db import QdrantConnection
from fastembed.embedding import FlagEmbedding as Embedding

def init_data():
    """
    這邊是要等服務起起來之後，直接load資料到db裡面；
    所以最好是本地embedding後、再把資料load 到遠端的qdrant中
    所以，應該直接跑本地的fast-embedding
    然後再連qdrant
    """
    qdrant = QdrantConnection()
 
    #TODO: 看之後要不要查看一些flag
    data = load_csv('out_20231216')
    def embedding_text(text):
        result = next(embedding_model.embed([text]))
        return result
    embedding_model =  Embedding(model_name="intfloat/multilingual-e5-large", max_length=1024)
    data['embedding_desc'] = data['desc'].apply(embedding_text)
    formatted_data = format_data(data)
    qdrant.upload_data(formatted_data)
        

init_data()