import { request, setCsrfToken } from "../../lib/api";
export const authService = {
    async csrf() {
        const data = await request("/api/auth/csrf");
        setCsrfToken(data.csrf_token);
        return data.csrf_token;
    },
    async login(username, password) {
        const data = await request("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({ username, password }),
        });
        setCsrfToken(data.csrf_token);
        return data.admin;
    },
    async logout() {
        await request("/api/auth/logout", { method: "POST", body: "{}" });
        setCsrfToken(null);
    },
    async me() {
        try {
            return await request("/api/auth/me");
        }
        catch {
            return null;
        }
    },
    async changePassword(currentPassword, newPassword) {
        return request("/api/auth/password", {
            method: "POST",
            body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
        });
    },
};
