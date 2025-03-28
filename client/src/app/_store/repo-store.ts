import { Repo } from "@/lib/types/repo";
import { create } from "zustand";

export type RepoStore = {
    repoList: Repo[];
    setRepoList: (repoList: Repo[]) => void;
    isInitRepo: boolean;
    setInitRepoFlag: (isInitRepo: boolean) => void;
};

export const useRepoStore = create<RepoStore>()((set) => ({
    repoList: [],
    setRepoList: (repoList: Repo[]) => set({ repoList }),
    isInitRepo: false,
    setInitRepoFlag: (isInitRepo: boolean) => set({ isInitRepo }),
}));
