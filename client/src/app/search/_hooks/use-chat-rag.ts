import { useShallow } from "zustand/react/shallow";
import { ChatRecordStore, useChatStore } from "../../_store/gpt-store";
import { Message } from "@/lib/types/gpt";
import { RepoStore, useRepoStore } from "../../_store/repo-store";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

const chatSelector = (state: ChatRecordStore) => ({
    chatMessages: state.chatMessages,
    getChatMessages: state.getChatMessages,
    setChatMessages: state.setChatMessages,
    getMsgSessionId: state.getMsgSessionId,
    isAnswering: state.isAnswering,
    setIsAnswering: state.setIsAnswering,
    answeringMsg: state.answeringMsg,
    setAnsweringMsg: state.setAnsweringMsg,
});

const repoSelector = (state: RepoStore) => ({
    repoList: state.repoList,
    isInitRepo: state.isInitRepo,
    setInitRepoFlag: state.setInitRepoFlag,
});

export const useChatRag = () => {
    const {
        chatMessages,
        getChatMessages,
        setChatMessages,
        getMsgSessionId,
        isAnswering,
        setIsAnswering,
        answeringMsg,
        setAnsweringMsg,
    } = useChatStore(useShallow(chatSelector));

    const { repoList, isInitRepo, setInitRepoFlag } = useRepoStore(
        useShallow(repoSelector)
    );

    const searchParams = useSearchParams();
    const searchQuery = searchParams.get("search_query") as string;

    const chatWithRagResult = async (query: string) => {
        const userQueryMessage = { role: "user", content: query } as Message;

        const messages = getChatMessages();
        const msgSessionId = getMsgSessionId();

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

    // init
    useEffect(() => {
        if (repoList.length && isInitRepo && !isAnswering) {
            chatWithRagResult(searchQuery).then(() => {
                setInitRepoFlag(false);
            });
        }
    }, [repoList]);

    return {
        chatMessages,
        getChatMessages,
        setChatMessages,
        isAnswering,
        answeringMsg,
        chatWithRagResult,
    };
};
