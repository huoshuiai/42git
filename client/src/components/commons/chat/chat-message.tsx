import React from "react";
import { FaChalkboardUser } from "react-icons/fa6";
import { RiRobot2Line } from "react-icons/ri";

import { Message } from "@/lib/types/gpt";
import MarkdownRenderer from "./markdown-renderer";

export default function ChatMessage({ message }: { message: Message }) {
    if (message.role == "system") return null;
    return (
        <div className="flex items-start ">
            <div className="mr-4 min-w-[40px]">
                {message.role == "user" && (
                    <FaChalkboardUser className="h-[2rem] w-[2rem] scale-100 transition-all" />
                )}
                {message.role == "assistant" && (
                    <RiRobot2Line className=" h-[2rem] w-[2rem] scale-100 transition-all" />
                )}
            </div>
            <div className="max-w-[90%]">
                <MarkdownRenderer>{message.content}</MarkdownRenderer>
            </div>
        </div>
    );
}
