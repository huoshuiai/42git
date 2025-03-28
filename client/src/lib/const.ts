export const CHAT_SESSION_FLAG = "chat-session";
export const PAGE_LOAD_TIMESTAMP_FLAG = "page_load_timestamp_flag";

export const OPENAI_KEY = process.env.OPENAI_KEY || "";
export const SERVER_API = process.env.SERVER_API || "";
export const MESSAGE_REDIS_URL = process.env.MESSAGE_REDIS_URL || "";
export const USER_SESSION_API = process.env.USER_SESSION_API || "";
export const NEXT_PUBLIC_API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

export const githubHeader = {
    Accept: "*/*",
    Authorization: `token ${GITHUB_TOKEN}`,
};

export const LANGFUSE_URL = process.env.LANGFUSE_URL || "";
export const LANGFUSE_PUB_KEY = process.env.LANGFUSE_PUB_KEY || "";
export const LANGFUSE_SEC_KEY = process.env.LANGFUSE_SEC_KEY || "";
