"use client";
import React, { useEffect, useState } from "react";

const typingRate = 150;
const text =
    "New Era AI Opensource Search Engine for high quality of opensource repository";

export default function TypingDesacription() {
    const [descText, setDescText] = useState(" ");
    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (index < text.length) {
            const timer = setTimeout(() => {
                setDescText((prev) => prev + text[index]);
                setIndex((prev) => prev + 1);
            }, typingRate);

            return () => clearTimeout(timer);
        }
    }, [index]);

    return <div className="text-xl h-5">{descText}</div>;
}
