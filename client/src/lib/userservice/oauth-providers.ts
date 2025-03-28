import { GitHub, Google } from "arctic";

export const githubOAuthClient = new GitHub(
    process.env.GITHUB_CLIENT_ID!,
    process.env.GITHUB_CLIENT_SECRET!
    // {
    //     redirectURI: "/api/auth/github/callback",
    //     enterpriseDomain: process.env.NEXT_PUBLIC_URL,
    // }
);

export const googleOAuthClient = new Google(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    process.env.NEXT_PUBLIC_URL + "/api/auth/google/callback"
);
