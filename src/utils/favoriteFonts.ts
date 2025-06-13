const LOCAL_STORAGE_KEY = "favorite_fonts";

export const getFavoriteFonts = (): string[] => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
};

export const toggleFavoriteFont = (fontName: string): string[] => {
    const current = getFavoriteFonts();
    let updated: string[];

    if (current.includes(fontName)) {
        updated = current.filter((f) => f !== fontName);
    } else {
        updated = [...current, fontName];
    }

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    return updated;
};

export const isFontFavorite = (fontName: string): boolean => {
    return getFavoriteFonts().includes(fontName);
};
