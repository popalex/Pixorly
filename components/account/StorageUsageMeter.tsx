"use client";

interface StorageUsageMeterProps {
  usedBytes: number;
  quotaBytes: number;
}

export function StorageUsageMeter({ usedBytes, quotaBytes }: StorageUsageMeterProps) {
  const usedGB = (usedBytes / (1024 * 1024 * 1024)).toFixed(2);
  const quotaGB = (quotaBytes / (1024 * 1024 * 1024)).toFixed(0);
  const percentage = Math.min(100, (usedBytes / quotaBytes) * 100);

  // Color based on usage
  let barColor = "bg-accent";

  if (percentage > 90) {
    barColor = "bg-error";
  } else if (percentage > 75) {
    barColor = "bg-warning";
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-body-sm text-text-secondary">Storage Used</span>
        <span className="text-body-sm font-medium text-text-primary">
          {usedGB} GB / {quotaGB} GB
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-bg-tertiary">
        <div
          className={`h-full transition-all duration-500 ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Percentage */}
      <div className="flex justify-between text-body-xs text-text-tertiary">
        <span>{percentage.toFixed(1)}% used</span>
        {percentage > 90 && <span className="font-medium text-error">Running low on storage</span>}
      </div>
    </div>
  );
}
