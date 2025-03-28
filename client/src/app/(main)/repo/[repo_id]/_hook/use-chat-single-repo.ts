import { ChatRecordStore, useChatStore } from "@/app/_store/gpt-store";
import { Message } from "@/lib/types/gpt";
import { useShallow } from "zustand/react/shallow";

const chatSelector = (state: ChatRecordStore) => ({
    chatMessages: state.chatMessages,
    isAnswering: state.isAnswering,
    answeringMsg: state.answeringMsg,
    setChatMessages: state.setChatMessages,
    setMsgSessionId: state.setMsgSessionId,
    getChatMessages: state.getChatMessages,
    getMsgSessionId: state.getMsgSessionId,
    setIsAnswering: state.setIsAnswering,
    setAnsweringMsg: state.setAnsweringMsg,
});

export const useChatSingleRepo = () => {
    const {
        chatMessages,
        getChatMessages,
        setChatMessages,
        getMsgSessionId,
        setMsgSessionId,
        isAnswering,
        setIsAnswering,
        answeringMsg,
        setAnsweringMsg,
    } = useChatStore(useShallow(chatSelector));

    const chatWithRepoCode = async (query: string, repoName: string) => {
        const userMsg = { role: "user", content: query } as Message;
        const messages = getChatMessages();
        const sessionId = getMsgSessionId();
        setChatMessages([...messages, userMsg]);
        setAnsweringMsg("");
        setIsAnswering(true);
        const stream = await fetch("/api/repo/chat", {
            method: "post",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userQuery: query,
                sessionId,
                repoName,
            }),
        });
        if (!stream.ok) {
            // TODO: error handler
            return;
        }
        const reader = stream.body!.getReader();
        const decoder = new TextDecoder();
        let text = "";
        while (true) {
            const { done, value } = await reader.read();
            console.log(value);
            if (done) {
                const message = getChatMessages();
                setChatMessages([
                    ...message,
                    { role: "assistant", content: text },
                ]);
                setAnsweringMsg("");
                setIsAnswering(false);
                break;
            }
            if (!isAnswering) setIsAnswering(true);

            text = text + decoder.decode(value);

            // TODO: work in vercel/ai@3.0.19
            setAnsweringMsg(text);
        }
    };

    return {
        chatMessages,
        getChatMessages,
        setChatMessages,
        setMsgSessionId,
        isAnswering,
        answeringMsg,
        chatWithRepoCode,
    };
};
