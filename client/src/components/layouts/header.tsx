// "use client";

import React from "react";
import { ModeToggle } from "@/components/layouts/toggle-mode";
import { usePathname } from "next/navigation";
import AuthHeader from "./auth-header";

export default function Header() {
    const pathname = usePathname();
    return pathname.includes("search") ? null : (
        <div className="flex flex-row-reverse w-full items-center gap-2">
            <AuthHeader />
            <ModeToggle />
        </div>
    );
}
