import { Suspense } from "react";
import { DiscoverClient } from "@/components/DiscoverClient";

export const metadata = {
  title: "Discover recipes — PantryChef",
  description:
    "Tell PantryChef what ingredients you have and find matching recipes and cooking tutorial videos.",
};

export default function DiscoverPage() {
  return (
    <Suspense>
      <DiscoverClient />
    </Suspense>
  );
}
