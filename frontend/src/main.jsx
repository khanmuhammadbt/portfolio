import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";

const root = document.getElementById("root");
const contentNode = document.getElementById("__INITIAL_CONTENT__");
const initialContent = contentNode ? JSON.parse(contentNode.textContent) : null;
const app = (
    <StrictMode>
        <BrowserRouter>
            <App initialContent={initialContent} />
        </BrowserRouter>
    </StrictMode>
);

if (root.hasChildNodes()) {
    hydrateRoot(root, app);
} else {
    createRoot(root).render(app);
}

if (import.meta.env.PROD && "serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").catch((error) => {
            console.error("Offline support could not register its service worker.", error);
        });
    });
}
