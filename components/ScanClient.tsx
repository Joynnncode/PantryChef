"use client";

import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { ProductCard } from "@/components/ProductCard";
import { BarcodeCameraScanner } from "@/components/BarcodeCameraScanner";
import type { FoodProduct } from "@/lib/apis/openFoodFacts";

const BARCODE_PATTERN = /^\d{8,14}$/;

export function ScanClient() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [products, setProducts] = useState<FoodProduct[]>([]);
  const [cameraOpen, setCameraOpen] = useState(false);

  async function runLookup(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const isBarcode = BARCODE_PATTERN.test(trimmed);
      const url = isBarcode
        ? `/api/food-facts?barcode=${encodeURIComponent(trimmed)}`
        : `/api/food-facts?q=${encodeURIComponent(trimmed)}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Lookup failed");

      if (isBarcode) {
        const data: { product: FoodProduct | null } = await res.json();
        setProducts(data.product ? [data.product] : []);
      } else {
        const data: { products: FoodProduct[] } = await res.json();
        setProducts(data.products);
      }
    } catch {
      setError("Couldn't reach Open Food Facts. Try again in a moment.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    runLookup(query);
  }

  function handleDetected(barcode: string) {
    setCameraOpen(false);
    setQuery(barcode);
    runLookup(barcode);
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Scan a product</h1>
        <p className="mt-2 max-w-2xl text-foreground-muted">
          Enter a barcode number or a product name to check its Nutri-Score, NOVA
          processing group, and ingredients — powered by the open, crowd-sourced Open
          Food Facts database.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-wrap gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Barcode (e.g. 3017620422003) or product name"
          aria-label="Barcode or product name"
          className="min-w-0 flex-1"
        />
        <Button type="submit" disabled={loading || !query.trim()}>
          {loading ? "Searching…" : "Scan"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => setCameraOpen((open) => !open)}
        >
          📷 {cameraOpen ? "Close camera" : "Scan with camera"}
        </Button>
      </form>

      {cameraOpen && (
        <BarcodeCameraScanner
          onDetected={handleDetected}
          onClose={() => setCameraOpen(false)}
        />
      )}

      {loading && (
        <div className="mt-8 flex items-center gap-2 text-foreground-muted">
          <Spinner />
          Looking up product data…
        </div>
      )}

      {error && <p className="mt-8 text-sm text-grade-e">{error}</p>}

      {!loading && searched && !error && products.length === 0 && (
        <p className="mt-8 text-foreground-muted">
          No product found. Open Food Facts is crowd-sourced, so some barcodes or
          names may not be in the database yet.
        </p>
      )}

      {!loading && products.length > 0 && (
        <div className="mt-8 space-y-4">
          {products.map((product) => (
            <ProductCard key={product.barcode} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
