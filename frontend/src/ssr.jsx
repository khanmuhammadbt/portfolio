import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import App from "./App";

export function renderPage(path, content) {
    return renderToString(
        createElement(StaticRouter, { location: path }, createElement(App, { initialContent: content })),
    );
}
