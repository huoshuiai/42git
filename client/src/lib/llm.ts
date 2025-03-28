import OpenAI from "openai";
import { Langfuse } from "langfuse";

import {
    LANGFUSE_PUB_KEY,
    LANGFUSE_SEC_KEY,
    LANGFUSE_URL,
    OPENAI_KEY,
} from "./const";

export const openai = new OpenAI({
    apiKey: OPENAI_KEY,
});

export const langfuse = new Langfuse({
    secretKey: LANGFUSE_SEC_KEY,
    publicKey: LANGFUSE_PUB_KEY,
    baseUrl: LANGFUSE_URL,
});
