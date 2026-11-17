import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createServer, loadEnv } from "vite";

const root = process.cwd();
const outputDirectory = path.join(root, "dist");
const env = loadEnv("production", root, "");
const siteUrl = new URL(process.env.SITE_URL || env.SITE_URL || "https://khanmuhammad.dev");
if (!["http:", "https:"].includes(siteUrl.protocol)) {
    throw new Error("SITE_URL must be an http or https URL.");
}
const siteOrigin = siteUrl.origin;
const contentUrl = process.env.PRERENDER_CONTENT_URL
    || env.PRERENDER_CONTENT_URL
    || new URL("/api/content", siteOrigin).href;

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll('"', "&quot;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");
}

function safeJson(value) {
    return JSON.stringify(value)
        .replaceAll("<", "\\u003c")
        .replaceAll(">", "\\u003e")
        .replaceAll("&", "\\u0026")
        .replaceAll("\u2028", "\\u2028")
        .replaceAll("\u2029", "\\u2029");
}

function excerpt(post) {
    const text = (post.excerpt || post.body || "").replace(/\s+/g, " ").trim();
    return text.length > 200 ? `${text.slice(0, 197)}...` : text;
}

function pageMetadata(pathname, post) {
    if (post) {
        const description = excerpt(post);
        const article = {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            author: { "@type": "Person", name: "Khan Muhammad" },
            description,
        };
        if (post.date) article.datePublished = post.date;
        if (post.coverImage) article.image = new URL(post.coverImage, siteOrigin).href;
        return {
            title: `${post.title} — Khan Muhammad`,
            description,
            type: "article",
            image: post.coverImage ? new URL(post.coverImage, siteOrigin).href : null,
            jsonLd: article,
        };
    }

    if (pathname === "/blog") {
        return {
            title: "Blog — Khan Muhammad",
            description: "Ideas, lessons, and things Khan Muhammad learns while building for the web.",
        };
    }
    if (pathname === "/themes") {
        return {
            title: "Themes — Khan Muhammad",
            description: "Explore the visual themes and styles of Khan Muhammad's developer portfolio.",
        };
    }
    if (pathname === "/admin") {
        return {
            title: "Admin — Khan Muhammad",
            description: "Portfolio content administration.",
            noIndex: true,
        };
    }
    return {
        title: "Khan Muhammad — Full-Stack Developer",
        description: "Khan Muhammad is a full-stack developer crafting digital products with React, Python, Flask, and SQLAlchemy.",
    };
}

function buildHead(metadata, canonical) {
    const tags = [
        `<meta name="description" content="${escapeHtml(metadata.description)}" />`,
        `<meta name="robots" content="${metadata.noIndex ? "noindex, nofollow" : "index, follow"}" />`,
        `<link rel="canonical" href="${escapeHtml(canonical)}" />`,
        `<meta property="og:type" content="${metadata.type || "website"}" />`,
        `<meta property="og:title" content="${escapeHtml(metadata.title)}" />`,
        `<meta property="og:description" content="${escapeHtml(metadata.description)}" />`,
        `<meta property="og:url" content="${escapeHtml(canonical)}" />`,
        `<meta name="twitter:card" content="${metadata.image ? "summary_large_image" : "summary"}" />`,
        `<meta name="twitter:title" content="${escapeHtml(metadata.title)}" />`,
        `<meta name="twitter:description" content="${escapeHtml(metadata.description)}" />`,
    ];
    if (metadata.image) {
        tags.push(`<meta property="og:image" content="${escapeHtml(metadata.image)}" />`);
        tags.push(`<meta name="twitter:image" content="${escapeHtml(metadata.image)}" />`);
    }
    if (metadata.jsonLd) {
        tags.push(`<script type="application/ld+json">${safeJson(metadata.jsonLd)}</script>`);
    }
    return tags.join("\n    ");
}

function xmlEscape(value) {
    return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");
}

async function loadPublishedContent() {
    let response;
    try {
        response = await fetch(contentUrl, { signal: AbortSignal.timeout(15000) });
    } catch (error) {
        throw new Error(`Could not fetch prerender content from ${contentUrl}: ${error.message}`);
    }
    if (!response.ok) {
        throw new Error(`Prerender content request failed (${response.status} ${response.statusText}) at ${contentUrl}.`);
    }
    const payload = await response.json();
    if (!payload?.content || typeof payload.content !== "object" || Array.isArray(payload.content)) {
        throw new Error(`Prerender content at ${contentUrl} must return an object in its "content" field.`);
    }
    return payload.content;
}

async function main() {
    const rawContent = await loadPublishedContent();
    const server = await createServer({
        configFile: path.join(root, "vite.config.js"),
        appType: "custom",
        server: { middlewareMode: true },
        logLevel: "error",
    });

    try {
        const [{ renderPage }, { DEFAULT_CONTENT, mergeContent }] = await Promise.all([
            server.ssrLoadModule("/src/ssr.jsx"),
            server.ssrLoadModule("/src/lib/content.js"),
        ]);
        const content = mergeContent(DEFAULT_CONTENT, rawContent);
        const publishedPosts = (content.blogPosts || []).filter((post) => post.published);
        const seenSlugs = new Set();
        for (const post of publishedPosts) {
            if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(post.slug || "")) {
                throw new Error(`Published blog post has an invalid URL slug: ${post.slug}`);
            }
            if (typeof post.title !== "string" || !post.title.trim() || typeof post.body !== "string" || !post.body.trim()) {
                throw new Error(`Published blog post "${post.slug}" needs a title and text body to prerender.`);
            }
            const publishedDate = new Date(`${post.date}T00:00:00Z`);
            if (
                typeof post.date !== "string"
                || !/^\d{4}-\d{2}-\d{2}$/.test(post.date)
                || Number.isNaN(publishedDate.getTime())
                || publishedDate.toISOString().slice(0, 10) !== post.date
            ) {
                throw new Error(`Published blog post "${post.slug}" needs a publish date in YYYY-MM-DD format.`);
            }
            if (seenSlugs.has(post.slug)) {
                throw new Error(`Published blog post slug is duplicated: ${post.slug}`);
            }
            seenSlugs.add(post.slug);
        }

        const template = await readFile(path.join(outputDirectory, "index.html"), "utf8");
        const routes = [
            { pathname: "/", post: null },
            { pathname: "/blog", post: null },
            { pathname: "/themes", post: null },
            { pathname: "/admin", post: null },
            ...publishedPosts.map((post) => ({ pathname: `/blog/${encodeURIComponent(post.slug)}`, post })),
        ];

        for (const { pathname, post } of routes) {
            const metadata = pageMetadata(pathname, post);
            const canonical = new URL(pathname, siteOrigin).href;
            const markup = renderPage(pathname, content);
            let html = template.replace("<div id=\"root\"></div>", `<div id="root">${markup}</div>`);
            if (!html.includes(markup)) {
                throw new Error(`Could not insert prerendered markup for ${pathname} into the Vite HTML template.`);
            }
            html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(metadata.title)}</title>`);
            html = html.replace(/<meta name="description"[^>]*\/?>/, "");
            html = html.replace(/<meta name="robots"[^>]*\/?>/, "");
            html = html.replace("</head>", `    ${buildHead(metadata, canonical)}\n  </head>`);
            html = html.replace("</body>", `  <script id="__INITIAL_CONTENT__" type="application/json">${safeJson(content)}</script>\n  </body>`);

            const filePath = pathname === "/"
                ? path.join(outputDirectory, "index.html")
                : path.join(outputDirectory, pathname.slice(1), "index.html");
            await mkdir(path.dirname(filePath), { recursive: true });
            await writeFile(filePath, html);
            console.log(`Prerendered ${pathname}`);
        }

        const publicPaths = ["/", "/blog", "/themes", ...publishedPosts.map((post) => `/blog/${encodeURIComponent(post.slug)}`)];
        const sitemap = [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
            ...publicPaths.map((pathname) => `  <url><loc>${xmlEscape(new URL(pathname, siteOrigin).href)}</loc></url>`),
            "</urlset>",
            "",
        ].join("\n");
        await writeFile(path.join(outputDirectory, "sitemap.xml"), sitemap);

        const llms = [
            "# Khan Muhammad",
            "",
            "> Full-stack developer from Pakistan building digital products with React, Python, Flask, and SQLAlchemy.",
            "",
            "## Portfolio",
            `- [Home](${new URL("/", siteOrigin).href})`,
            `- [Blog](${new URL("/blog", siteOrigin).href})`,
            `- [Themes](${new URL("/themes", siteOrigin).href})`,
            "",
            "## Blog posts",
            ...(publishedPosts.length
                ? publishedPosts.map((post) => `- [${post.title}](${new URL(`/blog/${encodeURIComponent(post.slug)}`, siteOrigin).href})`)
                : ["- No published blog posts are available yet."]),
            "",
        ].join("\n");
        await writeFile(path.join(outputDirectory, "llms.txt"), llms);
    } finally {
        await server.close();
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
