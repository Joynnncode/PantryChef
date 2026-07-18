import { Card, CardBody } from "@/components/ui/Card";

export function ComingSoon({
  icon,
  title,
  description,
  milestone,
}: {
  icon: string;
  title: string;
  description: string;
  milestone: string;
}) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-20 text-center">
      <span className="text-4xl">{icon}</span>
      <h1 className="mt-4 text-2xl font-semibold text-foreground">{title}</h1>
      <p className="mt-2 text-foreground-muted">{description}</p>
      <Card className="mt-8 inline-block">
        <CardBody className="text-sm text-foreground-muted">
          🚧 Coming in <span className="font-medium text-primary-700">{milestone}</span>
        </CardBody>
      </Card>
    </div>
  );
}
