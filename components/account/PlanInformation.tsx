"use client";

interface PlanInformationProps {
  plan: "free" | "pro" | "enterprise";
  subscriptionStatus?: "active" | "canceled" | "past_due" | "trialing";
  trialEndsAt?: number;
}

export function PlanInformation({ plan, subscriptionStatus, trialEndsAt }: PlanInformationProps) {
  const planDetails = {
    free: {
      name: "Free",
      features: ["10 credits per month", "1 GB storage", "Basic models", "Community support"],
      price: "$0/month",
    },
    pro: {
      name: "Pro",
      features: [
        "500 credits per month",
        "100 GB storage",
        "All models",
        "Priority support",
        "API access",
      ],
      price: "$29/month",
    },
    enterprise: {
      name: "Enterprise",
      features: [
        "2000 credits per month",
        "500 GB storage",
        "All models",
        "24/7 support",
        "API access",
        "Custom integrations",
        "Team collaboration",
      ],
      price: "Custom",
    },
  }[plan];

  const getStatusBadge = () => {
    if (!subscriptionStatus) return null;

    const statusConfig = {
      active: "bg-success/20 text-success",
      trialing: "bg-accent/20 text-accent",
      canceled: "bg-error/20 text-error",
      past_due: "bg-warning/20 text-warning",
    }[subscriptionStatus];

    return (
      <span className={`rounded-full px-3 py-1 text-body-xs font-semibold ${statusConfig}`}>
        {subscriptionStatus.charAt(0).toUpperCase() + subscriptionStatus.slice(1)}
      </span>
    );
  };

  const getTrialMessage = () => {
    if (!trialEndsAt) return null;

    const daysRemaining = Math.ceil((trialEndsAt - Date.now()) / (1000 * 60 * 60 * 24));

    return (
      <div className="border-accent/30 bg-accent/10 mt-4 rounded-xl border p-3 text-body-sm text-accent">
        🎉 Trial period: {daysRemaining} days remaining
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-xl text-text-primary">{planDetails.name}</h3>
          <p className="text-body-sm text-text-secondary">{planDetails.price}</p>
        </div>
        {getStatusBadge()}
      </div>

      {/* Trial message */}
      {getTrialMessage()}

      {/* Features */}
      <div className="rounded-xl bg-bg-tertiary p-4">
        <h4 className="mb-3 text-body-xs font-semibold uppercase tracking-widest text-text-tertiary">
          Plan Features
        </h4>
        <ul className="space-y-2">
          {planDetails.features.map((feature, index) => (
            <li key={index} className="flex items-start text-body-sm text-text-secondary">
              <svg
                className="mr-2 mt-0.5 h-4 w-4 flex-shrink-0 text-accent"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {feature}
            </li>
          ))}
        </ul>
      </div>

      {/* Upgrade CTA */}
      {plan === "free" && (
        <button className="bg-accent-gradient w-full rounded-xl px-4 py-3 font-semibold text-bg-primary shadow-glow transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_var(--accent-glow)]">
          Upgrade to Pro
        </button>
      )}

      {plan === "pro" && (
        <button className="w-full rounded-xl border border-border bg-bg-tertiary px-4 py-3 font-medium text-text-secondary transition-all duration-300 hover:border-accent hover:text-accent">
          Manage Subscription
        </button>
      )}
    </div>
  );
}
