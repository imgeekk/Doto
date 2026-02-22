"use client";

import Image from "next/image";
import { AuroraText } from "@/components/magicui/aurora-text";
import { GradientButton } from "@/components/ui/gradient-button";
import Link from "next/link";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import FadeContent from "@/components/FadeContent";

const Page = () => {
  return (
    <FadeContent
      blur={true}
      duration={100}
      easing="ease-out"
      initialOpacity={30}
    >
      <div className="min-h-screen bg-[url(/images/image2.png)] bg-no-repeat bg-center bg-cover flex flex-col items-center justify-between">
        <header className="w-full">
          <Header visible={false} className="text-white" />
        </header>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 100 }}
          transition={{ duration: 1 }}
          className="w-full flex flex-col items-center"
        >
          <h1 id="heading" className="sm:text-8xl tracking-tighter font-[inter-bold] text-white text-6xl mt-40 mb-5 text-center">
            <span className="font-[instrumentserif]">
              <AuroraText speed={2}>Organize</AuroraText>
            </span>{" "}
            your work.<br></br>Move{" "}
            <span className="font-[instrumentserif]">
              <AuroraText speed={2}>faster</AuroraText>
            </span>
            .
          </h1>
          <h1 id="sub-title" className="sm:text-md text-white/70 font-[inter] text-xl text-center mb-5">
            A modern <span className="text-white">project management tool</span> built for focused teams. <span className="text-white">Plan</span>{" "}
            tasks, <span className="text-white">organize</span> workflows, and{" "}
            <span className="text-white">track</span> progress without the
            clutter.
          </h1>
          <div className="flex justify-center mb-4">
            <Link href="/signup">
              <GradientButton
                variant="variant"
                className="font-[inter] text-xl"
              >
                Get Started
              </GradientButton>
            </Link>
          </div>
          <div className="h-[90vh] sm:w-[90%] w-full relative overflow-hidden">
            <Image
              src="/images/pic.jpg"
              alt="image"
              fill
              className="object-cover fade-bottom"
            ></Image>
          </div>
        </motion.div>
      </div>
    </FadeContent>
  );
};

export default Page;
