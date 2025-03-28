This is the mono repo for 42git--- an AI search engine for Github repositories.

- `client/*` -- the client side of 42git. It is a NextJS project.
- `repo-api-server/*` -- the server side of 42git. It is a Python FastAPI server.
- `user-api-server/*` -- 處理user session的；當用戶用google/github帳號登入後，是用這個api-server來保存用戶session；用戶跟llm的對話，是透過session來存取的
- `cron-jobs/*`


架構：

Frontend---請求----redis存對話----

Server---qdrant db找相似repo

cron-jobs---透過kafka來流式處理repo 的embedding流程
啟動順序（
會把repo的目錄結構給抓下來


