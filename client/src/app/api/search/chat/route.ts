import { OpenAIStream, StreamingTextResponse } from "ai";
import { cookies } from "next/headers";
import { CHAT_SESSION_FLAG, OPENAI_KEY } from "@/lib/const";
import { Message } from "@/lib/types/gpt";
import { updateMessages, getMessagesFromID } from "@/database/redis";
import { openai, langfuse } from "@/lib/llm";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    const { userQueryMessage, msgSessionId } = await req.json();

    // initialize Langfuse
    const trace = langfuse.trace({
        name: "QA",
        // Langfuse session tracking: https://langfuse.com/docs/tracing-features/sessions
        sessionId: msgSessionId,
        // Langfuse user tracking: https://langfuse.com/docs/tracing-features/users
        userId: "demo-user-id",
        // Make public, so everyone can view it via its URL (for this demo)
        public: true,
    });
    trace.update({
        input: userQueryMessage,
    });

    console.log(`---get msgSessionId in search/chat api:${msgSessionId}`);
    const messages = await getMessagesFromID(msgSessionId);
    messages.push(userQueryMessage);

    const generation = trace.generation({
        name: "generation",
        input: messages,
        model: "gpt-3.5-turbo",
    });
    // Ask OpenAI for a streaming chat completion given the prompt
    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        stream: true,
        messages,
    });

    // Convert the response into a friendly text-stream
    const stream = OpenAIStream(response, {
        onStart: () => {
            generation.update({
                completionStartTime: new Date(),
            });
        },
        onCompletion: async (completion) => {
            generation.end({
                output: completion,
                // // Conditionally log a warning state
                // level: completion.includes("I don't know how to help with that")
                //     ? "WARNING"
                //     : "DEFAULT",
                // statusMessage: completion.includes("I don't know how to help with that")
                //     ? "Refused to answer"
                //     : undefined,
            });
            trace.update({
                output: completion,
            });

            // Make sure all events are successifully send to Langfuse before the stream terminates.
            await langfuse.flushAsync();
        },
    });

    // Tee the stream to get two streams
    const [stream1, stream2] = stream.tee();

    // not using await to make this Promise not block current task
    processStreamData(stream2, msgSessionId, messages);

    // Respond with the stream
    return new StreamingTextResponse(stream1, {
        headers: { "X-RATE-LIMIT": "lol" },
    });
}

async function processStreamData(
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
