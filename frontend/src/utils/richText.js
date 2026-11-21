const ALLOWED_TAGS = new Set([
    "P", "BR", "B", "STRONG", "I", "EM", "U",
    "UL", "OL", "LI", "BLOCKQUOTE", "H2", "H3",
]);

export function sanitizeRichText(html) {
    if (typeof html !== "string" || !html)
        return "";

    if (typeof document === "undefined")
        return html
            .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, "")
            .replace(/<!--[\s\S]*?-->/g, "")
            .replace(/<(?!(?:\/?(?:p|br|b|strong|i|em|u|ul|ol|li|blockquote|h2|h3)\b)[^>]*>)[^>]*>/gi, "");

    const template = document.createElement("template");
    template.innerHTML = html;

    const clean = (parent) => {
        Array.from(parent.childNodes).forEach((node) => {
            if (node.nodeType === Node.TEXT_NODE)
                return;
            if (node.nodeType !== Node.ELEMENT_NODE) {
                node.remove();
                return;
            }
            if (!ALLOWED_TAGS.has(node.tagName)) {
                node.replaceWith(...node.childNodes);
                clean(parent);
                return;
            }
            Array.from(node.attributes).forEach((attribute) => node.removeAttribute(attribute.name));
            clean(node);
        });
    };

    clean(template.content);
    return template.innerHTML;
}
