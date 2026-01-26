import Header from "@/components/Header";
import React from "react";
import Sidebar from "./components/Sidebar";
import RightSidebar from "./components/RightSidebar";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-screen flex flex-col font-[inter]">
      <Header visible={true}></Header>
      <div className="flex flex-1 justify-between overflow-hidden">
        <Sidebar />
        <main className="w-full p-3">{children}</main>
        <RightSidebar />
      </div>
    </div>
  );
};

export default layout;
