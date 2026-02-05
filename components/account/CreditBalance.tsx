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
  let barColor = "bg-success";
  let glowColor = "shadow-[0_0_20px_rgba(52,211,153,0.3)]";

  if (percentage < 10) {
    barColor = "bg-error";
    glowColor = "shadow-[0_0_20px_rgba(248,113,113,0.3)]";
  } else if (percentage < 25) {
    barColor = "bg-warning";
    glowColor = "shadow-[0_0_20px_rgba(251,191,36,0.3)]";
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-body-xs font-medium uppercase tracking-widest text-text-tertiary">
            Available Credits
          </h3>
          <p className="mt-1 font-display text-display-md text-text-primary">{credits}</p>
          <p className="text-body-sm text-text-secondary">of {monthlyCredits} monthly</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-body-xs font-semibold ${
            percentage < 10
              ? "bg-error/20 text-error"
              : percentage < 25
                ? "bg-warning/20 text-warning"
                : "bg-success/20 text-success"
          }`}
        >
          {percentage.toFixed(0)}%
        </span>
      </div>

      {/* Visual indicator */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-bg-tertiary">
        <div
          className={`h-full transition-all duration-500 ${barColor} ${glowColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {credits < 5 && (
        <div className="border-error/30 bg-error/10 rounded-xl border p-3 text-body-sm text-error">
          ⚠️ Low credits! Consider upgrading your plan.
        </div>
      )}
    </div>
  );
}
