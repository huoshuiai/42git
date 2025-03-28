import { Message } from "@/lib/types/gpt";
import { create } from "zustand";

export type ChatRecordStore = {
    chatMessages: Message[];
    getChatMessages: () => Message[];
    setChatMessages: (chatMessages: Message[]) => void;
    messageSessionId: string;
    getMsgSessionId: () => string;
    setMsgSessionId: (messageSessionId: string) => void;

    isAnswering: boolean;
    setIsAnswering: (isAnswering: boolean) => void;
    answeringMsg: string;
    setAnsweringMsg: (answeringMsg: string) => void;
};

export const useChatStore = create<ChatRecordStore>()((set, get) => ({
    chatMessages: [],
    getChatMessages: () => get().chatMessages,
    setChatMessages: (chatMessages: Message[]) => set({ chatMessages }),
    messageSessionId: "",
    getMsgSessionId: () => get().messageSessionId,
    setMsgSessionId: (messageSessionId: string) => set({ messageSessionId }),
    isAnswering: false,
    setIsAnswering: (isAnswering: boolean) => set({ isAnswering }),
    answeringMsg: "",
    setAnsweringMsg: (answeringMsg: string) => set({ answeringMsg }),
}));

export const useChatRepos = () => {
    const {
        getChatMessages,
        setChatMessages,
        getMsgSessionId,
        isAnswering,
        setIsAnswering,
        answeringMsg,
        setAnsweringMsg,
    } = useChatStore((state) => ({
        getChatMessages: state.getChatMessages,
        setChatMessages: state.setChatMessages,
        getMsgSessionId: state.getMsgSessionId,
        isAnswering: state.isAnswering,
        setIsAnswering: state.setIsAnswering,
        answeringMsg: state.answeringMsg,
        setAnsweringMsg: state.setAnsweringMsg,
    }));

    const repoSearchEngine = async (query: string) => {
        const userQueryMessage = { role: "user", content: query } as Message;

        const messages = getChatMessages();
        const msgSessionId = getMsgSessionId();
        console.log(`---current msgSessionId in store:${msgSessionId}`);
        setChatMessages([...messages, userQueryMessage]);
        setAnsweringMsg("");
        setIsAnswering(true);
        const stream = await fetch("/api/search/chat", {
            method: "post",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ userQueryMessage, msgSessionId }),
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
        getChatMessages,
        setChatMessages,
        isAnswering,
        answeringMsg,
        repoSearchEngine,
    };
};
