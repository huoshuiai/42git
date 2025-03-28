import Redis from "ioredis";
import { Message } from "../lib/types/gpt";
import { MESSAGE_REDIS_URL } from "@/lib/const";

const redis = new Redis(MESSAGE_REDIS_URL);

export const getMessagesFromID = async (
    sessionId: string
): Promise<Message[]> => {
    const data = await redis.hget("messages", sessionId);
    if (!data) return [];
    return JSON.parse(data);
};

export const updateMessages = async (sessionId: string, message: Message[]) => {
    await redis.hset("messages", sessionId, JSON.stringify(message));
};
