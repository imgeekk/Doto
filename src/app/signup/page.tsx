"use client";

import FadeContent from "@/components/FadeContent";
import { SignInPage } from "@/components/sign-in";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn, signUp } from "../lib/auth-client";

const page = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [emailLoading, setEmailLoading] = useState<boolean>(false);
  const [googleLoading, setGoogleLoading] = useState<boolean>(false);
  const handleCredentialsSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const isSignUp =
      e.currentTarget
        .querySelector('button[type="submit"]')
        ?.textContent?.trim() === "Sign Up";

    if (!email || !password) {
      return setError("Please enter both email and password");
    }

    if (isSignUp) {
      try {
        await signUp.email(
          {
            name,
            email,
            password,
          },
          {
            onRequest: () => {
              setEmailLoading(true);
            },
            onResponse: () => {
              setEmailLoading(false);
            },
            onError: (e: any) => {
              setError(e.error.message);
            },
            onSuccess: () => {
              router.push("/profile");
            },
          }
        );
      } catch (error) {
        setError("A network error occured during sign up");
      }
    } else {
      // Sign In
      await signIn.email(
        {
          email,
          password,
        },
        {
          onRequest: () => {
            setEmailLoading(true);
          },
          onResponse: () => {
            setEmailLoading(false);
          },
          onError: (e: any) => {
            setError(e.error.message);
          },
          onSuccess: () => {
            router.push("/profile");
          },
        }
      );
    }
  };
  const handleGoogleSignIn = async () => {
    await signIn.social({
      provider: "google",
      callbackURL: "/profile",
      fetchOptions: {
        onRequest: () => {
          setGoogleLoading(true);
        },
        onResponse: () => {
          setGoogleLoading(false);
        },
        onError: (e: any) => {
          setError(e.error.message);
        },
      },
    });
  };
  return (
    <div>
      <FadeContent
        blur={true}
        duration={500}
        easing="ease-out"
        initialOpacity={30}
      >
        <SignInPage
          emailLoading={emailLoading}
          googleLoading={googleLoading}
          heroImageSrc="/images/hero.png"
          errorFromPage={error}
          onSignIn={handleCredentialsSubmit}
          onGoogleSignIn={handleGoogleSignIn}
        />
      </FadeContent>
    </div>
  );
};
export default page;
