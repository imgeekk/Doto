"use client";

import RippleWaveLoader from "@/components/ui/ripple-loader";
import { WaveLoader } from "@/components/wave-loader";

const Loading = () => {
  return (
    <div className="h-screen w-full flex items-center justify-center">
      <WaveLoader/>
    </div>
  );
};

export default Loading;
