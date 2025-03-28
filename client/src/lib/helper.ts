import { updateMessages } from "@/database/redis";
import { Message } from "./types/gpt";

/**
 * generate text result from llm stream, and then upsert it
 * in Redis via message-sessionId
 * @param stream
 * @param sessionId
 * @param previousMessges
 */
export async function processStreamData(
    stream: ReadableStream,
    sessionId: string,
    previousMessges: Message[]
) {
    const reader = stream.getReader();
    let decoder = new TextDecoder();
    let text = "";

    while (true) {
        const { done, value } = await reader.read();
        if (done) {
            const newMessageRecord = [
                ...previousMessges,
                {
                    role: "assistant",
                    content: text,
                },
            ] as Message[];
            console.log(
                `---save new message in Redis, sessionID:${sessionId},newMessageRecord: ${newMessageRecord}`
            );
            await updateMessages(sessionId, newMessageRecord);
            break;
        }

        const chunk = decoder.decode(value, { stream: true });
        text += chunk;
        // Here you can parse and handle the buffer data
    }
}
