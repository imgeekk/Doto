"use client";

import { WaveLoader } from "@/components/wave-loader";

const Loading = () => {
  return (
    <div className="h-screen flex items-center justify-center">
      <WaveLoader />
    </div>
  );
};

export default Loading;
