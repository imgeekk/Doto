"use client";

import { MdSave } from "react-icons/md";
import { useState } from "react";
import AvatarUpload from "./AvatarUpload";
import { useRouter } from "next/navigation";
import { FileWithPreview } from "./file-upload";
import ModifiedClassicLoader from "./loader";
import {
  Alert,
  AlertContent,
  AlertDescription,
  AlertIcon,
  AlertTitle,
} from "./ui/alert-1";
import { authClient } from "@/app/lib/auth-client";
import { TriangleAlert } from "lucide-react";

const ProfileUpdateForm = ({
  initialData,
  onUpdate,
  setEditMode,
}: {
  initialData: any;
  onUpdate: (options: { query?: { disableCookieCache: boolean } }) => void;
  setEditMode: (value: boolean) => void;
}) => {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const [name, setName] = useState(initialData.name);
  // const [email, setEmail] = useState(initialData.email);
  const [bio, setBio] = useState(initialData.bio);
  const [links, setLinks] = useState<string[]>([]);
  const [image, setImage] = useState<string | null>(null);

  const handleAvatarChange = (base64: string | null) => {
    setImage(base64);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const isUnchanged =
      name === initialData.name &&
      // email === initialData.email &&
      bio === initialData.bio &&
      image === initialData.image;

    if (isUnchanged) {
      setEditMode(false);
      return;
    }

    setIsPending(true);

    try {
      const res = await fetch("api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, bio, image }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error("Failed to update user");
      }

      const data = await res.json();

      if (data.ok) {
        await onUpdate(data.updatedUser);
        setEditMode(false);
      } else {
        throw new Error(data.error || "Unknown error");
      }
    } catch (error) {
      console.error("Error updating user: ", error);
      setError(JSON.stringify(error));
    } finally {
      setIsPending(false);
    }
  };
  return (
    <form
      className="flex shadow-md rounded-md p-3 max-sm:flex-col justify-evenly text-sm sm:text-lg"
      onSubmit={handleSubmit}
    >
      <figure className="flex-[1] flex sm:justify-center mb-10">
        <AvatarUpload className="" onFileChange={handleAvatarChange} />
      </figure>
      <section className="flex-[2] sm:mx-6">
        <article>
          <label className="px-1 opacity-70 dark:opacity-50">Name</label>
          <input
            type="text"
            placeholder="Name"
            name="name"
            value={name}
            onChange={(e) => {
              e.preventDefault;
              setName(e.target.value);
            }}
            className="flex h-9 w-full rounded-sm border border-zinc-300 dark:border-zinc-800 bg-background px-3 py-2 mb-3 text-foreground shadow-sm shadow-black/5 transition-shadow placeholder:text-muted-foreground/70 dark:focus-visible:border-blue-500 focus-visible:border-blue-500 focus-visible:outline-none  disabled:cursor-not-allowed disabled:opacity-50"
          />
          {/* <label className="px-1 opacity-70 dark:opacity-50 ">Email</label>
          <input
            type="text"
            placeholder="Email"
            name="email"
            value={email}
            onChange={(e) => {
              e.preventDefault;
              setEmail(e.target.value);
            }}
            className="flex h-9 w-full rounded-sm border border-zinc-300 dark:border-zinc-800 bg-background px-3 py-2 mb-4 text-foreground shadow-sm shadow-black/5 transition-shadow placeholder:text-muted-foreground/70 dark:focus-visible:border-blue-500 focus-visible:border-blue-500 focus-visible:outline-none  disabled:cursor-not-allowed disabled:opacity-50"
          /> */}
          <label className="px-1 opacity-70 dark:opacity-50">Bio</label>
          <textarea
            placeholder="Add a bio"
            name="bio"
            value={bio}
            onChange={(e) => {
              e.preventDefault;
              setBio(e.target.value);
            }}
            rows={5}
            className="resize-none flex w-full rounded-sm border border-zinc-300 dark:border-zinc-800 bg-background px-3 py-2 text-foreground shadow-sm shadow-black/5 transition-shadow placeholder:text-muted-foreground/70 dark:focus-visible:border-blue-500 focus-visible:border-blue-500 focus-visible:outline-none  disabled:cursor-not-allowed disabled:opacity-50"
          />
        </article>
        <div className="mt-6">
          <h1 className="mb-2 opacity-70 dark:opacity-50">Links</h1>
          <ul>
            {/* {links.map((l: string) => (
            <div key={l} className="flex items-center mb-2">
              <input
                type="text"
                placeholder="Add a link"
                value={l}
                onChange={(e) => {
                  e.preventDefault;
                }}
                className="flex h-9 w-full rounded-[3px] border border-zinc-300 dark:border-zinc-800 bg-background px-3 py-2 mb-1 text-foreground shadow-sm shadow-black/5 transition-shadow placeholder:text-muted-foreground/70 dark:focus-visible:border-blue-500 focus-visible:border-blue-500 focus-visible:outline-none  disabled:cursor-not-allowed disabled:opacity-50"
              />{" "}
              <div
                className="text-zinc-500 hover:text-zinc-500 hover:cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                }}
              >
                <AiOutlineDelete
                  className="dark:text-zinc-200 text-zinc-600"
                  size={25}
                />
              </div>
            </div>
          ))} */}
          </ul>
          <div className="mb-10">
            <button
              className=" text-sm gap-1 h-7 w-16 bg-zinc-900 dark:bg-white dark:text-black border text-white font-semibold rounded-sm hover:cursor-pointer hover:opacity-80"
              onClick={(e) => {
                e.preventDefault();
                setLinks((l: any) => [...l, ""]);
              }}
            >
              Add
            </button>
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center h-8 w-20 text-sm gap-1 dark:bg-white bg-zinc-900 dark:text-zinc-800 text-zinc-50 rounded-sm hover:cursor-pointer hover:opacity-80 font-semibold"
          >
            {isPending ? "" : <MdSave />}
            {isPending ? (
              <ModifiedClassicLoader className="border-b-1 border-t-1 h-2 w-2" />
            ) : (
              "Save"
            )}
          </button>
        </div>
        {error && (
          <Alert variant="destructive" appearance="light" className="mt-5">
            <AlertIcon>
              <TriangleAlert />
            </AlertIcon>
            <AlertContent>
              <AlertTitle>Something went wrong</AlertTitle>
              <AlertDescription>
                {/* {errors.map((error, index) => (
                <p key={index} className="last:mb-0">
                  {error}
                </p>
              ))} */}
                {error}
              </AlertDescription>
            </AlertContent>
          </Alert>
        )}
      </section>
    </form>
  );
};

export default ProfileUpdateForm;
