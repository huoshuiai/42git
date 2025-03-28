import { getMessagesFromID } from "@/database/redis";
import { getCodeContent } from "@/lib/github";
import { processStreamData } from "@/lib/helper";
import { openai } from "@/lib/llm";
import { Message } from "@/lib/types/gpt";
import { OpenAIStream, StreamingTextResponse } from "ai";

export async function POST(req: Request) {
    const { userQuery, sessionId, repoName } = await req.json();
    const userMessage = {
        role: "user",
        content: "",
    } as Message;
    try {
        const checkerPrompt = {
            role: "user",
            content: `
                please check the following question:
                ===
                ${userQuery}
                ===
                
                if it is not related with code question at all, 
                or not related with this repository ${repoName}, 
                return the following JSON response:
                ===
                {
                    politeResponse: "I am an assistant for helping people understand repository easlier, please consider related question."
                }
                ===
                ;
    
                if it related with code question, please return the code file path in JSON format, which would help answer the user question:
                ===
                {
                    filePath: ...
                }
                ===

                default, you could reply the question directly, return null in filePath:
                 ===
                {
                    filePath: null
                }
                ===
            `,
        } as Message;
        const messages = await getMessagesFromID(sessionId);
        const checkerMessages = [...messages, checkerPrompt];
        const checkerResponse = await openai.chat.completions.create({
            model: "gpt-4-turbo",
            messages: checkerMessages,
            response_format: { type: "json_object" },
            stream: false,
        });

        const checkerResult = JSON.parse(
            checkerResponse.choices[0].message.content as string
        );
        if (checkerResult.politeResponse) {
            const stream = new ReadableStream({
                start(controller) {
                    // 將消息寫入流
                    controller.enqueue(
                        new TextEncoder().encode(checkerResult.politeResponse)
                    );
                    // 關閉流
                    controller.close();
                },
            });
            return new StreamingTextResponse(stream, {
                headers: { "X-RATE-LIMIT": "lol" },
            });
        } else if (checkerResult.filepath) {
            // need file:
            const filePath = checkerResult.filepath;
            const fileContent = await getCodeContent(repoName, filePath);

            userMessage.content = `
                please check the source code of ${filePath}:
                ===
                ${fileContent}
                ===

                ${userQuery}
            `;
        } else {
            userMessage.content = userQuery;
        }

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [...messages, userMessage] as Message[],
            stream: true,
        });

        // Convert the response into a friendly text-stream
        const stream = OpenAIStream(response);

        // Tee the stream to get two streams
        const [stream1, stream2] = stream.tee();

        // not using await to make this Promise not block current task
        processStreamData(stream2, sessionId, messages);

        // Respond with the stream
        return new StreamingTextResponse(stream1, {
            headers: { "X-RATE-LIMIT": "lol" },
        });
    } catch (err) {
        // TODO: error handler
        console.log(`---err: ${err}`);
        const stream = new ReadableStream({
            start(controller) {
                // 將消息寫入流
                controller.enqueue(
                    new TextEncoder().encode("server error, please try again")
                );
                // 關閉流
                controller.close();
            },
        });
        return new StreamingTextResponse(stream, {
            headers: { "X-RATE-LIMIT": "lol" },
        });
    }
}
