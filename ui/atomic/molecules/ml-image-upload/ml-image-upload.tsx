"use client";

import { useCallback, useRef, useState } from "react";

import { Card, CardBody, Image, Spinner } from "@heroui/react";
import { ImageIcon,Upload } from "lucide-react";

import { MlImageUploadProps } from "./ml-image-upload.types";

export function MlImageUpload({
  currentImage,
  onFileSelect,
  isUploading = false,
}: MlImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  const maxSizeBytes = 5 * 1024 * 1024; // 5MB

  const handleFile = useCallback(
    (file: File) => {
      if (!allowedTypes.includes(file.type)) return;
      if (file.size > maxSizeBytes) return;
      onFileSelect(file);
    },
    [onFileSelect],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <Card shadow="sm">
      <CardBody className="p-6">
        <div className="mb-6 flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Imagen del Producto</h2>
        </div>

        {/* Upload zone */}
        <div
          className={`relative flex aspect-video w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 text-center transition-all ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-gray-300 hover:border-primary/50"
          }`}
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {isUploading ? (
            <Spinner label="Subiendo imagen..." />
          ) : currentImage ? (
            <Image
              src={currentImage}
              alt="Producto"
              className="h-full w-full rounded-lg object-cover"
              removeWrapper
            />
          ) : (
            <>
              <Upload className="mb-2 h-10 w-10 text-gray-400" />
              <p className="text-sm font-medium">
                Click para subir o arrastra una imagen
              </p>
              <p className="mt-1 text-xs text-gray-500">
                PNG, JPG, WebP hasta 5MB
              </p>
            </>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
      </CardBody>
    </Card>
  );
}
