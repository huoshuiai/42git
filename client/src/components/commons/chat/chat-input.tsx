"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { PiChatCenteredDots } from "react-icons/pi";

export default function ChatInput({
    querySubmitHandler,
    isAnswering,
    className,
    placeholder,
}: {
    querySubmitHandler: (userQuery: string) => void;
    isAnswering: boolean;
    className?: string;
    placeholder?: string;
}) {
    const [chatQuery, setChatQuery] = useState("");

    const submitQuery = () => {
        if (isAnswering || !chatQuery) return;
        setChatQuery("");
        querySubmitHandler(chatQuery);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            submitQuery();
        }
    };

    return (
        <div
            className={`hidden md:flex items-center space-x-4 max-w-3xl relative ${className}`}
        >
            <Input
                value={chatQuery}
                onChange={(e) => setChatQuery(e.target.value)}
                placeholder={placeholder}
                disabled={isAnswering}
                onKeyDown={handleKeyDown} // Adding the onKeyDown event handler
                className="text-lg border-primary focus:border-0 focus-visible:ring-primary dark:focus-visible:ring-primary"
            />
            <div
                className={`absolute right-4 bottom-3  ${
                    isAnswering ? "cursor-not-allowed" : "cursor-pointer"
                }`}
                onClick={submitQuery}
            >
                <PiChatCenteredDots className="text-primary" />
            </div>
        </div>
    );
}
