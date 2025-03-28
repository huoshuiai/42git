## 需設置的環境變量

### 本地運行

-   新增`.env.local`
    -   `SERVER_API` 為後端 server entry，目前為`https://mlwhmsaqddja.cloud.sealos.io`
    -   `OPENAI_KEY` openai key

### Docker 運行

-   使用 buildx 來 build x86 版本，因為 sealos 的緣故

```
docker buildx build --platform linux/amd64,linux/arm64 -t jamielee0510/42git-client:latest . --push
```

-   目前用 github action 來執行，不用本地
