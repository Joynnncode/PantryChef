import { ComingSoon } from "@/components/ComingSoon";

export const metadata = { title: "Scan — PantryChef" };

export default function ScanPage() {
  return (
    <ComingSoon
      icon="🔍"
      title="Scan a product"
      description="Look up a packaged ingredient by barcode or name to see its Nutri-Score, ingredient list, and additives using open nutrition data."
      milestone="Milestone 3"
    />
  );
}
