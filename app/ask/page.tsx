import { ComingSoon } from "@/components/ComingSoon";

export const metadata = { title: "Ask PantryChef" };

export default function AskPage() {
  return (
    <ComingSoon
      icon="💬"
      title="Ask PantryChef"
      description="Ask in plain language what you can cook with what you have. PantryChef will search its recipe and nutrition knowledge base and generate a grounded, personalized answer."
      milestone="Milestone 5"
    />
  );
}
