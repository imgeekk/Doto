"use client";

import Header from "@/components/Header";
import { FaArrowRight } from "react-icons/fa";

const page = () => {
  return (
    <div className="min-h-screen font-[monument] flex flex-col items-center">
      <Header visible={true} />
      <main className="p-5 w-full md:w-[80%] lg:w-[70%] xl:w-[60%] mt-5 text-md sm:text-lg">
        <header className="mb-5">
          <h1 className="text-2xl">Create a new Project</h1>
        </header>
        <label className="px-2">Project Name</label>
        <input
          type="text"
          placeholder="Name of project"
          onChange={(e) => {}}
          className="flex h-9 w-full rounded-[3px] border border-zinc-300 dark:border-zinc-800 bg-background px-3 py-2 mb-4 text-foreground shadow-sm shadow-black/5 transition-shadow placeholder:text-muted-foreground/70 dark:focus-visible:border-blue-500 focus-visible:border-blue-500 focus-visible:outline-none  disabled:cursor-not-allowed disabled:opacity-50"
        />
        <label className="px-2">Description</label>
        <textarea
          placeholder="A description about the project"
          onChange={(e) => {
            e.preventDefault;
          }}
          rows={5}
          className="resize-none flex w-full rounded-[3px] border border-zinc-300 dark:border-zinc-800 bg-background px-3 py-2 text-foreground shadow-sm shadow-black/5 transition-shadow placeholder:text-muted-foreground/70 dark:focus-visible:border-blue-500 focus-visible:border-blue-500 focus-visible:outline-none  disabled:cursor-not-allowed disabled:opacity-50 mb-5"
        />
        <button
          className="flex items-center max-sm:text-sm gap-1 dark:bg-white bg-zinc-900 dark:text-zinc-800 text-zinc-50 p-1 px-2 rounded-[3px] hover:cursor-pointer"
        >
          <FaArrowRight />
          Continue
        </button>
      </main>
    </div>
  );
};

export default page;
