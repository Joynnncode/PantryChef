import { cn } from "@/lib/utils/cn";

export type HealthGrade = "A" | "B" | "C" | "D" | "E";

const gradeStyles: Record<HealthGrade, string> = {
  A: "bg-grade-a/10 text-grade-a border-grade-a/30",
  B: "bg-grade-b/10 text-grade-b border-grade-b/30",
  C: "bg-grade-c/10 text-grade-c border-grade-c/30",
  D: "bg-grade-d/10 text-grade-d border-grade-d/30",
  E: "bg-grade-e/10 text-grade-e border-grade-e/30",
};

export function GradePill({
  grade,
  className,
}: {
  grade: HealthGrade;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-bold",
        gradeStyles[grade],
        className
      )}
      title={`Health grade ${grade}`}
    >
      {grade}
    </span>
  );
}
