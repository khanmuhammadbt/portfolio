const ALLOWED_TAGS = new Set([
    "P", "BR", "B", "STRONG", "I", "EM", "U",
    "UL", "OL", "LI", "BLOCKQUOTE", "H2", "H3",
]);

export function sanitizeRichText(html) {
    if (typeof html !== "string" || !html)
        return "";

    const hasMarkup = /<\/?[a-z][^>]*>/i.test(html);
    if (!hasMarkup) {
        const paragraphs = html
            .split(/\n\s*\n/)
            .map((paragraph) => paragraph.trim())
            .filter(Boolean);
        if (typeof document === "undefined") {
            return paragraphs
                .map((paragraph) => `<p>${paragraph.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>")}</p>`)
                .join("");
        }
        const escape = (text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        html = paragraphs.map((paragraph) => `<p>${escape(paragraph).replace(/\n/g, "<br>")}</p>`).join("");
    }

    if (typeof document === "undefined") {
        return html
            .replace(/<(script|style|iframe|object|svg)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, "")
            .replace(/<!--[\s\S]*?-->/g, "")
            .replace(/<\/?div\b[^>]*>/gi, (tag) => tag.startsWith("</") ? "</p>" : "<p>")
            .replace(/<(?!(?:\/?(?:p|br|b|strong|i|em|u|ul|ol|li|blockquote|h2|h3)\b)[^>]*>)[^>]*>/gi, "")
            .replace(/<(\/?)(p|br|b|strong|i|em|u|ul|ol|li|blockquote|h2|h3)\b[^>]*>/gi, (_tag, closing, name) => `<${closing}${name.toLowerCase()}>`)
    }

    const template = document.createElement("template");
    template.innerHTML = html;

    template.content.querySelectorAll("div").forEach((div) => {
        const paragraph = document.createElement("p");
        paragraph.append(...Array.from(div.childNodes));
        div.replaceWith(paragraph);
    });

    const clean = (parent) => {
        Array.from(parent.childNodes).forEach((node) => {
            if (node.nodeType === Node.TEXT_NODE)
                return;
            if (node.nodeType !== Node.ELEMENT_NODE) {
                node.remove();
                return;
            }
            clean(node);
            if (!ALLOWED_TAGS.has(node.tagName)) {
                node.replaceWith(...node.childNodes);
            } else {
                Array.from(node.attributes).forEach((attribute) => node.removeAttribute(attribute.name));
            }
        });
    };

    clean(template.content);
    return template.innerHTML;
}
