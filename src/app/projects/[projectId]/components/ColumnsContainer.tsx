"use client";

import DraggableColumn from "./DraggableColumn";
import ColumnForm from "./ColumnForm";
import { ColumnWithTasks } from "@/config/model";


interface ColumnContainerProps {
  projectId: string | undefined;
  data: ColumnWithTasks[];
}


const ColumnsContainer = ({ projectId, data }: ColumnContainerProps) => {

  console.log("things: \n", data[0].title)

  return (
    <ol className="flex gap-x-3 h-fit">
      
      {data.map((col, index) => (
        <DraggableColumn
          key={col.id}
          index={index}
          column={col}
        />
      ))}
      <ColumnForm />
      <div className="flex-shrink-0 w-1" />
    </ol>
  );
};

export default ColumnsContainer;
