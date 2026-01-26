"use client";

import { useEffect, useState } from "react";
import { useFileUpload } from "./file-upload";
import {
  Alert,
  AlertContent,
  AlertDescription,
  AlertIcon,
  AlertTitle,
} from "./ui/alert-1";
import { Button } from "./ui/button-1";
import { TriangleAlert, User, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { FileWithPreview } from "./file-upload";
import Image from "next/image";

function formatBytes(bytes: number): string {
  const sizes = ["Bytes", "KB", "MB", "GB"];
  if (bytes === 0) return "0 Byte";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
}

interface AvatarUploadProps {
  maxSize?: number;
  className?: string;
  // NOTE: now passes a base64 string instead of File
  onFileChange?: (base64: string | null) => void;
  defaultAvatar?: string;
}

export default function AvatarUpload({
  maxSize = 2 * 1024 * 1024, // 2MB
  className,
  onFileChange,
  defaultAvatar,
}: AvatarUploadProps) {
  const [
    { files, isDragging, errors },
    {
      removeFile,
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      getInputProps,
    },
  ] = useFileUpload({
    maxFiles: 1,
    maxSize,
    accept: "image/*",
    multiple: false,
  });

  const [previewUrl, setPreviewUrl] = useState<string | null>(defaultAvatar || null);

  useEffect(() => {
    const currentFile = files[0];
    if (!currentFile) {
      onFileChange?.(null);
      setPreviewUrl(defaultAvatar || null);
      return;
    }

    // ✅ Convert uploaded file to Base64 string
    const file = currentFile.file;
    if (file instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        onFileChange?.(base64String);
        setPreviewUrl(base64String); // also show preview from base64
      };
      reader.readAsDataURL(file);
    }
  }, [files, onFileChange, defaultAvatar]);

  const currentFile = files[0];

  const handleRemove = () => {
    if (currentFile) {
      removeFile(currentFile.id);
    }
    onFileChange?.(null);
    setPreviewUrl(defaultAvatar || null);
  };

  return (
    <div
      className={cn(
        "flex flex-col h-fit sm:w-full items-start gap-4",
        className
      )}
    >
      <section className="flex flex-col items-center">
        {/* Avatar Preview */}
        <div className="relative">
          <div
            className={cn(
              "group/avatar border border-dashed rounded-sm relative max-sm:h-30 sm:h-40 md:h-50 lg:h-60 xl:h-70 max-sm:w-30 sm:w-40 md:w-50 lg:w-60 xl:w-70 cursor-pointer overflow-hidden transition-colors flex items-center",
              isDragging
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-muted-foreground/20",
              previewUrl && "border-solid"
            )}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={openFileDialog}
          >
            <input {...getInputProps()} className="sr-only" />
            {previewUrl ? (
              <div className="flex h-full w-full items-center justify-center relative">
                <Image
                  src={previewUrl}
                  alt="Avatar"
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex h-[50%] w-full items-center justify-center">
                <User className="size-20 sm:size-50 text-muted-foreground" />
              </div>
            )}
          </div>
          {/* Remove Button */}
          {currentFile && (
            <Button
              size="icon"
              variant="outline"
              onClick={handleRemove}
              className="size-6 absolute end-0 top-0 rounded-full"
              aria-label="Remove avatar"
            >
              <X className="size-3.5" />
            </Button>
          )}
        </div>

        {/* Upload Instructions */}
        <div className="text-center w-fit space-y-0.5 my-3">
          <p className="text-[10px] sm:text-xs font-medium">
            {currentFile ? "Avatar uploaded" : "Upload avatar"}
          </p>
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            PNG, JPG up to {formatBytes(maxSize)}
          </p>
        </div>
      </section>

      {/* Error Messages */}
      {errors.length > 0 && (
        <Alert variant="destructive" appearance="light" className="">
          <AlertIcon>
            <TriangleAlert />
          </AlertIcon>
          <AlertContent>
            <AlertTitle>File upload error(s)</AlertTitle>
            <AlertDescription>
              {errors.map((error, index) => (
                <p key={index} className="last:mb-0">
                  {error}
                </p>
              ))}
            </AlertDescription>
          </AlertContent>
        </Alert>
      )}
    </div>
  );
}
