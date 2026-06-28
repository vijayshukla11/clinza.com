/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Reusable Supabase Storage Uploader for Clinza
 */

import React, { useState, useRef } from "react";
import { Upload, Check, AlertCircle, Loader } from "lucide-react";
import { uploadFileToSupabase } from "../../supabase";

interface MediaUploaderProps {
  bucketName: "products" | "collections" | "blogs" | "sliders";
  onUploadSuccess: (url: string) => void;
  label?: string;
}

export default function MediaUploader({ bucketName, onUploadSuccess, label = "Upload Image" }: MediaUploaderProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (!file) return;
    
    // Check if it's an image
    if (!file.type.startsWith("image/")) {
      setStatus("error");
      setErrorMessage("Please select an image file (PNG, JPG, WEBP).");
      return;
    }

    setLoading(true);
    setStatus("idle");
    setErrorMessage(null);

    try {
      const publicUrl = await uploadFileToSupabase(bucketName, file);
      setStatus("success");
      onUploadSuccess(publicUrl);
    } catch (err: any) {
      console.error("Uploader component error:", err);
      setStatus("error");
      // Provide actionable, elegant help if the bucket hasn't been created
      if (err.message && (err.message.includes("not found") || err.message.includes("does not exist") || err.message.includes("Bucket"))) {
        setErrorMessage(
          `Bucket "${bucketName}" not found. Open Supabase Dashboard -> Storage -> create a new PUBLIC bucket named "${bucketName}"!`
        );
      } else if (err.message) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Upload failed. Ensure Supabase credentials are valid and CORS/Storage allows uploads.");
      }
    } finally {
      setLoading(false);
    }
  };

  const onDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  return (
    <div id={`uploader-wrap-${bucketName}`} className="text-zinc-700 font-sans text-xs my-2">
      <div
        onDragEnter={onDrag}
        onDragOver={onDrag}
        onDragLeave={onDrag}
        onDrop={onDrop}
        className={`relative border border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
          dragActive
            ? "border-orange-500 bg-orange-50/50"
            : "border-zinc-200 hover:border-zinc-300 bg-zinc-50/40 hover:bg-zinc-50/80"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={onFileChange}
          disabled={loading}
        />

        <div className="flex flex-col items-center justify-center space-y-2">
          {loading ? (
            <div className="flex items-center gap-1.5 text-zinc-600">
              <Loader className="h-4.5 w-4.5 animate-spin text-orange-500" />
              <span className="font-mono text-[10px] uppercase font-bold tracking-wider">Uploading asset to cloud...</span>
            </div>
          ) : status === "success" ? (
            <div className="flex items-center gap-1.5 text-emerald-600">
              <Check className="h-4.5 w-4.5 stroke-[2.5]" />
              <span className="font-mono text-[10px] uppercase font-bold tracking-wider">File uploaded successfully!</span>
            </div>
          ) : status === "error" ? (
            <div className="flex flex-col items-center space-y-1 text-red-650">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertCircle className="h-4 w-4" />
                <span className="font-mono text-[10px] uppercase tracking-wider">Storage Error</span>
              </div>
              <p className="text-[10px] leading-relaxed max-w-xs">{errorMessage}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-1">
              <Upload className="h-4.5 w-4.5 text-zinc-400 group-hover:text-zinc-600" />
              <p className="text-[10px] font-medium text-zinc-500">
                Drag & drop or <span className="text-orange-600 font-bold hover:underline" onClick={onButtonClick}>browse</span> for image file
              </p>
              <p className="text-[9px] text-zinc-400 font-mono">Stores in "{bucketName}" bucket</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
