import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState } from "react";
import { ArrowDown, ArrowUp, ImageUp, Plus, Trash2, X } from "lucide-react";
import { ICON_CHOICES } from "../lib/icons";
export const inputCls = "neu-inset-sm w-full rounded-xl bg-transparent px-4 py-2.5 text-sm outline-none ring-neu-accent/0 transition-shadow focus:ring-2 focus:ring-neu-accent/50";
export function Field({ label, children }) {
    return (_jsxs("label", { className: "block", children: [_jsx("span", { className: "mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.18em] text-neu-muted", children: label }), children] }));
}
export function TextInput(props) {
    return _jsx("input", { ...props, className: inputCls });
}
export function TextArea(props) {
    return _jsx("textarea", { rows: 3, ...props, className: `${inputCls} resize-y` });
}
export function NumInput(props) {
    return _jsx("input", { type: "number", ...props, className: inputCls });
}
export function ColorInput({ value, onChange }) {
    return (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "neu-inset-sm grid size-10 shrink-0 place-items-center rounded-xl p-1.5", children: _jsx("input", { type: "color", value: value, onChange: (e) => onChange(e.target.value), className: "size-full cursor-pointer appearance-none rounded-lg bg-transparent" }) }), _jsx("input", { value: value, onChange: (e) => onChange(e.target.value), className: inputCls })] }));
}
export function IconSelect({ value, onChange }) {
    return (_jsx("select", { value: value, onChange: (e) => onChange(e.target.value), className: `${inputCls} cursor-pointer`, children: ICON_CHOICES.map((k) => (_jsx("option", { value: k, children: k }, k))) }));
}
/** Image picker: file upload (auto-resized & JPEG-compressed client-side),
 *  URL paste, and remove. Stores a data-URL string in the content. */
export function ImageUpload({ value, onChange, fallbackLabel = "Built-in photo", }) {
    const fileRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const handleFile = (file) => {
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
    return (_jsxs("div", { className: "flex flex-col gap-3", children: [_jsxs("div", { className: "flex items-start gap-4", children: [_jsx("span", { className: "neu-inset-sm grid size-24 shrink-0 place-items-center overflow-hidden rounded-2xl", children: value ? (_jsx("img", { src: value, alt: "preview", className: "size-full object-cover" })) : (_jsx("span", { className: "px-2 text-center text-[10px] font-semibold uppercase tracking-wider text-neu-muted", children: fallbackLabel })) }), _jsxs("div", { className: "flex min-w-0 flex-1 flex-col gap-2", children: [_jsx("input", { ref: fileRef, type: "file", accept: "image/*", className: "hidden", onChange: (e) => {
                                    const f = e.target.files?.[0];
                                    if (f)
                                        handleFile(f);
                                    e.target.value = "";
                                } }), _jsxs("button", { type: "button", onClick: () => fileRef.current?.click(), disabled: loading, className: "btn-primary inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold disabled:opacity-50", children: [_jsx(ImageUp, { className: "size-4" }), loading ? "Processing…" : value ? "Change image" : "Upload image"] }), value && (_jsxs("button", { type: "button", onClick: () => onChange(""), className: "press inline-flex w-fit items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-red-400", children: [_jsx(X, { className: "size-3.5" }), " Remove"] })), _jsx("p", { className: "text-[10px] leading-relaxed text-neu-muted", children: "JPG/PNG/WebP \u2014 640px tak auto-resize + compress ho jayegi." })] })] }), _jsx("input", { value: value.startsWith("data:") ? "" : value, placeholder: "ya image ka URL paste karein (https://\u2026)", onChange: (e) => onChange(e.target.value), className: inputCls }), error && _jsx("p", { className: "text-xs text-red-400", children: error })] }));
}
export function ListEditor({ items, onChange, makeNew, addLabel, renderItem }) {
    const swap = (i, j) => {
        if (j < 0 || j >= items.length)
            return;
        const next = [...items];
        [next[i], next[j]] = [next[j], next[i]];
        onChange(next);
    };
    const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
    const updateAt = (i, patch) => onChange(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
    return (_jsxs("div", { className: "flex flex-col gap-4", children: [items.map((it, i) => (_jsxs("div", { className: "neu-sm relative rounded-2xl p-5", children: [_jsxs("div", { className: "absolute -left-2 -top-2 flex gap-1.5", children: [_jsx("button", { type: "button", onClick: () => swap(i, i - 1), "aria-label": "Move up", className: "press grid size-8 place-items-center rounded-full text-neu-muted", children: _jsx(ArrowUp, { className: "size-3.5" }) }), _jsx("button", { type: "button", onClick: () => swap(i, i + 1), "aria-label": "Move down", className: "press grid size-8 place-items-center rounded-full text-neu-muted", children: _jsx(ArrowDown, { className: "size-3.5" }) })] }), _jsx("button", { type: "button", onClick: () => remove(i), "aria-label": "Delete", className: "press absolute -right-2 -top-2 grid size-8 place-items-center rounded-full text-red-400", children: _jsx(Trash2, { className: "size-3.5" }) }), renderItem(it, i, (patch) => updateAt(i, patch))] }, i))), _jsxs("button", { type: "button", onClick: () => onChange([...items, makeNew()]), className: "press inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-neu-muted", children: [_jsx(Plus, { className: "size-4" }), " ", addLabel] })] }));
}
