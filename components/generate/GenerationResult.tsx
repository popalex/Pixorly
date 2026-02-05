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
        <h3 className="font-display text-lg font-semibold text-text-primary">Generated Images</h3>
        <div className="flex gap-2">
          <button
            onClick={() => downloadImage(selectedImageId)}
            className="rounded-xl bg-accent px-4 py-2 text-body-sm font-medium text-bg-primary transition-all duration-300 hover:bg-accent-hover hover:shadow-glow"
          >
            Download
          </button>
          <button
            onClick={() => shareImage(selectedImageId)}
            className="rounded-xl border border-border bg-bg-tertiary px-4 py-2 text-body-sm font-medium text-text-secondary transition-colors hover:border-accent hover:text-accent"
          >
            Share
          </button>
        </div>
      </div>

      {/* Main Image Display */}
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-bg-tertiary">
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
                className={`relative aspect-square overflow-hidden rounded-xl border-2 transition-all duration-300 ${
                  selectedIndex === index
                    ? "ring-accent/30 border-accent shadow-glow ring-2"
                    : "hover:border-accent/50 border-border"
                } `}
              >
                <ImageDisplay imageId={imageId} />
              </button>
            );
          })}
        </div>
      )}

      {/* Image Metadata */}
      <div className="space-y-4 rounded-2xl bg-bg-tertiary p-5">
        <h4 className="font-display text-body-sm font-semibold text-text-primary">
          Generation Details
        </h4>

        <div className="space-y-3 text-body-sm">
          <div className="flex justify-between">
            <span className="text-text-tertiary">Prompt:</span>
            <span className="max-w-md truncate text-right font-medium text-text-primary">
              {job.prompt}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-tertiary">Model:</span>
            <span className="font-medium text-text-primary">{job.model}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-tertiary">Resolution:</span>
            <span className="font-medium text-text-primary">
              {job.width}x{job.height}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-tertiary">Credits Used:</span>
            <span className="font-medium text-accent">{job.creditsUsed}</span>
          </div>
          {job.seed && (
            <div className="flex justify-between">
              <span className="text-text-tertiary">Seed:</span>
              <span className="font-mono text-body-xs font-medium text-text-primary">
                {job.seed}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 border-t border-border-subtle pt-4">
          <button
            onClick={() => copyPrompt(job.prompt)}
            className="flex-1 rounded-xl border border-border bg-bg-secondary px-3 py-2.5 text-body-xs font-medium text-text-secondary transition-colors hover:border-accent hover:text-accent"
          >
            Copy Prompt
          </button>
          <button
            onClick={() => handleUseAsTemplate(job)}
            className="flex-1 rounded-xl border border-border bg-bg-secondary px-3 py-2.5 text-body-xs font-medium text-text-secondary transition-colors hover:border-accent hover:text-accent"
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
  const blurDataUrl = image?.blurDataUrl;

  return (
    <>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-bg-tertiary">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-accent"></div>
        </div>
      )}
      <Image
        src={imageUrl}
        alt="Generated image"
        fill
        className="object-contain"
        placeholder={blurDataUrl ? "blur" : "empty"}
        blurDataURL={blurDataUrl}
        loading="lazy"
        quality={90}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
