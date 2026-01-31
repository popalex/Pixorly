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
  let barColor = "bg-blue-500";
  let textColor = "text-blue-600";

  if (percentage > 90) {
    barColor = "bg-red-500";
    textColor = "text-red-600";
  } else if (percentage > 75) {
    barColor = "bg-yellow-500";
    textColor = "text-yellow-600";
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Storage Used</span>
        <span className={`text-sm font-semibold ${textColor}`}>
          {usedGB} GB / {quotaGB} GB
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className={`h-full transition-all duration-300 ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Percentage */}
      <div className="flex justify-between text-xs text-gray-500">
        <span>{percentage.toFixed(1)}% used</span>
        {percentage > 90 && (
          <span className="font-medium text-red-600">⚠️ Running low on storage</span>
        )}
      </div>
    </div>
  );
}
