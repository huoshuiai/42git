import React, { ReactElement, ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { okaidia } from "react-syntax-highlighter/dist/esm/styles/prism";
import CodeCopyBtn from "./code-copy-btn";
import markdownStyles from "./markdown.module.css";

export default function MarkdownRenderer({ children }: { children: string }) {
    // Add the CodeCopyBtn component to our PRE element
    const Pre = ({ children, ...props }: JSX.IntrinsicElements["pre"]) => (
        <pre {...props} className={markdownStyles.code_pre}>
            <CodeCopyBtn>{children}</CodeCopyBtn>
            {children}
        </pre>
    );

    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
                pre: Pre,
                code({ node, inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || "");

                    return !inline && match ? (
                        <SyntaxHighlighter
                            style={okaidia}
                            PreTag="div"
                            language={match[1]}
                            {...props}
                        >
                            {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                    ) : (
                        <code className={className} {...props}>
                            {children}
                        </code>
                    );
                },
            }}
        >
            {children}
        </ReactMarkdown>
    );
}
