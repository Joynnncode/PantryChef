import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export interface ChatMessageData {
  role: "user" | "assistant";
  content: string;
  sources?: Array<{ title: string; url?: string }>;
}

export function ChatMessage({ message }: { message: ChatMessageData }) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3 text-sm",
          isUser
            ? "bg-primary-500 text-white"
            : "border border-border bg-surface text-foreground"
        )}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>

        {message.sources && message.sources.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {message.sources.map((source) =>
              source.url ? (
                <Link
                  key={source.title}
                  href={source.url}
                  className="rounded-full bg-primary-50 px-2 py-0.5 text-xs text-primary-700 hover:bg-primary-100"
                >
                  {source.title}
                </Link>
              ) : (
                <span
                  key={source.title}
                  className="rounded-full bg-surface-muted px-2 py-0.5 text-xs text-foreground-muted"
                >
                  {source.title}
                </span>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
