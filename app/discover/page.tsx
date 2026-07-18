import { ComingSoon } from "@/components/ComingSoon";

export const metadata = { title: "Discover — PantryChef" };

export default function DiscoverPage() {
  return (
    <ComingSoon
      icon="🎥"
      title="Discover recipes"
      description="Type in the ingredients you have and PantryChef will find matching recipes and cooking tutorial videos, complete with a health score for each."
      milestone="Milestone 2"
    />
  );
}
