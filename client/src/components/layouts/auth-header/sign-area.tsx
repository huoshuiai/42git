"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function SignArea() {
    const router = useRouter();
    const pathname = usePathname();

    return pathname !== "/sign-in" ? (
        <Button
            className="bg-primary hover:bg-primary-100"
            onClick={() => router.push("/sign-in")}
        >
            SignIn
        </Button>
    ) : (
        <Button
            className="bg-primary hover:bg-primary-100"
            onClick={() => router.push("/")}
        >
            Back to Search
        </Button>
    );
}
