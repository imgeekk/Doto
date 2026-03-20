import { Card } from "@/components/ui/card";
import { Column, Task } from "@/config/model";

const TaskCard = ({
  task,
}: {
  task: Task & { column: Column & { project: { title: string } } };
}) => {
  return (
    <Card className="flex gap-4 text-[13px] p-2 rounded-sm dark:bg-white/5 bg-zinc-100 border-none items-center">
      <h1 className="flex-3/6 flex items-center gap-2 truncate whitespace-nowrap">
        <svg
          fill="#000000"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          className="flex-shrink-0 [--color:#676767] dark:[--color:#B5B5B5]"
        >
          <g>
            <path d="M18,21a1,1,0,0,0,1-1V7L15,3H6A1,1,0,0,0,5,4V20a1,1,0,0,0,1,1Z" fill="var(--color)" />
            <polyline points="15 3 15 7 19 7" fill="#DEDEDE" stroke="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </g>
        </svg>
        <span className="">{task.title}</span>
      </h1>

      <h1 className="flex-2/6 flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="16"
          height="16"
          className="flex-shrink-0"
        >
          <g>
            <path fill="#A742B0" d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
          </g>
        </svg>
        <span className="truncate">{task.column.project.title}</span>
      </h1>

      <h1 className="flex-1/6 text-xs text-black/70 dark:text-white/70">
        {task.dueDate?.toDateString()}
      </h1>
    </Card>
  );
};

export default TaskCard;