# 使用官方 Python 運行時作為父映像
FROM python:3.10

# 設定工作目錄
WORKDIR /app

# 環境變量設置(在sealos部署的時候，會有內外網的url)
ENV PORT=1234
# ENV QDRANT_URL=https://8c70df02-5513-4f87-aa53-7f4917de26ac.us-east4-0.gcp.cloud.qdrant.io:6333
ENV QDRANT_PORT=6333
# ENV QDRANT_KEY=bxEhTsbDAaBw_LLcx4TOOeNZ2BpcO03R4SfXy9GpLzizlQY4AIBLTQ
ENV QDRANT_COLLECTION=42git
ENV TEXT_EMBEDDING_MODEL=intfloat/multilingual-e5-large		


# 將依賴文件複製到容器中
COPY requirements.txt ./

RUN pip install --no-cache-dir -r requirements.txt

# 複製代碼到容器中
COPY . .

RUN python -c 'from fastembed.embedding import DefaultEmbedding; DefaultEmbedding("intfloat/multilingual-e5-large")'


# PORT
EXPOSE 1234 


CMD ["python", "main.py"]

