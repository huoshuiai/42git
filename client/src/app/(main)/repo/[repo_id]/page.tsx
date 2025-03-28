import type { Metadata, ResolvingMetadata } from "next";

import ChatPanel from "./_components/chat-panel";
import { SERVER_API, githubHeader } from "@/lib/const";

type PageProps = {
    params: { repo_id: string };
    //searchParams?: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
    { params }: PageProps,
    parent: ResolvingMetadata
): Promise<Metadata> {
    // read route params
    const repo_id = params.repo_id;

    const url = `${SERVER_API}/api/v1/repo?id=${repo_id}`;
    const res = await fetch(url);
    const repo = await res.json();

    // optionally access and extend (rather than replace) parent metadata
    // const previousImages = (await parent).openGraph?.images || []

    return {
        title: `42Git-${repo.data.title}`,
        //   openGraph: {
        //     images: ['/some-specific-page-image.jpg', ...previousImages],
        //   },
    };
}

// TODO: 如果要pre-render，會需要比較多的github token來輪流fetch github repo info
export default async function Page({ params: { repo_id } }: PageProps) {
    const url = `${SERVER_API}/api/v1/repo?id=${repo_id}`;
    const res = await fetch(url);
    const repo = await res.json();
    const repoTitle = repo.data.title;
    const author = repo.data.link.split("/").at(-2);

    const repoGithubApiUrl = `https://api.github.com/repos/${author}/${repoTitle}`;
    const githubRes = await fetch(repoGithubApiUrl, {
        method: "GET",
        headers: githubHeader,
    });

    const {
        description,
        forks,
        stargazers_count,
        created_at,
        updated_at,
        html_url,
    } = await githubRes.json();

    return (
        <section className="flex flex-grow">
            <div className=" w-1/2 overflow-y-hidden max-h-[90vh]">
                <ChatPanel
                    title={repo.data.title}
                    repoName={`${author}/${repoTitle}`}
                />
            </div>
            <div className=" w-1/2 px-5 py-12 md:px-10 md:py-16 lg:py-20">
                <div className="flex w-full flex-col items-center gap-2">
                    <div>
                        <div className="inline-flex items-center bg-gray-400 rounded-md px-3 py-2">
                            <div className="mr-2 h-2 w-2 rounded-full bg-[#f28109]"></div>
                            <h2 className="text-white font-semibold ">
                                Created by {author}
                            </h2>
                        </div>

                        <h1 className="mb-6 text-4xl text-gray-700 font-bold md:text-6xl lg:mb-8">
                            {repo.data.title}
                        </h1>
                        <p className="text-sm text-[#808080] sm:text-xl">
                            {description}
                        </p>

                        <div className="mb-8 mt-8 h-px w-full bg-black"></div>
                        <div className="mb-6 flex flex-col gap-2 text-sm text-[#808080] sm:text-base lg:mb-8">
                            <p className="font-medium">
                                About This Github Repository:
                            </p>
                            <p>Stars: {stargazers_count}</p>
                            {/* <p>
                                Field: {repo.data.field}
                            </p> */}
                            <p>Created at: {created_at}</p>

                            <p>Updated at: {updated_at}</p>
                        </div>
                    </div>
                    <div className="flex flex-col font-semibold sm:flex-row">
                        <a
                            href={html_url}
                            target="_blank"
                            // className="flex  bg-[#f28109] border border-solid border-black bg-primary
                            //  text-white px-6 py-3 truncate items-center gap-2 rounded-md hover:bg-[#ee9e49]"
                            className="flex items-center justify-center bg-[#f28109] text-white min-w-[300px] px-6 py-3 md:px-8 md:py-4 
                            rounded-md border border-solid border-black hover:bg-[#ee9e49] transition-colors duration-300 ease-in-out"
                        >
                            <p> View this project on Github </p>
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}

// export async function generateStaticParams() {
//     console.log("---trigger generateStaticParams");
//     const url = `${SERVER_API}/api/v1/all_repo_id`;
//     const res = await fetch(url, {
//         method: "GET",
//     });
//     const { result } = await res.json();
//     // Generate only a subset for static generation
//     const subset = result.slice(0, 3000); // Adjust this number as needed
//     return subset.map((id: number) => ({
//         repo_id: id.toString(),
//     }));
//     console.log("---result:", result);
//     return result.map((id: any) => ({
//         id: id.toString(),
//     }));
// }
