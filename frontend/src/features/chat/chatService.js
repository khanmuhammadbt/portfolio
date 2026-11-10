import { request } from "../../lib/api";
export const chatService = {
    send(message, history, lang) {
        return request("/api/chat", {
            method: "POST",
            body: JSON.stringify({ message, history, lang }),
        });
    },
};
