"use client";

interface CreditBalanceProps {
  credits: number;
  plan: "free" | "pro" | "enterprise";
}

export function CreditBalance({ credits, plan }: CreditBalanceProps) {
  // Determine monthly credits based on plan
  const monthlyCredits = {
    free: 10,
    pro: 500,
    enterprise: 2000,
  }[plan];

  const percentage = Math.min(100, (credits / monthlyCredits) * 100);

  // Color based on credits remaining
  let badgeColor = "bg-green-100 text-green-800";
  let textColor = "text-green-600";

  if (percentage < 10) {
    badgeColor = "bg-red-100 text-red-800";
    textColor = "text-red-600";
  } else if (percentage < 25) {
    badgeColor = "bg-yellow-100 text-yellow-800";
    textColor = "text-yellow-600";
  }

  return (
    <div className="rounded-lg border-2 border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-600">Available Credits</h3>
          <p className={`mt-2 text-4xl font-bold ${textColor}`}>{credits}</p>
          <p className="mt-1 text-sm text-gray-500">of {monthlyCredits} monthly credits</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeColor}`}>
          {percentage.toFixed(0)}%
        </span>
      </div>

      {/* Visual indicator */}
      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className={`h-full transition-all duration-300 ${
            percentage < 10 ? "bg-red-500" : percentage < 25 ? "bg-yellow-500" : "bg-green-500"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {credits < 5 && (
        <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          ⚠️ Low credits! Upgrade your plan or purchase more credits.
        </div>
      )}
    </div>
  );
}
