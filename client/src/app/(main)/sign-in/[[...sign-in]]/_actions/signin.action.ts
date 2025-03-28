"use server";

import { lucia } from "@/lib/userservice/lucia";
import {
    githubOAuthClient,
    googleOAuthClient,
} from "@/lib/userservice/oauth-providers";
import { generateState, generateCodeVerifier } from "arctic";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const getGoogleOauthConsentUrl = async () => {
    try {
        const state = generateState();
        const codeVerifier = generateCodeVerifier();

        cookies().set("codeVerifier", codeVerifier, {
            httpOnly: true,
            secure: process.env.NODE_ENV == "production",
        });

        cookies().set("state", state, {
            httpOnly: true,
            secure: process.env.NODE_ENV == "production",
        });

        const authUrl = await googleOAuthClient.createAuthorizationURL(
            state,
            codeVerifier,
            {
                scopes: ["email", "profile"],
            }
        );
        console.log("---getGoogleOauthConsentUrl:", authUrl);

        return { success: true, url: authUrl.toString() };
    } catch (err) {
        return {
            success: false,
            error: `Something wrong while Google OAuth, err:${err}`,
        };
    }
};

export const getGithubOathConsentUrl = async () => {
    const state = generateState();
    const codeVerifier = generateCodeVerifier();

    cookies().set("codeVerifier", codeVerifier, {
        httpOnly: true,
        secure: process.env.NODE_ENV == "production",
    });

    cookies().set("state", state, {
        httpOnly: true,
        secure: process.env.NODE_ENV == "production",
    });
    const authUrl = await githubOAuthClient.createAuthorizationURL(state, {
        scopes: ["user"],
    });
    console.log("---getGithubOathConsentUrl:", authUrl);

    return { success: true, url: authUrl.toString() };
};

export const login = async ({
    email,
    password,
}: {
    email: string;
    password: string;
}) => {
    console.log(`email: ${email}, password:${password}`);
    // TODO: Login/Signin logic
};

export const logout = async () => {
    const sessionCookie = await lucia.createBlankSessionCookie();
    cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
    );

    return redirect("/sign-in");
};
