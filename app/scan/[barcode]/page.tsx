import { notFound } from "next/navigation";
import { getProductByBarcode } from "@/lib/apis/openFoodFacts";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { GradePill } from "@/components/ui/GradePill";
import { Button } from "@/components/ui/Button";

const NOVA_LABELS: Record<number, string> = {
  1: "Unprocessed / minimally processed",
  2: "Processed culinary ingredient",
  3: "Processed food",
  4: "Ultra-processed food",
};

const NUTRITION_ROWS: Array<{
  key: "caloriesKcal" | "proteinG" | "fiberG" | "sugarG" | "saturatedFatG" | "sodiumMg";
  label: string;
  unit: string;
}> = [
  { key: "caloriesKcal", label: "Calories", unit: "kcal" },
  { key: "proteinG", label: "Protein", unit: "g" },
  { key: "fiberG", label: "Fiber", unit: "g" },
  { key: "sugarG", label: "Sugar", unit: "g" },
  { key: "saturatedFatG", label: "Saturated fat", unit: "g" },
  { key: "sodiumMg", label: "Sodium", unit: "mg" },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ barcode: string }>;
}) {
  const { barcode } = await params;
  try {
    const product = await getProductByBarcode(barcode);
    return { title: product ? `${product.name} — PantryChef` : "Product — PantryChef" };
  } catch {
    return { title: "Product — PantryChef" };
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ barcode: string }>;
}) {
  const { barcode } = await params;

  let product;
  try {
    product = await getProductByBarcode(barcode);
  } catch {
    notFound();
  }
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="flex gap-5">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-32 w-32 shrink-0 rounded-2xl object-cover"
          />
        ) : (
          <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-2xl bg-surface-muted text-4xl">
            🥫
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">{product.name}</h1>
              {product.brand && (
                <p className="mt-1 text-sm text-foreground-muted">{product.brand}</p>
              )}
              {product.quantity && (
                <p className="text-sm text-foreground-muted">{product.quantity}</p>
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
            <p className="mt-3 text-sm text-foreground-muted">
              NOVA {product.novaGroup} — {NOVA_LABELS[product.novaGroup]}
            </p>
          )}

          <Button
            href={`/discover?add=${encodeURIComponent(product.name)}`}
            variant="secondary"
            size="sm"
            className="mt-4"
          >
            🍳 Find recipes with this
          </Button>
        </div>
      </div>

      {product.nutrimentsPer100g && (
        <Card className="my-8">
          <CardBody>
            <h2 className="mb-3 text-sm font-semibold uppercase text-foreground-muted">
              Nutrition per 100g
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {NUTRITION_ROWS.map((row) => {
                const value = product.nutrimentsPer100g![row.key];
                return (
                  <div key={row.key}>
                    <div className="text-xs text-foreground-muted">{row.label}</div>
                    <div className="font-medium text-foreground">
                      {value === null ? "—" : `${Math.round(value)} ${row.unit}`}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>
      )}

      {product.ingredientsText && (
        <div className="mt-8">
          <h2 className="mb-3 text-lg font-semibold text-foreground">Ingredients</h2>
          <p className="text-sm text-foreground-muted">{product.ingredientsText}</p>
        </div>
      )}

      {product.additives.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 text-lg font-semibold text-foreground">Additives</h2>
          <div className="flex flex-wrap gap-1.5">
            {product.additives.map((additive) => (
              <Badge key={additive} className="bg-surface-muted text-foreground-muted">
                {additive}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {product.allergens.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 text-lg font-semibold text-foreground">Allergens</h2>
          <p className="text-sm text-grade-d">{product.allergens.join(", ")}</p>
        </div>
      )}

      <p className="mt-10 text-xs text-foreground-muted">
        Barcode {product.barcode} · Data from{" "}
        <a
          href={`https://world.openfoodfacts.org/product/${product.barcode}`}
          className="text-primary-600 hover:underline"
        >
          Open Food Facts
        </a>
      </p>
    </div>
  );
}
