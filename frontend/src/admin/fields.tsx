import { useRef, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ImageUp, Plus, Trash2, X } from "lucide-react";
import { ICON_CHOICES } from "../lib/icons";

export const inputCls =
  "w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white placeholder:text-slate-400 shadow-inner shadow-black/20 transition focus:border-emerald-400/60 focus:outline-none focus:ring-2 focus:ring-emerald-400/20";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-300">
        {label}
      </span>
      {children}
    </label>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={inputCls} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={3} {...props} className={`${inputCls} resize-y`} />;
}

export function NumInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input type="number" {...props} className={inputCls} />;
}

export function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const safe = toColorHex(value);
  return (
    <div className="flex items-center gap-2">
      <label
        className="neu-inset-sm grid size-11 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-xl p-1 transition-transform duration-200 hover:scale-105 active:scale-95"
        title="Pick a color"
      >
        <input
          type="color"
          value={safe}
          onChange={(e) => onChange(e.target.value)}
          className="size-full cursor-pointer appearance-none rounded-lg border-0 bg-transparent p-0"
        />
      </label>
      <input
        value={value}
        onFocus={(e) => e.target.select()}
        onBlur={(e) => onChange(toColorHex(e.target.value))}
        onChange={(e) => onChange(e.target.value)}
        className={inputCls}
        spellCheck={false}
      />
    </div>
  );
}

export function IconSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={`${inputCls} cursor-pointer`}>
      {ICON_CHOICES.map((k) => (
        <option key={k} value={k}>
          {k}
        </option>
      ))}
    </select>
  );
}

/** Normalize a color to #rrggbb (native color input needs exactly this) */
function toColorHex(v: string): string {
  const t = v.trim().replace(/^#/, "");
  if (/^[0-9a-fA-F]{3}$/.test(t)) return `#${t[0]}${t[0]}${t[1]}${t[1]}${t[2]}${t[2]}`.toLowerCase();
  if (/^[0-9a-fA-F]{6}$/.test(t)) return `#${t}`.toLowerCase();
  return "#5b5ee9";
}

/** Image picker: file upload (auto-resized & JPEG-compressed client-side),
 *  URL paste, and remove. Stores a data-URL string in the content. */
export function ImageUpload({
  value,
  onChange,
  fallbackLabel = "Built-in photo",
}: {
  value: string;
  onChange: (v: string) => void;
  fallbackLabel?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (file: File) => {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Sirf image files (jpg/png/webp) allowed hain.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("Image 8 MB se choti rakhein.");
      return;
    }
    setLoading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        // resize longest side to 640px and compress — keeps DB & localStorage small
        const MAX = 640;
        const scale = Math.min(1, MAX / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          setError("Browser image processing support nahi karta.");
          setLoading(false);
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        onChange(canvas.toDataURL("image/jpeg", 0.85));
        setLoading(false);
      };
      img.onerror = () => {
        setError("Image load nahi ho saki — doosri file try karein.");
        setLoading(false);
      };
      img.src = String(reader.result);
    };
    reader.onerror = () => {
      setError("File read nahi ho saki.");
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-4">
        {/* preview */}
        <span className="neu-inset-sm grid size-24 shrink-0 place-items-center overflow-hidden rounded-2xl">
          {value ? (
            <img
              src={value}
              alt="Selected portrait preview"
              width={96}
              height={96}
              decoding="async"
              className="size-full object-cover"
            />
          ) : (
            <span className="px-2 text-center text-[10px] font-semibold uppercase tracking-wider text-neu-muted">
              {fallbackLabel}
            </span>
          )}
        </span>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={loading}
            className="btn-primary inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold disabled:opacity-50"
          >
            <ImageUp className="size-4" />
            {loading ? "Processing…" : value ? "Change image" : "Upload image"}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="press inline-flex w-fit items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-red-400"
            >
              <X className="size-3.5" /> Remove
            </button>
          )}
          <p className="text-[10px] leading-relaxed text-neu-muted">
            JPG/PNG/WebP — 640px tak auto-resize + compress ho jayegi.
          </p>
        </div>
      </div>

      <input
        value={value.startsWith("data:") ? "" : value}
        placeholder="ya image ka URL paste karein (https://…)"
        onChange={(e) => onChange(e.target.value)}
        className={inputCls}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

interface ListEditorProps<T> {
  items: T[];
  onChange: (items: T[]) => void;
  makeNew: () => T;
  addLabel: string;
  renderItem: (item: T, index: number, update: (patch: Partial<T>) => void) => ReactNode;
}

export function ListEditor<T extends object>({ items, onChange, makeNew, addLabel, renderItem }: ListEditorProps<T>) {
  const swap = (i: number, j: number) => {
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const updateAt = (i: number, patch: Partial<T>) =>
    onChange(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));

  return (
    <div className="flex flex-col gap-4">
      {items.map((it, i) => (
        <div key={i} className="neu-sm relative rounded-2xl p-5">
          <div className="absolute -left-2 -top-2 flex gap-1.5">
            <button
              type="button"
              onClick={() => swap(i, i - 1)}
              aria-label="Move up"
              className="press grid size-8 place-items-center rounded-full text-neu-muted"
            >
              <ArrowUp className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => swap(i, i + 1)}
              aria-label="Move down"
              className="press grid size-8 place-items-center rounded-full text-neu-muted"
            >
              <ArrowDown className="size-3.5" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => remove(i)}
            aria-label="Delete"
            className="press absolute -right-2 -top-2 grid size-8 place-items-center rounded-full text-red-400"
          >
            <Trash2 className="size-3.5" />
          </button>
          {renderItem(it, i, (patch) => updateAt(i, patch))}
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, makeNew()])}
        className="press inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-neu-muted"
      >
        <Plus className="size-4" /> {addLabel}
      </button>
    </div>
  );
}
