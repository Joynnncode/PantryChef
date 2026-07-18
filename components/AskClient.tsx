"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { ChatMessage, type ChatMessageData } from "@/components/ChatMessage";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { getSavedIngredients } from "@/lib/storage/localStore";

const SUGGESTIONS = [
  "What can I make with chicken and rice?",
  "How should I meal prep vegetables for the week?",
  "What's a high-protein, low-sodium dinner idea?",
];

export function AskClient() {
  const searchParams = useSearchParams();
  const prefilledQuestion = searchParams.get("q") ?? "";

  const [ingredients, setIngredients] = useState<string[]>([]);
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [draft, setDraft] = useState(prefilledQuestion);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage is client-only
    setIngredients(getSavedIngredients());
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function ask(question: string) {
    const trimmed = question.trim();
    if (!trimmed || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setDraft("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/rag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed, ingredients }),
      });

      const data: { answer?: string; sources?: ChatMessageData["sources"]; error?: string } =
        await res.json();

      if (!res.ok || !data.answer) {
        throw new Error(data.error || "Something went wrong.");
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer!, sources: data.sources },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    ask(draft);
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col px-6 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Ask PantryChef</h1>
        <p className="mt-2 text-foreground-muted">
          Ask what to cook or how to eat healthier — answers are grounded in
          PantryChef&apos;s meal-prep and nutrition knowledge base.
          {ingredients.length > 0 && (
            <> Using your saved ingredients: {ingredients.join(", ")}.</>
          )}
        </p>
      </div>

      {messages.length === 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => ask(s)}
              className="rounded-full border border-primary-200 bg-primary-50 px-3 py-1.5 text-sm text-primary-700 hover:bg-primary-100"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 space-y-3">
        {messages.map((message, i) => (
          <ChatMessage key={i} message={message} />
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-sm text-foreground-muted">
            <Spinner />
            Thinking…
          </div>
        )}
        {error && <p className="text-sm text-grade-e">{error}</p>}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="mt-6 flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ask what to cook…"
          aria-label="Ask PantryChef"
        />
        <Button type="submit" disabled={loading || !draft.trim()}>
          Send
        </Button>
      </form>
    </div>
  );
}
