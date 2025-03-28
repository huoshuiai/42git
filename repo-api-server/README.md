## 環境變量(dockerfile)
```
ENV PORT=1234
ENV QDRANT_URL=https://8c70df02-5513-4f87-aa53-7f4917de26ac.us-east4-0.gcp.cloud.qdrant.io:6333
ENV QDRANT_PORT=6333
ENV QDRANT_KEY=bxEhTsbDAaBw_LLcx4TOOeNZ2BpcO03R4SfXy9GpLzizlQY4AIBLTQ
ENV QDRANT_COLLECTION=demo-42git-01
```


## 环境变量（在本地运行的配置）
```
PORT=1234
QDRANT_URL=https://8c70df02-5513-4f87-aa53-7f4917de26ac.us-east4-0.gcp.cloud.qdrant.io:6333
QDRANT_PORT=6333
QDRANT_KEY=bxEhTsbDAaBw_LLcx4TOOeNZ2BpcO03R4SfXy9GpLzizlQY4AIBLTQ
QDRANT_COLLECTION=demo-42git-01
TEXT_EMBEDDING_MODEL=BAAI/bge-small-en
```
## 注意事項
1. 在本地更新環境變量、然後prod環境也要跟著換時，要同步更新docker裡面的環境變量

## init data into qdrant
```
python3 -m example_data.init_collection
```

## easy push docker to dockerhub
```
docker buildx build --platform linux/amd64,linux/arm64 -t jamielee0510/42git-server:latest . --push
```

# ChangeLog
## 20240214
測試了 `binary`,`hnsw`,`scalary`三者qdrant index的機制，各自開了api在`apis/testing_routes.py`下，然後透過`python3 -m example_data.test_speed`執行測試腳本。

目前觀測結果是`hnsw`的速度最快，但這三者都是之間使用官方提供的參數，並沒有對於各自算法的參數做優化測試...

所以目前版本就先改為`hnsw`的向量化index，使用其collection