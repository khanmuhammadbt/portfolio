import { ArrowLeft, ArrowRight, CalendarDays, Clock3 } from "lucide-react";
import { m } from "framer-motion";
import { useSiteContent } from "../../store/content";

function formatDate(value) {
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime())
        ? ""
        : new Intl.DateTimeFormat(undefined, { year: "numeric", month: "long", day: "numeric" }).format(date);
}

function PostCard({ post, index }) {
    return (
        <m.article
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.55, delay: (index % 3) * 0.08 }}
            className="neu neu-hover flex min-w-0 flex-col overflow-hidden rounded-[2rem]"
        >
            {post.coverImage ? (
                <img src={post.coverImage} alt="" className="h-52 w-full object-cover" />
            ) : (
                <div className="neu-inset-sm m-5 grid h-44 place-items-center overflow-hidden rounded-[1.5rem]">
                    <span className="font-display text-6xl font-bold text-neu-accent/30">{post.title.slice(0, 1)}</span>
                </div>
            )}
            <div className="flex flex-1 flex-col p-6 pt-2">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-neu-muted">
                    {post.category && <span className="rounded-full bg-neu-accent/10 px-3 py-1 text-neu-accent">{post.category}</span>}
                    {formatDate(post.date) && (
                        <span className="inline-flex items-center gap-1.5"><CalendarDays className="size-3.5" />{formatDate(post.date)}</span>
                    )}
                </div>
                <h2 className="mt-4 font-display text-2xl font-bold leading-tight">{post.title}</h2>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-neu-muted">{post.excerpt}</p>
                <a href={`#/blog/${encodeURIComponent(post.slug)}`} className="press mt-6 inline-flex w-fit items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-neu-accent">
                    Read article <ArrowRight className="size-4 rtl:-scale-x-100" />
                </a>
            </div>
        </m.article>
    );
}

export default function BlogPage({ slug }) {
    const { content } = useSiteContent();
    const posts = [...(content.blogPosts || [])]
        .filter((post) => post.published)
        .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    const post = slug ? posts.find((item) => item.slug === slug) : null;

    if (slug) {
        return (
            <main className="relative min-h-screen px-4 pb-28 pt-32 sm:px-6">
                <div className="glow absolute left-1/2 top-10 size-[34rem] -translate-x-1/2" />
                <article className="relative mx-auto max-w-3xl">
                    <a href="#/blog" className="press inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-neu-muted">
                        <ArrowLeft className="size-4 rtl:-scale-x-100" /> All articles
                    </a>
                    {post ? (
                        <>
                            {post.coverImage && <img src={post.coverImage} alt="" className="neu mt-8 max-h-[28rem] w-full rounded-[2rem] object-cover" />}
                            <div className="mt-10 flex flex-wrap items-center gap-3 text-sm text-neu-muted">
                                {post.category && <span className="rounded-full bg-neu-accent/10 px-3 py-1 text-neu-accent">{post.category}</span>}
                                {formatDate(post.date) && <span className="inline-flex items-center gap-2"><CalendarDays className="size-4" />{formatDate(post.date)}</span>}
                                <span className="inline-flex items-center gap-2"><Clock3 className="size-4" />{Math.max(1, Math.ceil(post.body.trim().split(/\s+/).length / 220))} min read</span>
                            </div>
                            <h1 className="mt-5 font-display text-4xl font-bold leading-tight sm:text-5xl">{post.title}</h1>
                            <p className="mt-5 text-lg leading-relaxed text-neu-muted">{post.excerpt}</p>
                            <div className="mt-10 space-y-5 text-base leading-8 text-neu-text">
                                {post.body.split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
                            </div>
                        </>
                    ) : (
                        <div className="neu mt-10 rounded-[2rem] p-8 text-center">
                            <h1 className="font-display text-3xl font-bold">Article not found</h1>
                            <p className="mt-3 text-neu-muted">This article may have been unpublished or removed.</p>
                        </div>
                    )}
                </article>
            </main>
        );
    }

    return (
        <main className="relative min-h-screen px-4 pb-28 pt-32 sm:px-6">
            <div className="glow absolute left-1/2 top-10 size-[34rem] -translate-x-1/2" />
            <div className="relative mx-auto max-w-6xl">
                <div className="mx-auto max-w-2xl text-center">
                    <span className="neu-xs inline-flex items-center gap-2 rounded-full px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-neu-accent">
                        <span className="size-1.5 rounded-full bg-neu-accent" /> The blog
                    </span>
                    <h1 className="mt-6 font-display text-5xl font-bold sm:text-6xl">Notes from the <span className="text-neu-accent">workbench</span></h1>
                    <p className="mt-5 text-base leading-relaxed text-neu-muted">Ideas, lessons, and things I learn while building for the web.</p>
                </div>
                {posts.length ? (
                    <div className="mt-14 grid gap-7 md:grid-cols-2 xl:grid-cols-3">
                        {posts.map((item, index) => <PostCard key={item.slug || item.title} post={item} index={index} />)}
                    </div>
                ) : (
                    <div className="neu mx-auto mt-14 max-w-2xl rounded-[2rem] p-10 text-center">
                        <h2 className="font-display text-2xl font-bold">New articles are on the way</h2>
                        <p className="mt-3 text-sm leading-relaxed text-neu-muted">Published posts will appear here. Check back soon.</p>
                    </div>
                )}
            </div>
        </main>
    );
}
