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
          <h1 id="heading" className="sm:text-8xl tracking-tighter font-[inter-med] text-white text-6xl mt-40 mb-5 text-center">
            <span className="font-[instrumentserif]">
              <AuroraText speed={2}>Organize</AuroraText>
            </span>{" "}
            your work.<br></br>Move{" "}
            <span className="font-[instrumentserif]">
              <AuroraText speed={2}>faster</AuroraText>
            </span>
            .
          </h1>
          <h1 id="sub-title" className="sm:text-md text-white font-[inter-light] text-xl text-center mb-5">
            A modern <span className="font-[inter-med]">project management tool</span> built for focused teams. <span className="font-[inter-med]">Plan</span>{" "}
            tasks, <span className="font-[inter-med]">organize</span> workflows, and{" "}
            <span className="font-[inter-med]">track</span> progress without the
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
          <div className="h-63 w-112 xs:h-72 xs:w-128 sm:h-90 sm:w-160 md:h-108 md:w-192 lg:h-153 lg:w-272 xl:h-180 xl:w-320 transition-all duration-100 relative overflow-hidden">
            <Image
              src="/images/pic.png"
              alt="image"
              fill
              className="object-cover "
            ></Image>
          </div>
        </motion.div>
      </div>
    </FadeContent>
  );
};

export default Page;
