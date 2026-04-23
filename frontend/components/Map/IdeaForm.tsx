import { useState } from "react";

type Props = {
  coordinates: [number, number]; // [lng, lat]
  onSubmit: (title: string, description: string) => Promise<void> | void;
  onCancel: () => void;
};

export function IdeaForm({ coordinates, onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const t = title.trim();
    if (!t) {
      setError("Введите заголовок");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(t, description.trim());
      setTitle("");
      setDescription("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-[min(100%,380px)] rounded-3xl border border-[#E0E0E0] bg-white/95 p-4 text-[#333333] shadow-lg backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">Новая идея</div>
          <div className="mt-1 text-xs text-[#666666]">
            Координаты:{" "}
            <span className="font-mono">
              {coordinates[1].toFixed(6)}, {coordinates[0].toFixed(6)}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-2xl border border-[#E0E0E0] bg-white px-3 py-1.5 text-xs text-[#333333] hover:bg-gray-50"
        >
          Отмена
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-3 space-y-2">
        <div>
          <label className="mb-1 block text-[11px] font-medium text-[#666666]">
            Заголовок
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Например, велодорожка"
            className="w-full rounded-2xl border border-[#E0E0E0] bg-white px-3 py-2 text-xs text-[#333333] outline-none placeholder:text-[#999] focus:border-[#077BBD]"
          />
        </div>

        <div>
          <label className="mb-1 block text-[11px] font-medium text-[#666666]">
            Описание
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Кратко опишите идею"
            className="w-full resize-none rounded-2xl border border-[#E0E0E0] bg-white px-3 py-2 text-xs text-[#333333] outline-none placeholder:text-[#999] focus:border-[#077BBD]"
          />
        </div>

        {error && (
          <div className="rounded-2xl border border-red-500/60 bg-red-500/10 px-3 py-2 text-[11px] text-red-800">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center rounded-full bg-[#077BBD] px-4 py-2 text-[11px] font-medium text-white shadow-sm hover:bg-[#066199] disabled:opacity-60"
        >
          {submitting ? "Сохранение..." : "Добавить"}
        </button>
      </form>
    </div>
  );
}
