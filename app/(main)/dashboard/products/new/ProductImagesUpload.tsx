"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import Image from "next/image";

interface ProductImagesUploadProps {
  images: File[];
  setImages: (files: File[]) => void;
  existingImages?: string[];
  onRemoveExisting?: (index: number) => void;
}

export default function ProductImagesUpload({
  images,
  setImages,
  existingImages = [],
  onRemoveExisting,
}: ProductImagesUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setImages([...images, ...acceptedFiles]);
    },
    [images, setImages]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    maxFiles: 5 - existingImages.length,
  });

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Product Images</h3>
        <span className="text-sm text-gray-500">
          {images.length + existingImages.length} / 5
        </span>
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer ${
          isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
        }`}
      >
        <input {...getInputProps()} />
        <p>
          {isDragActive
            ? "Drop the images here"
            : "Drag & drop images here, or click to select"}
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Upload up to {5 - existingImages.length} images (max 5MB each)
        </p>
      </div>

      {(existingImages.length > 0 || images.length > 0) && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {existingImages.map((image, index) => (
            <div key={`existing-${index}`} className="relative group">
              <Image
                src={image}
                alt={`Product image ${index + 1}`}
                width={200}
                height={200}
                className="rounded-md object-cover h-32 w-full"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                onClick={() => onRemoveExisting?.(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}

          {images.map((image, index) => (
            <div key={`new-${index}`} className="relative group">
              <Image
                src={URL.createObjectURL(image)}
                alt={`New image ${index + 1}`}
                width={200}
                height={200}
                className="rounded-md object-cover h-32 w-full"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                onClick={() => removeImage(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
