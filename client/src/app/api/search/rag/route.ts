import { updateMessages } from "@/database/redis";
import { CHAT_SESSION_FLAG, SERVER_API } from "@/lib/const";
import { Message } from "@/lib/types/gpt";
import { generatePrompt } from "@/lib/utils";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
    const { searchQuery } = await req.json();
    const newMsgSessionID = uuidv4();
    const url = `${SERVER_API}/api/v1/seach_repos`;
    const ragResponse = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: searchQuery }),
        cache: "no-cache",
    });

    const ragData = await ragResponse.json();

    const { systemPrompt, userQuery } = generatePrompt(ragData, searchQuery);
    const ragMessages = [systemPrompt] as Message[];

    // init chat records
    await updateMessages(newMsgSessionID, ragMessages);
    console.log(`---init msgSessionId in search/rag api:${newMsgSessionID}`);

    return Response.json({ ragData, newMsgSessionID }, { status: 200 });
}
