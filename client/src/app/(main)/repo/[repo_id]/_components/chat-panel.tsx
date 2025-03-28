"use client";

import React, { useEffect, useRef, useState } from "react";
import ChatMessage from "@/components/commons/chat/chat-message";
import { Message } from "@/lib/types/gpt";
import CustomLoader from "@/components/ui/custom-loader";
import { useChatSingleRepo } from "../_hook/use-chat-single-repo";
import ChatInput from "@/components/commons/chat/chat-input";

export default function ChatPanel({
    title,
    repoName,
}: {
    title: string;
    repoName: string;
}) {
    const {
        chatMessages,
        setMsgSessionId,
        isAnswering,
        answeringMsg,
        chatWithRepoCode,
    } = useChatSingleRepo();

    const endOfMessagesRef = useRef<HTMLDivElement>(null);
    const [initChatFlag, setInitChatFlag] = useState(false);

    useEffect(() => {
        if (endOfMessagesRef.current) {
            const scrollHeight = endOfMessagesRef.current.scrollHeight;
            const height = endOfMessagesRef.current.clientHeight;
            const maxScrollTop = scrollHeight - height;
            endOfMessagesRef.current.scrollTop =
                maxScrollTop > 0 ? maxScrollTop : 0;
        }
    }, [answeringMsg, chatMessages]); // 每當消息列表更新時，觸發滾動操作

    useEffect(() => {
        const initChat = async () => {
            const res = await fetch("/api/repo/init-chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ repoName }),
            });
            const { messageSessionId } = await res.json();
            setMsgSessionId(messageSessionId);
            console.log("init chat success!");
        };
        initChat().then((res) => {
            setInitChatFlag(true);
        });
    }, []);

    useEffect(() => {
        console.log("---ans:", answeringMsg);
    }, [answeringMsg]);

    const chatWithRepo = (userQuery: string) => {
        chatWithRepoCode(userQuery, repoName);
    };

    return (
        <>
            <div
                ref={endOfMessagesRef}
                className="flex flex-col justify-start gap-6  overflow-y-scroll h-full w-full bg-slate-200 dark:bg-slate-800 rounded-xl px-5 pb-[150px] pt-5"
            >
                {!chatMessages.length && (
                    <div className="m-auto">
                        {!initChatFlag ? (
                            <div className="m-auto">
                                <CustomLoader />
                            </div>
                        ) : (
                            `Start chatting with repository ${title}`
                        )}
                    </div>
                )}
                {chatMessages.map((msg, idx) => (
                    <ChatMessage key={idx} message={msg as Message} />
                ))}
                {isAnswering && (
                    <ChatMessage
                        message={{ role: "assistant", content: answeringMsg }}
                    />
                )}
            </div>
            <div className="sticky bottom-8 w-4/5 m-auto">
                <ChatInput
                    isAnswering={isAnswering}
                    querySubmitHandler={chatWithRepo}
                />
            </div>
        </>
    );
}
