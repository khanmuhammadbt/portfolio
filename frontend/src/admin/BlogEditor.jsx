import { Field, ImageUpload, ListEditor, TextArea, TextInput } from "./fields";

function today() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function newPost() {
    const title = "New article";
    return {
        slug: `new-article-${Date.now().toString(36)}`,
        title,
        excerpt: "",
        body: "",
        category: "Development",
        date: today(),
        coverImage: "",
        published: false,
    };
}

export default function BlogEditor({ posts, onChange }) {
    return (
        <div className="neu rounded-[2rem] p-6 sm:p-8">
            <div className="mb-6">
                <h2 className="font-display text-2xl font-bold">Blog articles</h2>
                <p className="mt-2 text-sm leading-relaxed text-neu-muted">Write articles here. Save your changes to publish; only articles marked Published appear on the public blog.</p>
            </div>
            <ListEditor
                items={posts}
                onChange={onChange}
                addLabel="Write an article"
                makeNew={newPost}
                renderItem={(post, index, update) => (
                    <div className="grid gap-4 pt-3">
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-xs font-semibold uppercase tracking-wider text-neu-muted">Article {index + 1}</span>
                            <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold">
                                <input
                                    type="checkbox"
                                    checked={Boolean(post.published)}
                                    onChange={(event) => update({ published: event.target.checked })}
                                    className="size-4 accent-neu-accent"
                                />
                                Published
                            </label>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="Title"><TextInput value={post.title || ""} onChange={(event) => update({ title: event.target.value })} /></Field>
                            <Field label="URL slug"><TextInput value={post.slug || ""} onChange={(event) => update({ slug: event.target.value.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, "") })} /></Field>
                            <Field label="Category"><TextInput value={post.category || ""} onChange={(event) => update({ category: event.target.value })} /></Field>
                            <Field label="Publish date"><TextInput type="date" value={post.date || ""} onChange={(event) => update({ date: event.target.value })} /></Field>
                        </div>
                        <Field label="Short summary"><TextArea value={post.excerpt || ""} onChange={(event) => update({ excerpt: event.target.value })} /></Field>
                        <Field label="Article body (separate paragraphs with a blank line)"><TextArea rows={12} value={post.body || ""} onChange={(event) => update({ body: event.target.value })} /></Field>
                        <Field label="Cover image">
                            <ImageUpload
                                value={post.coverImage || ""}
                                onChange={(coverImage) => update({ coverImage })}
                                fallbackLabel="No cover image"
                            />
                        </Field>
                    </div>
                )}
            />
        </div>
    );
}
