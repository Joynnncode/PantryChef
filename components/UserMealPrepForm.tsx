"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { compressImage } from "@/lib/utils/compressImage";
import type { UserMealPrep } from "@/lib/storage/userMealPreps";

export function UserMealPrepForm({
  onSave,
  onCancel,
}: {
  onSave: (entry: Omit<UserMealPrep, "id" | "createdAt">) => Promise<void>;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [fridgeDays, setFridgeDays] = useState("");
  const [freezerDays, setFreezerDays] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagDraft, setTagDraft] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!photoFile) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(photoFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [photoFile]);

  function addTag() {
    const value = tagDraft.trim().toLowerCase();
    if (!value || tags.includes(value)) {
      setTagDraft("");
      return;
    }
    setTags([...tags, value]);
    setTagDraft("");
  }

  function handleTagKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Give it a name first.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const photo = photoFile ? await compressImage(photoFile) : null;
      await onSave({
        title: title.trim(),
        notes: notes.trim(),
        tags,
        fridgeDays: fridgeDays ? Number(fridgeDays) : null,
        freezerDays: freezerDays ? Number(freezerDays) : null,
        photo,
      });
    } catch {
      setError("Couldn't save that — try a smaller photo or try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="mb-6">
      <CardBody>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Name
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. My Sunday chicken burrito bowls"
              aria-label="Meal prep name"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Photo
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-foreground-muted file:mr-3 file:rounded-lg file:border-0 file:bg-primary-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary-700 hover:file:bg-primary-100"
            />
            {previewUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt="Preview"
                className="mt-3 h-40 w-full rounded-xl object-cover"
              />
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Notes (ingredients, how you made it, tips)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="e.g. Grilled chicken thighs, cilantro-lime rice, black beans, salsa. Keeps well for 4 days — add avocado fresh."
              className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                Fridge life (days)
              </label>
              <Input
                type="number"
                min={0}
                value={fridgeDays}
                onChange={(e) => setFridgeDays(e.target.value)}
                placeholder="e.g. 4"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                Freezer life (days)
              </label>
              <Input
                type="number"
                min={0}
                value={freezerDays}
                onChange={(e) => setFreezerDays(e.target.value)}
                placeholder="e.g. 60"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Tags
            </label>
            <div className="flex gap-2">
              <Input
                value={tagDraft}
                onChange={(e) => setTagDraft(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="e.g. high-protein, budget"
                aria-label="Add a tag"
              />
              <Button variant="secondary" type="button" onClick={addTag}>
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 py-1 pl-3 pr-2 text-sm text-primary-800 border border-primary-100"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => setTags(tags.filter((t) => t !== tag))}
                      aria-label={`Remove ${tag}`}
                      className="rounded-full px-1 text-primary-500 hover:bg-primary-100 hover:text-primary-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {error && <p className="text-sm text-grade-e">{error}</p>}

          <div className="flex gap-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save meal prep"}
            </Button>
            <Button type="button" variant="ghost" onClick={onCancel} disabled={saving}>
              Cancel
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
