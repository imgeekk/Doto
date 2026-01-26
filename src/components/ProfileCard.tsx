import { auth } from "@/app/lib/auth";
import { LuExternalLink } from "react-icons/lu";
import { MdModeEdit, MdSave } from "react-icons/md";
import Image from "next/image";
import { TbEdit } from "react-icons/tb";
import { BiEdit } from "react-icons/bi";
import { authClient } from "@/app/lib/auth-client";
import { User } from "lucide-react";

const ProfileCard = ({
  initialData,
  setEditMode,
}: {
  initialData: any;
  setEditMode: (value: boolean) => void;
}) => {
  return (
    <>
      <section className="min-h-[300px] flex items-stretch max-sm:flex-col mb-5 p-3 shadow-md rounded-md bg-zinc-200 dark:bg-neutral-800/20">
        <figure className="flex-[1] flex max-sm:mb-5">
          {initialData.image ? (
            <div className="max-sm:h-30 sm:h-40 md:h-50 lg:h-60 xl:h-70 max-sm:w-30 sm:w-40 md:w-50 lg:w-60 xl:w-70 relative overflow-hidden rounded-sm">
              <Image
                src={initialData.image}
                alt="text"
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="max-sm:h-30 sm:h-40 md:h-50 lg:h-60 xl:h-70 max-sm:w-30 sm:w-40 md:w-50 lg:w-60 xl:w-70 relative overflow-hidden rounded-sm flex items-center justify-center border-1 border-zinc-400 dark:border-zinc-800">
              <User className="size-20 sm:size-50 text-muted-foreground" />
            </div>
          )}
        </figure>
        <section className="flex-[2] flex flex-col justify-between gap-5 mx-6">
          <div className=" flex-1 h-full flex flex-col justify-evenly text-md sm:text-lg tracking-tight">
            <article className="mb-5">
              <h1 className="">{initialData.name}</h1>
              <p className="opacity-60">{initialData.email}</p>
            </article>
            {initialData.bio ? (
              <article className="mb-5">{initialData.bio}</article>
            ) : (
              <p
                onClick={() => setEditMode(true)}
                className="opacity-50 hover:cursor-pointer"
              >
                Add a bio
              </p>
            )}

            <div className="text-blue-300 mb-3">
              <h1 className="text-zinc-800 dark:text-white">Links</h1>
              <p className="text-sm sm:text-[16px] flex items-center gap-1">
                <LuExternalLink />
                this
              </p>
              <p className="text-sm sm:text-[16px] flex items-center gap-1">
                <LuExternalLink />
                this
              </p>
              <p className="text-sm sm:text-[16px] flex items-center gap-1">
                <LuExternalLink />
                this
              </p>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              className="flex items-center justify-center text-sm gap-1 dark:bg-white bg-zinc-900 dark:text-zinc-800 text-zinc-50 h-7 w-16 font-semibold rounded-sm hover:cursor-pointer"
              onClick={() => setEditMode(true)}
            >
              Edit
              <BiEdit />
            </button>
          </div>
        </section>
      </section>

      <section className="min-h-100 bg-amber-200 rounded-sm"></section>
    </>
  );
};

export default ProfileCard;
