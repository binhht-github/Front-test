import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import FontsList from "@/components/fonts/FontsList";
import { fetchFonts } from "@/services/fonts.api";
import Aside from "@/components/fonts/Aside";
import Header from "@/components/fonts/Header";
import { useSearchParams } from "react-router-dom";
import { isFontFavorite } from "@/utils/favoriteFonts";

export const GoogleFontPage = () => {
    const { data: fonts, isLoading, isError } = useQuery({
        queryKey: ["fonts"],
        queryFn: fetchFonts,
    });

    const [searchParams, setSearchParams] = useSearchParams();
    const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const initialText = searchParams.get("text") || "";
    const initialSize = Number(searchParams.get("size")) || 40;
    const initialSearchTerm = searchParams.get("search") || "";
    const initialSubset = searchParams.get("subset") || "";

    const [previewText, setPreviewText] = useState<string>(initialText);
    const [textSize, setTextSize] = useState<number>(initialSize);
    const [searchTerm, setSearchTerm] = useState<string>(initialSearchTerm);
    const [showOnlyFavorites, setShowOnlyFavorites] = useState<boolean>(false);
    const [selectedSubset, setSelectedSubset] = useState<string>(initialSubset);

    const updateSearchParam = (key: string, value: string) => {
        if (key === "text") setPreviewText(value);
        if (key === "size") setTextSize(Number(value));
        if (key === "search") setSearchTerm(value);
        if (key === "subset") setSelectedSubset(value);

        if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);

        debounceTimeoutRef.current = setTimeout(() => {
            const params = new URLSearchParams(searchParams);
            if (value) {
                params.set(key, value);
            } else {
                params.delete(key);
            }
            setSearchParams(params, { replace: true });
        }, 300);
    };

    const resetAllSearchParams = () => {
        setSearchParams({}, { replace: true });
        setPreviewText("");
        setTextSize(40);
        setSearchTerm("");
        setSelectedSubset("");
        setShowOnlyFavorites(false);
    };

    useEffect(() => {
        return () => {
            if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
        };
    }, []);

    if (isLoading) return <p className="p-6">Loading fonts...</p>;
    if (isError || !fonts || !Array.isArray(fonts))
        return <p className="p-6 text-red-500">Error loading fonts.</p>;

    const filteredFonts = fonts.filter((font) => {
        const matchesSearch = font.family.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFavorite = showOnlyFavorites ? isFontFavorite(font.family) : true;
        const matchesSubset = selectedSubset ? font.subsets.includes(selectedSubset) : true;

        return matchesSearch && matchesFavorite && matchesSubset;
    });

    const allSubsets = Array.from(new Set(fonts.flatMap((font) => font.subsets))).sort();

    return (
        <div className="w-screen h-screen flex">
            <aside className="h-screen overflow-y-auto">
                <Aside
                    previewText={previewText}
                    updateSearchParam={updateSearchParam}
                    textSize={textSize}
                    showOnlyFavorites={showOnlyFavorites}
                    toggleShowOnlyFavorites={() => setShowOnlyFavorites((prev) => !prev)}
                    resetAllSearchParams={resetAllSearchParams}
                    allSubsets={allSubsets}
                    selectedSubset={selectedSubset}
                />
            </aside>

            <main className="flex-1 flex flex-col">
                <div className="p-6 sticky top-0 bg-white z-10 border-b">
                    <Header
                        searchTerm={searchTerm}
                        setSearchTerm={(value) => updateSearchParam("search", value)}
                    />
                </div>

                <FontsList
                    fonts={filteredFonts}
                    previewText={previewText}
                    textSize={textSize}
                />
            </main>
        </div>
    );
};
