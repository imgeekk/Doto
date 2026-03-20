"use client";
import { BsGraphUp } from "react-icons/bs";
import Header from "@/components/Header";
import { ProjectsTabs } from "@/app/projects/ProjectsTab";
import { useRouter } from "next/navigation";
import { useProjects } from "@/lib/hooks/useProjects";
import { Card } from "@/components/ui/card";
import { useDashboard } from "@/lib/hooks/useDashboard";
import TaskCard from "./TaskCard";
import { formatDistanceToNow } from "date-fns";

// ─── Skeleton Primitives ────────────────────────────────────────────────────

const shimmer =
  "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent";

function SkeletonBox({
  className = "",
  rounded = "rounded-sm",
}: {
  className?: string;
  rounded?: string;
}) {
  return (
    <div
      className={`bg-black/8 dark:bg-white/8 ${rounded} ${shimmer} ${className}`}
    />
  );
}

// ─── Stat Card Skeleton ──────────────────────────────────────────────────────

function StatCardSkeleton() {
  return (
    <Card className="h-20 px-5 py-3 rounded-[4px] dark:bg-[#1F1F1F] bg-white shadow-xs dark:shadow-black border border-black/5 dark:border-white/15 shadow-gray-400 overflow-hidden">
      <section className="w-full h-full flex items-center gap-3">
        <div className="flex-1 flex flex-col gap-2">
          <SkeletonBox className="h-3 w-24" />
          <SkeletonBox className="h-6 w-10" />
        </div>
        <SkeletonBox className="h-10 w-10 rounded-md" />
      </section>
    </Card>
  );
}

// ─── Stat Card Real ──────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number | undefined;
  icon: React.ReactNode;
}) {
  return (
    <Card className="h-20 px-5 py-3 rounded-[4px] dark:bg-[#1F1F1F] bg-white shadow-xs dark:shadow-black border border-black/5 dark:border-white/15 shadow-gray-400 overflow-hidden">
      <section className="w-full h-full flex">
        <div className="flex-1 flex flex-col">
          <h1 className="text-xs sm:text-sm text-black/70 dark:text-white/70">
            {label}
          </h1>
          <h2 className="flex-1 text-2xl text-black/90 dark:text-white">
            {value}
          </h2>
        </div>
        <div className="px-1 flex items-center justify-center">{icon}</div>
      </section>
    </Card>
  );
}

// ─── Task Row Skeleton ────────────────────────────────────────────────────────

function TaskRowSkeleton() {
  return (
    <div className="flex gap-3 text-[13px] p-2 rounded-sm dark:bg-white/5 bg-zinc-100 items-center">
      <div className="flex-3/6 flex items-center gap-2">
        <SkeletonBox className="h-4 w-4 flex-shrink-0 rounded-sm" />
        <SkeletonBox className="h-3 w-full max-w-[160px]" />
      </div>
      <div className="flex-2/6 flex items-center gap-2">
        <SkeletonBox className="h-4 w-4 flex-shrink-0 rounded-sm" />
        <SkeletonBox className="h-3 w-16" />
      </div>
      <SkeletonBox className="flex-1/6 h-3 w-14" />
    </div>
  );
}

// ─── Activity Row Skeleton ────────────────────────────────────────────────────

function ActivityRowSkeleton() {
  return (
    <div className="flex gap-3">
      <div className="flex items-start justify-center pt-1">
        <SkeletonBox className="h-full w-1 min-h-[40px] rounded-full" />
      </div>
      <div className="flex flex-col gap-1.5 flex-1">
        <SkeletonBox className="h-3.5 w-full max-w-[200px]" />
        <SkeletonBox className="h-2.5 w-20" />
      </div>
    </div>
  );
}

// ─── Projects List Skeleton ───────────────────────────────────────────────────

function ProjectsListSkeleton() {
  return (
    <div className="flex flex-col gap-3 pt-1">
      <div className="flex gap-2 mb-2">
        {[80, 64, 72].map((w, i) => (
          <SkeletonBox
            key={i}
            className={`h-7 w-${w === 80 ? "20" : w === 64 ? "16" : "18"} rounded-full`}
          />
        ))}
      </div>
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-2 rounded-sm dark:bg-white/5 bg-zinc-50"
        >
          <SkeletonBox className="h-5 w-5 rounded-sm flex-shrink-0" />
          <div className="flex-1 flex flex-col gap-1.5">
            <SkeletonBox className={`h-3 w-${i % 2 === 0 ? "40" : "32"}`} />
            <SkeletonBox className="h-2.5 w-20" />
          </div>
          <SkeletonBox className="h-5 w-12 rounded-full" />
        </div>
      ))}
    </div>
  );
}

// ─── SVG Icons ───────────────────────────────────────────────────────────────

const FolderIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="45"
    height="60"
    className="text-black/40 dark:text-black [--color:#676767]  dark:[--color:#B5B5B5] [--stroke-color:#b2b2b2]  dark:[--stroke-color:#e5e5e5]"
  >
    <defs>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
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
);

const FileIcon = () => (
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
);

const CheckFileIcon = () => (
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
);

// ─── Activity color map ───────────────────────────────────────────────────────

const activityColor: Record<string, string> = {
  TASK_CREATED: "bg-blue-400 dark:bg-blue-500",
  TASK_DELETED: "bg-red-400 dark:bg-red-600",
  TASK_COMPLETED: "bg-green-400 dark:bg-green-500",
  TASK_REOPENED: "bg-yellow-400 dark:bg-yellow-500",
  PROJECT_CREATED: "bg-purple-400 dark:bg-purple-500",
  PROJECT_DELETED: "bg-red-400 dark:bg-red-600",
};

// ─── Main Component ───────────────────────────────────────────────────────────

const ProjectClient = ({ user }: any) => {
  const router = useRouter();
  const { stats, isLoading } = useDashboard();

  // Treat "not loading but no data yet" as still loading — prevents flash
  // on the tick between mount and when useDashboard sets isLoading=true
  const loading = isLoading || stats === undefined;

  return (
    <>
      {/* Shimmer keyframe injected once */}
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>

      <div className="h-screen font-[inter] flex flex-col">
        <main className="flex-1 w-full min-h-0 flex max-lg:flex-col">
          <Header visible={true} className="p-0 sm:px-0 lg:hidden" />

          {/* Sidebar */}
          <aside className="max-lg:hidden w-64 border-r-1 flex flex-col items-start p-3">
            <Header visible={true} className="p-0 sm:px-0" />
            <h1 className="text-xl">{user.name}</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {user.email}
            </p>
          </aside>

          {/* Content */}
          <main className="flex-1 flex flex-col p-5 md:pt-15">
            <header className="font-[inter-med] text-[25px] mb-2">
              Your Workspace
            </header>

            {/* Stat Cards */}
            <section className="my-7 2xl:w-[60%] grid grid-cols-2 sm:grid-cols-3 gap-5">
              {loading ? (
                <>
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                </>
              ) : (
                <>
                  <StatCard
                    label="Total Projects"
                    value={stats?.projectCount}
                    icon={<FolderIcon />}
                  />
                  <StatCard
                    label="Total Tasks"
                    value={stats?.taskCount}
                    icon={<FileIcon />}
                  />
                  <StatCard
                    label="Completed Tasks"
                    value={stats?.completedTaskCount}
                    icon={<CheckFileIcon />}
                  />
                </>
              )}
            </section>

            {/* Today's Tasks + Recent Activity */}
            <section className="flex flex-col lg:flex-row lg:gap-5">
              {/* Today's Tasks */}
              <Card className="lg:w-2/3 mb-7 p-5 h-60 max-h-70 overflow-hidden flex flex-col rounded-[4px] dark:bg-[#1F1F1F] bg-white shadow-xs dark:shadow-black border border-black/5 dark:border-white/15 shadow-gray-400">
                <header className="mb-3">
                  <h1 className="max-sm:text-sm font-[inter-med]">
                    Todays Tasks
                  </h1>
                </header>

                {loading ? (
                  <div className="flex-1 flex flex-col gap-3 overflow-hidden">
                    <div className="flex text-xs mb-1">
                      <SkeletonBox className="h-3 w-12 flex-3/6" />
                      <SkeletonBox className="h-3 w-12 flex-2/6 mx-2" />
                      <SkeletonBox className="h-3 w-8 flex-1/6" />
                    </div>
                    {[...Array(4)].map((_, i) => (
                      <TaskRowSkeleton key={i} />
                    ))}
                  </div>
                ) : (
                  stats.dueTodayTasks.length === 0 ? (
                    <div className="w-full h-full flex items-center justify-center text-black/40 dark:text-white/40 text-sm">No tasks due today</div>
                  ): (<section className="flex-1 min-h-0 flex flex-col">
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
                        <TaskCard key={task.id} task={task} />
                      ))}
                    </section>
                  </section>)
                )}
              </Card>

              {/* Recent Activity */}
              <Card className="lg:w-1/3 mb-7 p-5 h-60 max-h-60 overflow-hidden flex flex-col rounded-[4px] dark:bg-[#1F1F1F] bg-white shadow-xs dark:shadow-black border border-black/5 dark:border-white/15 shadow-gray-400">
                <header className="mb-3">
                  <h1 className="max-sm:text-sm font-[inter-med] flex items-center gap-2">
                    <BsGraphUp size={13} />
                    Recent activity
                  </h1>
                </header>

                {loading ? (
                  <section className="flex-1 min-h-0 overflow-hidden flex flex-col gap-3">
                    {[...Array(4)].map((_, i) => (
                      <ActivityRowSkeleton key={i} />
                    ))}
                  </section>
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
                      <div key={activity.id} className="flex mb-1 gap-3">
                        <div className="flex items-start justify-center">
                          <div
                            className={`${activityColor[activity.type]} h-full w-1`}
                          />
                        </div>
                        <div>
                          <p className="text-[14px] dark:text-white/90 text-black/90">
                            {activity.message}
                          </p>
                          <h1 className="text-xs dark:text-white/50 text-black/50">
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

            {/* Projects List */}
            <Card className="p-5 flex-1 min-h-0 overflow-hidden flex flex-col rounded-[4px] dark:bg-[#1F1F1F] bg-white shadow-xs dark:shadow-black border border-black/5 dark:border-white/15 shadow-gray-400">
              <header className="mb-3">
                <h1 className="max-sm:text-sm font-[inter-med]">
                  Projects List
                </h1>
              </header>

              {loading ? (
                <ProjectsListSkeleton />
              ) : (
                <ProjectsTabs userId={user.id} />
              )}
            </Card>
          </main>
        </main>
      </div>
    </>
  );
};

export default ProjectClient;
