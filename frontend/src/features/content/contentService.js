import { request } from "../../lib/api";
export const contentService = {
    async get() {
        try {
            return await request("/api/content");
        }
        catch {
            return null;
        }
    },
    async save(content) {
        return request("/api/content", {
            method: "PUT",
            body: JSON.stringify({ content }),
        });
    },
};
