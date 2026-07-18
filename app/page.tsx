import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";

const features = [
  {
    href: "/discover",
    icon: "🎥",
    title: "Discover recipes",
    description:
      "Find recipes and cooking tutorial videos that match the ingredients you already have.",
  },
  {
    href: "/ask",
    icon: "💬",
    title: "Ask PantryChef",
    description:
      "Ask in plain language what you can cook — get grounded, personalized suggestions.",
  },
  {
    href: "/scan",
    icon: "🔍",
    title: "Scan a product",
    description:
      "Check how healthy a packaged ingredient is using open nutrition data.",
  },
  {
    href: "/meal-prep",
    icon: "🥡",
    title: "Meal prep guide",
    description:
      "Learn which ingredients and meals hold up best for batch cooking.",
  },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700 border border-primary-100">
          Cook with what you already have
        </span>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Turn your pantry into your next meal
        </h1>
        <p className="mt-4 text-lg text-foreground-muted">
          PantryChef finds recipes and tutorials for the ingredients you have,
          scores how healthy each meal is, and helps you plan meal prep for the
          week.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button href="/discover" size="lg">
            Find a recipe
          </Button>
          <Button href="/ask" size="lg" variant="secondary">
            Ask PantryChef
          </Button>
        </div>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {features.map((feature) => (
          <Link key={feature.href} href={feature.href}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardBody className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-xl">
                  {feature.icon}
                </span>
                <div>
                  <h3 className="font-semibold text-foreground">{feature.title}</h3>
                  <p className="mt-1 text-sm text-foreground-muted">
                    {feature.description}
                  </p>
                </div>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
