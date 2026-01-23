"use client";

import { useState } from "react";
import Image from "next/image";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface GenerationResultProps {
  jobId: Id<"generationJobs">;
}

export function GenerationResult({ jobId }: GenerationResultProps) {
  const job = useQuery(api.generations.getGenerationJob, { jobId });
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!job || job.status !== "completed" || !job.imageIds || job.imageIds.length === 0) {
    return null;
  }

  const selectedImageId = job.imageIds[selectedIndex];

  if (!selectedImageId) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Result Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Generated Images</h3>
        <div className="flex gap-2">
          <button
            onClick={() => downloadImage(selectedImageId)}
            className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600"
          >
            Download
          </button>
          <button
            onClick={() => shareImage(selectedImageId)}
            className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
          >
            Share
          </button>
        </div>
      </div>

      {/* Main Image Display */}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
        <ImageDisplay imageId={selectedImageId} />
      </div>

      {/* Thumbnail Grid (if multiple images) */}
      {job.imageIds.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {job.imageIds.map((imageId: Id<"images">, index: number) => {
            if (!imageId) return null;
            return (
              <button
                key={imageId}
                onClick={() => setSelectedIndex(index)}
                className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                  selectedIndex === index
                    ? "border-blue-500 ring-2 ring-blue-200"
                    : "border-gray-200 hover:border-gray-300"
                } `}
              >
                <ImageDisplay imageId={imageId} />
              </button>
            );
          })}
        </div>
      )}

      {/* Image Metadata */}
      <div className="space-y-3 rounded-lg bg-gray-50 p-4">
        <h4 className="text-sm font-semibold text-gray-900">Generation Details</h4>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Prompt:</span>
            <span className="max-w-md truncate text-right font-medium text-gray-900">
              {job.prompt}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Model:</span>
            <span className="font-medium text-gray-900">{job.model}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Resolution:</span>
            <span className="font-medium text-gray-900">
              {job.width}x{job.height}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Credits Used:</span>
            <span className="font-medium text-gray-900">{job.creditsUsed}</span>
          </div>
          {job.seed && (
            <div className="flex justify-between">
              <span className="text-gray-600">Seed:</span>
              <span className="font-mono text-xs font-medium text-gray-900">{job.seed}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 border-t border-gray-200 pt-3">
          <button
            onClick={() => copyPrompt(job.prompt)}
            className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Copy Prompt
          </button>
          <button
            onClick={() => handleUseAsTemplate(job)}
            className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Use as Template
          </button>
        </div>
      </div>
    </div>
  );
}

function ImageDisplay({ imageId }: { imageId: Id<"images"> }) {
  const image = useQuery(api.generations.getImage, { imageId });
  const [isLoading, setIsLoading] = useState(true);

  // Use the actual CloudFront URL from the image record
  const imageUrl = image?.cloudFrontUrl || `/api/images/${imageId}`;

  return (
    <>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-400"></div>
        </div>
      )}
      <Image
        src={imageUrl}
        alt="Generated image"
        fill
        className="object-contain"
        onLoadingComplete={() => setIsLoading(false)}
        onError={() => setIsLoading(false)}
      />
    </>
  );
}

async function downloadImage(imageId: Id<"images">) {
  try {
    const response = await fetch(`/api/images/${imageId}`);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pixorly-${imageId}.png`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error("Failed to download image:", error);
    alert("Failed to download image. Please try again.");
  }
}

async function shareImage(imageId: Id<"images">) {
  const shareUrl = `${window.location.origin}/images/${imageId}`;

  if (navigator.share) {
    try {
      await navigator.share({
        title: "Check out my AI-generated image!",
        url: shareUrl,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  } else {
    // Fallback: copy to clipboard
    await navigator.clipboard.writeText(shareUrl);
    alert("Share link copied to clipboard!");
  }
}

async function copyPrompt(prompt: string) {
  try {
    await navigator.clipboard.writeText(prompt);
    alert("Prompt copied to clipboard!");
  } catch (error) {
    console.error("Failed to copy prompt:", error);
    alert("Failed to copy prompt. Please try again.");
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function handleUseAsTemplate(job: any) {
  // This would typically dispatch an action to fill the form with this job's parameters
  console.log("Using job as template:", job);
  alert("Template feature coming soon!");
}
