import { Suspense } from "react";
import { AskClient } from "@/components/AskClient";

export const metadata = {
  title: "Ask PantryChef",
  description:
    "Ask in plain language what you can cook with what you have — grounded in PantryChef's meal-prep and nutrition knowledge base.",
};

export default function AskPage() {
  return (
    <Suspense>
      <AskClient />
    </Suspense>
  );
}
