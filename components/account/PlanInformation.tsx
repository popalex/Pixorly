"use client";

interface PlanInformationProps {
  plan: "free" | "pro" | "enterprise";
  subscriptionStatus?: "active" | "canceled" | "past_due" | "trialing";
  trialEndsAt?: number;
}

export function PlanInformation({ plan, subscriptionStatus, trialEndsAt }: PlanInformationProps) {
  const planDetails = {
    free: {
      name: "Free Plan",
      color: "bg-gray-100 text-gray-800 border-gray-300",
      features: ["10 credits per month", "1 GB storage", "Basic models", "Community support"],
      price: "$0/month",
    },
    pro: {
      name: "Pro Plan",
      color: "bg-blue-100 text-blue-800 border-blue-300",
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
      name: "Enterprise Plan",
      color: "bg-purple-100 text-purple-800 border-purple-300",
      features: [
        "2000 credits per month",
        "500 GB storage",
        "All models",
        "24/7 support",
        "API access",
        "Custom integrations",
        "Team collaboration",
      ],
      price: "Custom pricing",
    },
  }[plan];

  const getStatusBadge = () => {
    if (!subscriptionStatus) return null;

    const statusConfig = {
      active: "bg-green-100 text-green-800",
      trialing: "bg-blue-100 text-blue-800",
      canceled: "bg-red-100 text-red-800",
      past_due: "bg-yellow-100 text-yellow-800",
    }[subscriptionStatus];

    return (
      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusConfig}`}>
        {subscriptionStatus.charAt(0).toUpperCase() + subscriptionStatus.slice(1)}
      </span>
    );
  };

  const getTrialMessage = () => {
    if (!trialEndsAt) return null;

    const daysRemaining = Math.ceil((trialEndsAt - Date.now()) / (1000 * 60 * 60 * 24));

    return (
      <div className="mt-3 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
        🎉 Trial period: {daysRemaining} days remaining
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{planDetails.name}</h3>
          <p className="text-sm text-gray-500">{planDetails.price}</p>
        </div>
        {getStatusBadge()}
      </div>

      {/* Trial message */}
      {getTrialMessage()}

      {/* Features */}
      <div className="rounded-lg border-2 border-gray-200 bg-white p-4">
        <h4 className="mb-3 text-sm font-semibold text-gray-700">Plan Features</h4>
        <ul className="space-y-2">
          {planDetails.features.map((feature, index) => (
            <li key={index} className="flex items-start text-sm text-gray-600">
              <svg
                className="mr-2 mt-0.5 h-4 w-4 flex-shrink-0 text-green-500"
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
        <button className="w-full rounded-lg bg-blue-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-600">
          Upgrade to Pro
        </button>
      )}

      {plan === "pro" && (
        <button className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50">
          Manage Subscription
        </button>
      )}
    </div>
  );
}
