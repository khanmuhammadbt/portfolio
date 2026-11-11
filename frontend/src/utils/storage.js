export function getStorage() {
    if (typeof window === "undefined") {
        return null;
    }
    try {
        return window.localStorage;
    }
    catch {
        return null;
    }
}

export function readStorage(key, fallback = null) {
    const storage = getStorage();
    if (!storage) {
        return fallback;
    }
    try {
        const value = storage.getItem(key);
        return value === null ? fallback : value;
    }
    catch {
        return fallback;
    }
}

export function writeStorage(key, value) {
    const storage = getStorage();
    if (!storage) {
        return false;
    }
    try {
        storage.setItem(key, value);
        return true;
    }
    catch {
        return false;
    }
}

export function readJsonStorage(key, fallback = null) {
    const raw = readStorage(key);
    if (raw === null || raw === undefined) {
        return fallback;
    }
    try {
        return JSON.parse(raw);
    }
    catch {
        return fallback;
    }
}

export function writeJsonStorage(key, value) {
    return writeStorage(key, JSON.stringify(value));
}
