import { Card } from "@/components/ui/card";
import { Column, Task } from "@/config/model";

const TaskCard = ({ task }: { task: Task & {column: Column & {project: {title: string}}} }) => {
  return (
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
        {task.title}
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
              fill="#A742B0"
              d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"
            />
          </g>
        </svg>
        {task.column.project.title}
      </h1>
      <h1 className="flex-1/6 text-xs flex items-center">{task.dueDate?.toDateString()}</h1>
    </Card>
  );
};

export default TaskCard;
