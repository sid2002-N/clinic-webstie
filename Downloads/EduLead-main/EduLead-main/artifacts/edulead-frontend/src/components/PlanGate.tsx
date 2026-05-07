import { useAuthStore, Plan } from '../store/authStore';

const PLAN_ORDER: Plan[] = ['basic', 'pro', 'premium'];

interface PlanGateProps {
  require: Plan;
  children: React.ReactNode;
}

export default function PlanGate({ require: requiredPlan, children }: PlanGateProps) {
  const plan = useAuthStore((s) => s.plan);
  const currentIdx = PLAN_ORDER.indexOf(plan ?? 'basic');
  const requiredIdx = PLAN_ORDER.indexOf(requiredPlan);

  if (currentIdx < requiredIdx) {
    return (
      <div className="rounded-xl border border-dashed border-border p-8 text-center">
        <div className="text-4xl mb-3">🔒</div>
        <h3 className="font-semibold text-foreground mb-1">
          {requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1)} Plan Required
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Upgrade your plan to unlock this feature.
        </p>
        <a
          href="/dashboard/billing"
          className="inline-block bg-[#1E3A5F] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#162d4a] transition-colors"
        >
          Upgrade Plan
        </a>
      </div>
    );
  }
  return <>{children}</>;
}
