import { useEffect, useRef, useState } from "react";
import { List, LayoutGrid, ChevronUp } from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useNavigate } from "react-router-dom";

interface ResultProps {
    fonts: any[];
    previewText: string;
    textSize: number;
}

const FontsList = ({ fonts, previewText, textSize }: ResultProps) => {
    const [view, setView] = useState<"grid" | "list">("list");
    const scrollRef = useRef<HTMLDivElement | null>(null);
    const [showScrollTop, setShowScrollTop] = useState(false);

    const columns = view === "grid" ? 3 : 1;
    const rowCount = Math.ceil(fonts.length / columns);

    const rowVirtualizer = useVirtualizer({
        count: rowCount,
        getScrollElement: () => scrollRef.current,
        estimateSize: () => (view === "grid" ? 250 : 140),
        overscan: 5,
    });

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        const handleScroll = () => {
            setShowScrollTop(el.scrollTop > 300);
        };

        el.addEventListener("scroll", handleScroll);
        return () => el.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToTop = () => {
        scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div className="relative flex-1 overflow-y-auto mt-6 space-y-4 text-gray-900" ref={scrollRef}>
            {/* Top bar */}
            <div className="flex items-center justify-between text-xs text-gray-600 px-6">
                <div>{`${fonts.length} of ${fonts.length} families`}</div>
                <div className="flex items-center space-x-3">
                    <span>About these results</span>
                    <button
                        onClick={() => setView("grid")}
                        className={`p-2 rounded border ${view === "grid" ? "bg-blue-500 text-white" : "bg-white text-gray-800"}`}
                    >
                        <LayoutGrid size={18} />
                    </button>
                    <button
                        onClick={() => setView("list")}
                        className={`p-2 rounded border ${view === "list" ? "bg-blue-500 text-white" : "bg-white text-gray-800"}`}
                    >
                        <List size={18} />
                    </button>
                </div>
            </div>

            {/* Virtual scroll wrapper */}
            <div className="relative px-4">
                <div
                    style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: "relative" }}
                >
                    {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                        const startIndex = virtualRow.index * columns;
                        const items = fonts.slice(startIndex, startIndex + columns);

                        return (
                            <div
                                key={virtualRow.index}
                                ref={rowVirtualizer.measureElement}
                                data-index={virtualRow.index}
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    width: "100%",
                                    transform: `translateY(${virtualRow.start}px)`,
                                }}
                                className={`grid gap-4 ${view === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : ""}`}
                            >
                                {items.map((font) => (
                                    <FontCard
                                        key={font.family}
                                        font={font}
                                        previewText={previewText}
                                        fontSize={textSize}
                                        isList={view === "list"}
                                    />
                                ))}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Scroll to top button */}
            {showScrollTop && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-6 right-6 z-50 p-2 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition"
                >
                    <ChevronUp size={20} />
                </button>
            )}
        </div>
    );
};

export default FontsList;



const FontCard = ({
    font,
    previewText,
    fontSize,
    isList,
}: {
    font: any;
    previewText: string;
    fontSize: number;
    isList?: boolean;
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [fontLoaded, setFontLoaded] = useState(false);
    const navigate = useNavigate();

    const fontUrl = `https://fonts.googleapis.com/css2?family=${font.family.replace(/ /g, "+")}&display=swap`;

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsVisible(true);
                    }
                });
            },
            { threshold: 0.1 }
        );

        if (ref.current) observer.observe(ref.current);

        return () => {
            if (ref.current) observer.unobserve(ref.current);
        };
    }, []);

    useEffect(() => {
        if (!isVisible || fontLoaded) return;

        const exists = document.querySelector(`link[href="${fontUrl}"]`) as HTMLLinkElement;

        if (!exists) {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = fontUrl;
            document.head.appendChild(link);
        }

        setFontLoaded(true);
    }, [isVisible, fontLoaded, fontUrl]);


    const handleDetail = () => {

        if (previewText && fontSize) {
            const query = new URLSearchParams({
                "text": previewText,
                "size": fontSize.toString(),
            }).toString();
            navigate(`/fonts/${font.family}?${query}`);
        } else {
            navigate(`/fonts/${font.family}`);
        }

    };


    const preview = previewText || font.family;

    return (
        <div
            ref={ref}
            className={`border rounded-lg p-4 shadow-sm hover:shadow-md transition ${isList ? "flex items-center space-x-4 cursor-pointer" : ""
                }`}
            onClick={handleDetail}
        >
            <div className={`${isList ? "w-48 shrink-0" : "mb-2"} text-sm font-medium text-gray-500`}>
                {font.family}
            </div>
            <div
                style={{
                    fontFamily: font.family,
                    fontSize: `${fontSize}px`,
                }}
                className="truncate"
            >
                {preview}
            </div>
        </div>
    );
};
