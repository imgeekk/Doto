"use client";
import { BsFilter, BsFilterRight, BsGraphUp } from "react-icons/bs";

import Header from "@/components/Header";
import { ProjectsTabs } from "@/app/projects/ProjectsTab";
import { authClient } from "../lib/auth-client";
import { useEffect } from "react";
import { redirect, useRouter } from "next/navigation";
import {
  Activity,
  Clock,
  Filter,
  FilterIcon,
  FilterX,
  Plus,
} from "lucide-react";
import { useProjects } from "@/lib/hooks/useProjects";
import ProjectCard from "@/components/ProjectCard";
import ModifiedClassicLoader from "@/components/loader";
import RippleWaveLoader from "@/components/ui/ripple-loader";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button-1";
import { useDashboard } from "@/lib/hooks/useDashboard";
import { WaveLoader } from "@/components/wave-loader";
import TaskCard from "./TaskCard";
import { formatDistanceToNow } from "date-fns";

const ProjectClient = ({ user }: any) => {
  const router = useRouter();

  const { stats, isLoading } = useDashboard();

  const activityColor: Record<string, string> = {
    TASK_CREATED: "bg-blue-400 dark:bg-blue-500",
    TASK_DELETED: "bg-red-400 dark:bg-red-600",
    TASK_COMPLETED: "bg-green-400 dark:bg-green-500",
    TASK_REOPENED: "bg-yellow-400 dark:bg-yellow-500",
    PROJECT_CREATED: "bg-purple-400 dark:bg-purple-500",
    PROJECT_DELETED: "bg-red-400 dark:bg-red-600",
  };

  return (
    <div className="h-screen font-[inter] flex flex-col">
      <main className="flex-1 w-full min-h-0 flex max-lg:flex-col">
        <Header visible={true} className="p-0 sm:px-0 lg:hidden" />
        <aside className="max-lg:hidden w-64 border-r-1 flex flex-col items-start p-3">
          <Header visible={true} className="p-0 sm:px-0" />
          <h1 className="text-xl">{user.name}</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {user.email}
          </p>
          <p></p>
        </aside>
        <main className="flex-1 flex flex-col p-5 md:pt-15">
          <header className="font-[inter-med] text-[25px] mb-2">
            Your Workspace
          </header>
          <section
            id="stats-section"
            className="my-7 2xl:w-[60%] grid max-sm:grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5"
          >
            <Card className="h-20 px-5 py-3 rounded-[4px] dark:bg-[#1F1F1F] bg-white shadow-xs dark:shadow-black border border-black/5 dark:border-white/15 shadow-gray-400 overflow-hidden">
              <section className="w-full h-full flex">
                <div className="flex-1 flex flex-col">
                  <h1 className="text-xs sm:text-sm text-black/70 dark:text-white/70">
                    Total Projects
                  </h1>
                  <h2 className="flex-1 text-2xl text-black/90 dark:text-white">
                    {isLoading ? (
                      <div className="h-8 flex items-center">
                        <WaveLoader className="w-0.5 h-2.5" />
                      </div>
                    ) : (
                      <p>{stats?.projectCount}</p>
                    )}
                  </h2>
                </div>
                <div className="px-1.5 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="45"
                    height="60"
                    className="text-black/40 dark:text-black [--color:#676767]  dark:[--color:#B5B5B5] [--stroke-color:#b2b2b2]  dark:[--stroke-color:#e5e5e5]"
                  >
                    <defs>
                      <filter
                        id="shadow"
                        x="-20%"
                        y="-20%"
                        width="140%"
                        height="140%"
                      >
                        <feDropShadow
                          dx="0"
                          dy="2"
                          stdDeviation="1"
                          floodColor="currentColor"
                          floodOpacity="1"
                        />
                      </filter>
                    </defs>
                    <g filter="url(#shadow)">
                      <path
                        // fill="#B5B5B5"
                        fill="var(--color)"
                        // stroke="#e5e5e5"
                        stroke="var(--stroke-color)"
                        strokeWidth="0.3"
                        d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"
                      />
                    </g>
                  </svg>
                </div>
              </section>
            </Card>
            <Card className="h-20 px-5 py-3  rounded-[4px] dark:bg-[#1F1F1F] bg-white shadow-xs dark:shadow-black border border-black/5 dark:border-white/15 shadow-gray-400 overflow-hidden">
              <section className="w-full h-full flex">
                <div className="flex-1 flex flex-col">
                  <h1 className="text-xs sm:text-sm text-black/70 dark:text-white/70">
                    Total Tasks
                  </h1>
                  <h2 className="flex-1 text-2xl text-black/90 dark:text-white">
                    {isLoading ? (
                      <div className="h-8 flex items-center">
                        <WaveLoader className="w-0.5 h-2.5" />
                      </div>
                    ) : (
                      <p>{stats?.taskCount}</p>
                    )}
                  </h2>
                </div>
                <div className="px-1 flex items-center justify-center">
                  <svg
                    fill="#000000"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    width="45"
                    height="60"
                    className="text-black/50 dark:text-black [--color:#676767]  dark:[--color:#B5B5B5] [--stroke-color:#b2b2b2]  dark:[--stroke-color:#e5e5e5]"
                  >
                    <g filter="url(#shadow)">
                      <path
                        d="M18,21a1,1,0,0,0,1-1V7L15,3H6A1,1,0,0,0,5,4V20a1,1,0,0,0,1,1Z"
                        fill="var(--color)"
                        stroke="var(--stroke-color)"
                        strokeWidth="0.3"
                      />

                      <polyline
                        points="15 3 15 7 19 7"
                        fill="#DEDEDE"
                        stroke="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                      />
                    </g>
                  </svg>
                </div>
              </section>
            </Card>
            <Card className="h-20 px-5 py-3  rounded-[4px] dark:bg-[#1F1F1F] bg-white shadow-xs dark:shadow-black border border-black/5 dark:border-white/15 shadow-gray-400 overflow-hidden">
              <section className="w-full h-full flex">
                <div className="flex-1 flex flex-col">
                  <h1 className="text-xs sm:text-sm text-black/70 dark:text-white/70">
                    Completed Tasks
                  </h1>
                  <h2 className="flex-1 text-2xl text-black/90 dark:text-white">
                    {isLoading ? (
                      <div className="h-8 flex items-center">
                        <WaveLoader className="w-0.5 h-2.5" />
                      </div>
                    ) : (
                      <p>{stats?.completedTaskCount}</p>
                    )}
                  </h2>
                </div>
                <div className="px-1 flex items-center justify-center">
                  <svg
                    fill="#000000"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    width="45"
                    height="60"
                    className="text-black/50 dark:text-black [--color:#676767]  dark:[--color:#B5B5B5] [--stroke-color:#b2b2b2]  dark:[--stroke-color:#e5e5e5]"
                  >
                    <g filter="url(#shadow)">
                      <path
                        d="M18,21a1,1,0,0,0,1-1V7L15,3H6A1,1,0,0,0,5,4V20a1,1,0,0,0,1,1Z"
                        fill="var(--color)"
                        stroke="var(--stroke-color)"
                        strokeWidth="0.3"
                      />
                      <polyline
                        points="14 10.67 11.33 13.33 10 12"
                        fill="none"
                        stroke="#DEDEDE"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                      />

                      <polyline
                        points="15 3 15 7 19 7"
                        fill="#DEDEDE"
                        stroke="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                      />
                    </g>
                  </svg>
                </div>
              </section>
            </Card>
          </section>
          <section className="flex flex-col lg:flex-row lg:gap-5">
            <Card className="flex-2/3 mb-7 p-5 h-60 max-h-70 overflow-hidden flex flex-col rounded-[4px] dark:bg-[#1F1F1F] bg-white shadow-xs dark:shadow-black border border-black/5 dark:border-white/15 shadow-gray-400">
              <header className="mb-3">
                <h1 className="max-sm:text-sm font-[inter-med]">
                  Todays Tasks
                </h1>
              </header>
              {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                  <WaveLoader />
                </div>
              ) : (
                <section className="flex-1 min-h-0 flex flex-col">
                  <header className="flex text-xs mb-1 text-black/40 dark:text-white/40">
                    <h1 className="flex-3/6">Task</h1>
                    <h1 className="flex-2/6">Project</h1>
                    <h1 className="flex-1/6">Due</h1>
                  </header>
                  <section
                    id="task-scrollable-section"
                    className="flex-1 min-h-0 overflow-y-auto pr-2 flex flex-col gap-3"
                  >
                    {stats?.dueTodayTasks.map((task: any) => (
                      <TaskCard task={task} />
                    ))}
                    <Card className="flex gap-3 text-[13px] p-2 rounded-sm dark:bg-white/10 bg-zinc-100  border-none">
                      <h1 className="flex-3/6 flex max-sm:gap-0.5">
                        <svg
                          fill="#000000"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                          width="30"
                          height="20"
                          className="text-black/50 dark:text-black [--color:#676767]  dark:[--color:#B5B5B5] [--stroke-color:#b2b2b2]  dark:[--stroke-color:#e5e5e5]"
                        >
                          <g>
                            <path
                              d="M18,21a1,1,0,0,0,1-1V7L15,3H6A1,1,0,0,0,5,4V20a1,1,0,0,0,1,1Z"
                              fill="var(--color)"
                            />

                            <polyline
                              points="15 3 15 7 19 7"
                              fill="#DEDEDE"
                              stroke="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1.5"
                            />
                          </g>
                        </svg>
                        Do the first legend first of a cream bun
                      </h1>
                      <h1 className="flex-2/6 flex gap-1.5">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          width="20"
                          height="20"
                          className="text-black/40 dark:text-black [--color:#676767]  dark:[--color:#B5B5B5] [--stroke-color:#b2b2b2]  dark:[--stroke-color:#e5e5e5]"
                        >
                          <g>
                            <path
                              fill="#4097B5"
                              d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"
                            />
                          </g>
                        </svg>
                        Do the Saas
                      </h1>
                      <h1 className="flex-1/6 text-xs">16 Mar 2026</h1>
                    </Card>
                    <Card className="flex gap-3 text-[13px] p-2 rounded-sm dark:bg-white/10 bg-zinc-100  border-none">
                      <h1 className="flex-3/6 flex max-sm:gap-0.5">
                        <svg
                          fill="#000000"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                          width="30"
                          height="20"
                          className="text-black/50 dark:text-black [--color:#676767]  dark:[--color:#B5B5B5] [--stroke-color:#b2b2b2]  dark:[--stroke-color:#e5e5e5]"
                        >
                          <g>
                            <path
                              d="M18,21a1,1,0,0,0,1-1V7L15,3H6A1,1,0,0,0,5,4V20a1,1,0,0,0,1,1Z"
                              fill="var(--color)"
                            />

                            <polyline
                              points="15 3 15 7 19 7"
                              fill="#DEDEDE"
                              stroke="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1.5"
                            />
                          </g>
                        </svg>
                        Do the first legend first of a cream bun
                      </h1>
                      <h1 className="flex-2/6 flex gap-1.5">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          width="20"
                          height="20"
                          className="text-black/40 dark:text-black [--color:#676767]  dark:[--color:#B5B5B5] [--stroke-color:#b2b2b2]  dark:[--stroke-color:#e5e5e5]"
                        >
                          <g>
                            <path
                              fill="#7251C6"
                              d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"
                            />
                          </g>
                        </svg>
                        Do the Saas
                      </h1>
                      <h1 className="flex-1/6 text-xs">16 Mar 2026</h1>
                    </Card>
                    <Card className="flex gap-3 text-[13px] p-2 rounded-sm dark:bg-white/10 bg-zinc-100  border-none">
                      <h1 className="flex-3/6 flex max-sm:gap-0.5">
                        <svg
                          fill="#000000"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                          width="30"
                          height="20"
                          className="text-black/50 dark:text-black [--color:#676767]  dark:[--color:#B5B5B5] [--stroke-color:#b2b2b2]  dark:[--stroke-color:#e5e5e5]"
                        >
                          <g>
                            <path
                              d="M18,21a1,1,0,0,0,1-1V7L15,3H6A1,1,0,0,0,5,4V20a1,1,0,0,0,1,1Z"
                              fill="var(--color)"
                            />

                            <polyline
                              points="15 3 15 7 19 7"
                              fill="#DEDEDE"
                              stroke="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1.5"
                            />
                          </g>
                        </svg>
                        Do the first legend first of a cream bun
                      </h1>
                      <h1 className="flex-2/6 flex gap-1.5">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          width="20"
                          height="20"
                          className="text-black/40 dark:text-black [--color:#676767]  dark:[--color:#B5B5B5] [--stroke-color:#b2b2b2]  dark:[--stroke-color:#e5e5e5]"
                        >
                          <g>
                            <path
                              fill="var(--color)"
                              d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"
                            />
                          </g>
                        </svg>
                        Do the deed
                      </h1>
                      <h1 className="flex-1/6 text-xs">16 Mar 2026</h1>
                    </Card>
                  </section>
                </section>
              )}
            </Card>

            <Card className="flex-1/3 mb-7 p-5 h-60 max-h-60 overflow-hidden flex flex-col rounded-[4px] dark:bg-[#1F1F1F] bg-white shadow-xs dark:shadow-black border border-black/5 dark:border-white/15 shadow-gray-400">
              <header className="mb-3">
                <h1 className="max-sm:text-sm font-[inter-med] flex items-center gap-2">
                  <BsGraphUp size={13} />
                  Recent activity
                </h1>
              </header>
              {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                  <WaveLoader className="w-1.5 h-4" />
                </div>
              ) : stats?.recentActivity.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-sm dark:text-white/50 text-black/50">
                  No recent activity
                </div>
              ) : (
                <section
                  id="scrollable-content"
                  className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2"
                >
                  {stats?.recentActivity.map((activity) => (
                    <div className="flex mb-1 gap-2">
                      <div className="flex items-start justify-center">
                        <div
                          className={`${activityColor[activity.type]} h-full w-1`}
                        ></div>
                      </div>
                      <div>
                        <p className="flex-2/3 flex items-center gap-2 text-[14px] dark:text-white/90 text-black/90">
                          {activity.message}
                        </p>
                        <h1 className="flex-1/3 text-xs dark:text-white/50 text-black/50">
                          {formatDistanceToNow(new Date(activity.createdAt), {
                            addSuffix: true,
                          })}
                        </h1>
                      </div>
                    </div>
                  ))}
                </section>
              )}
            </Card>
          </section>
          <Card className="relative flex-1 min-h-0 rounded-[4px] dark:bg-[#1F1F1F] bg-white shadow-xs dark:shadow-black border border-black/5 dark:border-white/15 shadow-gray-400">
            <ProjectsTabs userId={user.id} />
          </Card>
        </main>
        {/* <div className="mt-10">
          <button onClick={handleClick} className="flex hover:cursor-pointer">
            <Plus />
            Create Project
          </button>
        </div> */}
      </main>
    </div>
  );
};

export default ProjectClient;
