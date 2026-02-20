"use client";

import Header from "@/components/Header";
import ProfileCard from "@/components/ProfileCard";
import ProfileUpdateForm from "@/components/ProfileUpdateForm";
import { useEffect, useState } from "react";
import { authClient } from "../lib/auth-client";
import { redirect, useRouter } from "next/navigation";
import { FileWithPreview } from "@/components/file-upload";
import { Skeleton } from "@/components/ui/skeleton";
import { auth } from "../lib/auth";

const page = () => {
  const [avatar, setAvatar] = useState<FileWithPreview | null>(null);
  const router = useRouter();
  const { data, isPending, error, refetch } = authClient.useSession();

  useEffect(() => {
    if (!isPending && !data?.session) redirect("/signup");
  }, [isPending, data]);

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    image: "",
    bio: "",
  });

  useEffect(() => {
    if (!isPending && data?.user) {
      setUserData({
        name: data.user.name ?? "",
        email: data.user.email ?? "",
        image: data.user.image ?? "",
        bio: data.user.bio ?? "",
      });
    }
  }, [isPending, data]);

  const forceSessionRefresh = async (updatedUser: any) => {
    setUserData((prev) => ({ ...prev, ...updatedUser }));

    await refetch({ query: { disableCookieCache: true } });
    router.refresh();
  };

  if (!isPending && data?.user) {
    console.log("\n\n\n", userData.name, "\n\n\n");
  }

  const handleAvatarChange = (file: FileWithPreview | null) => {
    console.log("Selected file:", file);
    setAvatar(file);
  };

  const [editMode, setEditMode] = useState(false);
  // if (!isPending) {
  return (
    <div className="min-h-screen flex flex-col items-center mx-2">
      <header className="w-full text-white mb-5 absolute">
        <Header visible={true} />
      </header>
      <main className="min-h-[100vh] rounded-md w-full md:w-[80%] lg:w-[70%] xl:w-[60%] flex flex-col justify-start font-[monument] p-5 pt-20">
        <header className="sm:text-5xl text-3xl font-[clashreg] p-1 mb-5 border-b-1 border-dashed">
          Profile
        </header>
        {!isPending ? (
          !editMode ? (
            <ProfileCard initialData={userData} setEditMode={setEditMode} />
          ) : (
            <ProfileUpdateForm
              initialData={userData}
              onUpdate={forceSessionRefresh}
              setEditMode={setEditMode}
            />
          )
        ) : (
          <>
            <Skeleton className="h-[300px] flex items-stretch max-sm:flex-col mb-5">
              <figure className="flex-[1] flex max-sm:mb-5 border-r-1 rounded-lg"></figure>
              <Skeleton className="flex-[2] flex flex-col justify-between gap-5 mx-6"></Skeleton>
            </Skeleton>

            <Skeleton className="min-h-100 rounded-sm"></Skeleton>
          </>
        )}
      </main>
    </div>
  );
  // } else {
  //   return <div className="h-screen flex items-center justify-center"><PageLoader/></div>;
  //   // return <div className="h-screen flex items-center justify-center"><ModifiedClassicLoader className="h-20 w-20 border-white dark:border-white border-t-5 border-b-5"/></div>;
  // }
};

export default page;
