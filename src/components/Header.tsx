"use client";

import ThemeToggler from "./ThemeToggler";
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownSeparator,
  DropdownTrigger,
} from "@/components/basic-dropdown";
import Image from "next/image";
import Link from "next/link";
import { FaRegUser } from "react-icons/fa";
import { GoProjectSymlink } from "react-icons/go";
import { PiPlusBold, PiSignOutBold } from "react-icons/pi";
import { useRouter } from "next/navigation";
import { authClient, signOut } from "@/app/lib/auth-client";
import { useState } from "react";
import { User } from "lucide-react";
import { twMerge } from 'tailwind-merge';

const Header = ({ visible, className }: { visible: Boolean; className?: string }) => {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const { data } = authClient.useSession();

  const isLoggedIn = data?.session;

  const handleClick = async () => {
    await signOut({
      fetchOptions: {
        onRequest: () => {
          setIsPending(true);
        },
        onResponse: () => {
          setIsPending(false);
        },
        onError: (error) => {
          console.error("Error during sign out:", error);
        },
        onSuccess: () => {
          router.push("/signup");
        },
      },
    });
    router.push("/signup");
  };

  return (
    <div className={twMerge("bg-white dark:bg-black/20 dark:text-white text-zinc-950 h-12 py-2 w-full flex justify-between items-center max-sm:px-5 sm:px-10", className)}>
      <Link
        href="/"
        className="flex items-center font-bold sm:text-2xl text-md font-[monument]"
      >
        <div className="h-6 w-6 relative overflow-hidden rounded-[3px] mr-2"><Image src="/images/logog.png" alt="text" fill className="object-contain"/></div>
        Doto
      </Link>

      <div className="flex gap-4 items-center leading-0">
        <div className="">
          <ThemeToggler visible={visible} />
        </div>
        {isLoggedIn && (
          <Dropdown>
            <DropdownTrigger className="cursor-pointer">
              {data.user.image ? 
              <Image
                src={data.user.image}
                alt="User avatar"
                width={100}
                height={100}
                className="h-9 w-9 rounded-full border-1 border-border hover:border-primary transition-colors"
              /> : <User className="h-9 w-9 rounded-full border-1 border-border hover:border-primary transition-colors p-1"/>}
            </DropdownTrigger>
            <DropdownContent align="end" className="w-56">
              <DropdownItem className="gap-2" disabled>
                <div className="flex flex-col items-start">
                  <h1 className="text-[18px]">{data.user.name}</h1>
                  <p className="opacity-70">{data.user.email}</p>
                </div>
              </DropdownItem>
              <DropdownSeparator />
              <DropdownItem
                className="gap-2"
                onClick={() => router.push("/profile")}
              >
                <FaRegUser className="h-4 w-4" />
                Profile
              </DropdownItem>
              <DropdownItem
                className="gap-2"
                onClick={() => router.push("/projects")}
                >
                <GoProjectSymlink className="h-4 w-4" />
                Projects
              </DropdownItem>
              <DropdownItem
                className="gap-2"
                onClick={() => router.push("/new-project")}
              >
                <PiPlusBold className="h-4 w-4" />
                New Project
              </DropdownItem>
              {isLoggedIn && <DropdownSeparator />}
              {isLoggedIn && (
                <DropdownItem
                  className="gap-2"
                  onClick={handleClick}
                  disabled={isPending}
                  destructive
                >
                  <PiSignOutBold className="h-4 w-4" />
                  Sign out
                </DropdownItem>
              )}
            </DropdownContent>
          </Dropdown>
        )}
      </div>
    </div>
  );
};

export default Header;
