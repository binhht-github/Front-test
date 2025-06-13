import { useEffect } from "react";

export const useGoogleFonts = (families: string[]) => {
    useEffect(() => {
        const toLoad = families.filter((font) => {
            const fontId = `font-${font.replace(/\s+/g, "-")}`;
            return !document.getElementById(fontId);
        });

        if (toLoad.length === 0) return;

        const link = document.createElement("link");
        link.id = `font-batch-${toLoad.map(f => f.replace(/\s+/g, "-")).join("-")}`;
        link.rel = "stylesheet";
        const familyParam = toLoad.map((f) => `family=${f.replace(/ /g, "+")}`).join("&");
        link.href = `https://fonts.googleapis.com/css2?${familyParam}&display=swap`;
        document.head.appendChild(link);

        return () => {
            if (link.parentNode) link.parentNode.removeChild(link);
        };
    }, [families]);
};

