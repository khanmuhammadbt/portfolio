import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function offlineServiceWorker() {
    return {
        name: "offline-service-worker",
        generateBundle(_options, bundle) {
            const offlineFiles = [
                "/offline.html",
                "/offline.css",
                "/offline.js",
                "/offline-icon.svg",
                "/favicon.svg",
                "/site.webmanifest",
            ];
            const contentHash = createHash("sha256");
            offlineFiles.forEach((file) => {
                contentHash.update(readFileSync(path.resolve(__dirname, "public", file.slice(1))));
            });
            Object.entries(bundle).forEach(([fileName, output]) => {
                contentHash.update(fileName);
                contentHash.update(output.type === "asset" ? output.source : output.code);
            });
            const cacheVersion = `portfolio-offline-${contentHash.digest("hex").slice(0, 12)}`;
            const builtFiles = Object.keys(bundle).map((file) => `/${file}`);
            const precacheFiles = [
                "/",
                ...offlineFiles,
            ];
            const precacheUrls = [...new Set([...precacheFiles, ...builtFiles])];
            const source = `
const CACHE_NAME = ${JSON.stringify(cacheVersion)};
const CACHE_PREFIX = "portfolio-offline-";
const PRECACHE_URLS = ${JSON.stringify(precacheUrls)};
const PRECACHE_SET = new Set(PRECACHE_URLS.map((url) => new URL(url, self.location.origin).href));

self.addEventListener("install", (event) => {
    event.waitUntil((async () => {
        const cache = await caches.open(CACHE_NAME);
        try {
            await cache.addAll(PRECACHE_URLS);
        } catch (error) {
            await caches.delete(CACHE_NAME);
            throw error;
        }
        await self.skipWaiting();
    })());
});

self.addEventListener("activate", (event) => {
    event.waitUntil((async () => {
        const names = await caches.keys();
        await Promise.all(names
            .filter((name) => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME)
            .map((name) => caches.delete(name)));
        await self.clients.claim();
    })());
});

self.addEventListener("fetch", (event) => {
    const request = event.request;
    const url = new URL(request.url);
    if (request.method !== "GET" || url.origin !== self.location.origin || url.pathname.startsWith("/api/")) {
        return;
    }

    if (request.mode === "navigate") {
        event.respondWith((async () => {
            try {
                return await fetch(request);
            } catch {
                const offlinePage = await caches.match("/offline.html");
                if (offlinePage) {
                    return offlinePage;
                }
                return new Response("You are offline. Please reconnect and try again.", {
                    status: 503,
                    headers: { "Content-Type": "text/plain; charset=utf-8" },
                });
            }
        })());
        return;
    }

    if (PRECACHE_SET.has(url.href)) {
        event.respondWith((async () => {
            const cached = await caches.match(request);
            return cached || fetch(request);
        })());
    }
});
`;
            this.emitFile({ type: "asset", fileName: "sw.js", source });
        },
    };
}

export default defineConfig({
    plugins: [react(), tailwindcss(), offlineServiceWorker()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "src"),
        },
    },
    build: {
        cssCodeSplit: true,
        assetsInlineLimit: 0,
    },
    server: {
        proxy: {
            "/api": {
                target: "http://127.0.0.1:5000",
                changeOrigin: true,
                headers: {
                    Origin: "http://127.0.0.1:5000",
                },
            },
        },
    },
});
