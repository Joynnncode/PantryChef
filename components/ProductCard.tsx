import Link from "next/link";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { GradePill } from "@/components/ui/GradePill";
import type { FoodProduct } from "@/lib/apis/openFoodFacts";

const NOVA_LABELS: Record<number, string> = {
  1: "Unprocessed / minimally processed",
  2: "Processed culinary ingredient",
  3: "Processed food",
  4: "Ultra-processed food",
};

export function ProductCard({ product }: { product: FoodProduct }) {
  return (
    <Link href={`/scan/${product.barcode}`}>
      <Card className="transition-shadow hover:shadow-md">
        <CardBody className="flex gap-4">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-20 w-20 shrink-0 rounded-lg object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-2xl">
              🥫
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-foreground">{product.name}</h3>
                {product.brand && (
                  <p className="text-xs text-foreground-muted">{product.brand}</p>
                )}
              </div>
              {product.nutriScoreGrade ? (
                <GradePill
                  grade={product.nutriScoreGrade.toUpperCase() as "A" | "B" | "C" | "D" | "E"}
                />
              ) : (
                <Badge className="bg-surface-muted text-foreground-muted">No score</Badge>
              )}
            </div>

            {product.novaGroup && (
              <p className="mt-1 text-xs text-foreground-muted">
                NOVA {product.novaGroup} — {NOVA_LABELS[product.novaGroup]}
              </p>
            )}

            {product.ingredientsText && (
              <p className="mt-2 line-clamp-2 text-sm text-foreground-muted">
                {product.ingredientsText}
              </p>
            )}

            {product.additives.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {product.additives.slice(0, 5).map((additive) => (
                  <Badge key={additive} className="bg-surface-muted text-foreground-muted">
                    {additive}
                  </Badge>
                ))}
              </div>
            )}

            {product.allergens.length > 0 && (
              <p className="mt-2 text-xs text-grade-d">
                Contains: {product.allergens.join(", ")}
              </p>
            )}

            <p className="mt-2 text-xs font-medium text-primary-600">View full details →</p>
          </div>
        </CardBody>
      </Card>
    </Link>
  );
}
