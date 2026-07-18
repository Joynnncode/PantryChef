import { GradePill } from "@/components/ui/GradePill";
import { computeHealthScore, explainHealthScore } from "@/lib/health-score/nutriScore";
import type { NutritionFacts } from "@/lib/health-score/types";

export function HealthGradeBadge({ nutrition }: { nutrition: NutritionFacts }) {
  const { grade, score0to100, breakdown } = computeHealthScore(nutrition);
  const reasons = explainHealthScore(breakdown);

  return (
    <div className="flex items-start gap-3">
      <GradePill grade={grade} />
      <div>
        <div className="text-sm font-medium text-foreground">
          Health score: {score0to100}/100
        </div>
        <ul className="mt-1 space-y-0.5 text-xs text-foreground-muted">
          {reasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
