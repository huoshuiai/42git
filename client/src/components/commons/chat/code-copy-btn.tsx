import React, { ReactElement, ReactNode, useEffect, useState } from "react";
import markdownStyles from "./markdown.module.css";
import { FaRegCopy } from "react-icons/fa6";
import { LuCopyCheck } from "react-icons/lu";

export default function CodeCopyBtn({ children }: { children: ReactNode }) {
    const [copyOk, setCopyOk] = useState(false);
    const [iconConfig, setIconConfig] = useState({
        iconColor: "#ddd",
        icon: "fa-copy",
    });

    const handleClick = (e: any) => {
        if (copyOk) return;
        //navigator.clipboard.writeText(children[0].props.children[0]);
        navigator.clipboard.writeText((children as any).props.children);

        setCopyOk(true);
        setTimeout(() => {
            setCopyOk(false);
        }, 1000);
    };
    return (
        <div className={markdownStyles.code_copy_btn} onClick={handleClick}>
            {copyOk ? <LuCopyCheck /> : <FaRegCopy />}
            {/* <i
                className={`fas ${iconConfig.icon}`}
                onClick={handleClick}
                style={{ color: iconConfig.iconColor }}
            /> */}
        </div>
    );
}
