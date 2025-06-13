
import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import Header from "./Header";
import { Heart } from "lucide-react"
import {
    isFontFavorite,
    toggleFavoriteFont,
} from "@/utils/favoriteFonts";
import { fetchFonts } from "@/services/fonts.api";
import { useQuery } from "@tanstack/react-query";

export const DetailsFont = () => {
    const { name } = useParams(); // ex: "ABeeZee"
    const [searchParams, setSearchParams] = useSearchParams();


    const { data: fonts, isLoading, isError } = useQuery({
        queryKey: ["fonts"],
        queryFn: fetchFonts,
    });
    const [previewText, setPreviewText] = useState("");
    const [fontSize, setFontSize] = useState(40);
    const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");


    useEffect(() => {
        setPreviewText(searchParams.get("text") || "");
        setFontSize(Number(searchParams.get("size")) || 40);
        if (name) {
            setIsFavorite(isFontFavorite(name));
        }
    }, [searchParams, name]);


    // Đồng bộ lại URL khi thay đổi text hoặc size
    useEffect(() => {
        const params = new URLSearchParams(searchParams);
        params.set("text", previewText);
        params.set("size", fontSize.toString());
        setSearchParams(params, { replace: true });
    }, [previewText, fontSize]);

    // Load font
    useEffect(() => {
        if (!name) return;
        const fontUrl = `https://fonts.googleapis.com/css2?family=${name.replace(/ /g, "+")}&display=swap`;
        if (!document.querySelector(`link[href="${fontUrl}"]`)) {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = fontUrl;
            document.head.appendChild(link);
        }
    }, [name]);



    const currentFont = fonts?.find((font: any) => font.family === name);
    console.log(currentFont);


    const handleChangePreview = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === "preview-text") setPreviewText(value);
        if (name === "font-size") {
            const size = Number(value);
            if (!isNaN(size)) setFontSize(size);
        }
    };

    const [isFavorite, setIsFavorite] = useState(false);
    const handleToggleFavorite = () => {
        if (!name) return;
        const updated = toggleFavoriteFont(name);
        setIsFavorite(updated.includes(name));
    };

    const fontStyles = [
        { label: "Thin 100", className: "font-thin" },
        { label: "ExtraLight 200", className: "font-extralight" },
        { label: "Light 300", className: "font-light" },
        { label: "Regular 400", className: "font-normal" },
        { label: "Medium 500", className: "font-medium" },
        { label: "SemiBold 600", className: "font-semibold" },
        { label: "Bold 700", className: "font-bold" },
        { label: "ExtraBold 800", className: "font-extrabold" },
        { label: "Black 900", className: "font-black" },
    ];

    return (
        <>
            <div className="p-6 sticky top-0 bg-white z-10 border-b">
                <Header searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            </div>

            <main className="px-10 max-w-7xl mx-auto">
                <div className="flex items-center justify-between">
                    <h1 className="text-6xl font-extralight mb-2">{name}</h1>
                    <button onClick={handleToggleFavorite}>
                        <Heart
                            size={30}
                            color={isFavorite ? "red" : "gray"}
                            fill={isFavorite ? "red" : "none"}
                            className="cursor-pointer transition"
                        />
                    </button>
                </div>

                <section className="flex flex-wrap justify-center gap-6 mb-20">
                    <label className="text-base text-gray-900 self-center whitespace-nowrap">
                        Select preview text:
                    </label>
                    <select
                        className="border border-gray-300 rounded-full py-2 px-6"
                        id="preview-text"
                        name="preview-text"
                    >
                        <option>Writing system</option>
                        {
                            currentFont?.subsets!.map((item: any) => {
                                return (
                                    <option key={item} value={item}>{item}</option>
                                )
                            })
                        }
                    </select>

                </section>

                <section>
                    <h2 className="text-4xl font-extralight mb-8">Styles</h2>
                    <form className="flex flex-wrap items-center gap-4 max-w-5xl mb-12">
                        <div className="relative flex-grow min-w-[280px]">
                            <input
                                name="preview-text"
                                type="text"
                                value={previewText}
                                onChange={handleChangePreview}
                                // placeholder="Type here to preview text"
                                className="peer w-full rounded-full border py-3 px-6"
                            />
                            <label className="absolute left-6 -top-5 text-xs text-gray-600   transition-all">
                                Type here to preview text
                            </label>
                        </div>
                        <label className="rounded-lg bg-gray-200 py-3 px-6 text-base text-gray-900 cursor-pointer">
                            {fontSize}px
                        </label>
                        <input
                            name="font-size"
                            type="range"
                            value={fontSize}
                            onChange={handleChangePreview}
                            max={300}
                            min={8}
                            className="flex-grow cursor-pointer accent-blue-500"
                        />
                    </form>

                    {fontStyles.map((style, index) => (
                        <React.Fragment key={index}>
                            <hr className="border-t border-gray-300 mb-8" />
                            <div className="text-gray-700 text-sm mb-1">{style.label}</div>
                            <p
                                style={{ fontSize: `${fontSize}px`, fontFamily: name }}
                                className={`${style.className} leading-tight mb-8`}
                            >
                                {previewText || name}
                            </p>

                            <hr className="border-t border-gray-300 mb-8" />
                            <div className="text-gray-700 text-sm mb-1">{style.label} Italic</div>
                            <p
                                style={{ fontSize: `${fontSize}px`, fontFamily: name }}
                                className={`italic ${style.className} leading-tight mb-8`}
                            >
                                {previewText || name}
                            </p>
                        </React.Fragment>
                    ))}
                </section>
            </main >
        </>
    );
};


