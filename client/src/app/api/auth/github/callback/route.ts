import { lucia } from "@/lib/userservice/lucia";
import {
    githubOAuthClient,
    googleOAuthClient,
} from "@/lib/userservice/oauth-providers";
import { prisma } from "@/lib/userservice/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest, res: Response) {
    const url = req.nextUrl;
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    if (!code || !state) {
        console.error("--no code or state while Github OAuth");
        return new Response("Invalid Request", { status: 400 });
    }

    const codeVerifier = cookies().get("codeVerifier")?.value;
    const savedState = cookies().get("state")?.value;

    if (!codeVerifier || !savedState) {
        console.error("no code verifier or state");
        return new Response("Invalid Request", { status: 400 });
    }

    if (state !== savedState) {
        console.error("state mismatch");
        return new Response("Invalid Request", { status: 400 });
    }

    const { accessToken } = await githubOAuthClient.validateAuthorizationCode(
        code
    );
    const githubResponse = await fetch("https://api.github.com/user", {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
    const githubData = (await githubResponse.json()) as {
        id: string;
        name: string;
        avatar_url: string;
        email: string | null; // email might be null
    };

    let userId: string = "";
    // if the email exists in our record, we can create a cookie for them and sign them in
    // if the email doesn't exist, we create a new user, then craete cookie to sign them in
    const existingUser = await prisma.user.findUnique({
        where: {
            github_id: githubData.id.toString(),
        },
    });

    if (existingUser) {
        userId = existingUser.id;
    } else {
        const user = await prisma.user.create({
            data: {
                name: githubData.name,
                email: githubData.email || "",
                picture: githubData.avatar_url,
                github_id: githubData.id.toString(),
            },
        });
        userId = user.id;
    }
    const session = await lucia.createSession(userId, {});
    const sessionCookie = await lucia.createSessionCookie(session.id);
    cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
    );

    return redirect("/");
}
