import { ScanClient } from "@/components/ScanClient";

export const metadata = {
  title: "Scan a product — PantryChef",
  description:
    "Check a packaged ingredient's Nutri-Score, NOVA group, and additives using open nutrition data.",
};

export default function ScanPage() {
  return <ScanClient />;
}
