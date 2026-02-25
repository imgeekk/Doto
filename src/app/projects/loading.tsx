"use client";

import RippleWaveLoader from "@/components/ui/ripple-loader";

const Loading = () => {
  return (
    <div className="h-screen w-full flex items-center justify-center">
      <RippleWaveLoader />
    </div>
  );
};

export default Loading;
