import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
    CHAT_SESSION_FLAG,
    // NEXT_PUBLIC_API_URL,
    PAGE_LOAD_TIMESTAMP_FLAG,
} from "@/lib/const";
import { v4 as uuidv4 } from "uuid";

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
    return NextResponse.next();
    // const cookieStore = cookies();
    // let sessionId = cookieStore.get(CHAT_SESSION_FLAG)?.value;
    // const pageLoadTimestamp = cookieStore.get(PAGE_LOAD_TIMESTAMP_FLAG)?.value;
    // const currentTimestamp = new Date().getTime().toString();
    // const modifiedResponse = NextResponse.next();
    // if (
    //     !sessionId ||
    //     !pageLoadTimestamp ||
    //     pageLoadTimestamp !== currentTimestamp
    // ) {
    //     sessionId = uuidv4();
    //     modifiedResponse.cookies.set(CHAT_SESSION_FLAG, sessionId);
    //     modifiedResponse.cookies.set(
    //         PAGE_LOAD_TIMESTAMP_FLAG,
    //         currentTimestamp
    //     );
    // }

    // return modifiedResponse;
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: ["/search", "/repo/:path*"],
};
