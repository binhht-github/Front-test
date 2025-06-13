import React from "react";

interface Props {
    previewText: string;
    updateSearchParam: (key: string, value: string) => void;
    textSize: number;
    showOnlyFavorites?: boolean;
    toggleShowOnlyFavorites?: () => void;
    resetAllSearchParams: () => void;
    allSubsets: string[];
    selectedSubset?: string;
}

const Aside = ({
    previewText,
    updateSearchParam,
    textSize,
    showOnlyFavorites,
    toggleShowOnlyFavorites,
    resetAllSearchParams,
    allSubsets,
    selectedSubset = "",
}: Props) => {
    const handleChangeText = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        updateSearchParam("text", event.target.value);
    };

    const handleChangeSize = (event: React.ChangeEvent<HTMLInputElement>) => {
        updateSearchParam("size", event.target.value);
    };

    const handleChangeSubset = (event: React.ChangeEvent<HTMLSelectElement>) => {
        updateSearchParam("subset", event.target.value);
    };

    return (
        <div className="md:w-72 border-r border-gray-300 p-4 space-y-6 h-fit">
            {/* Preview text */}
            <div>
                <label htmlFor="preview-text" className="block text-sm font-medium text-gray-900 mb-1">
                    Preview
                </label>
                <textarea
                    id="preview-text"
                    value={previewText}
                    onChange={handleChangeText}
                    className="w-full rounded-md border border-gray-300 p-2 text-lg font-sans resize-none focus:outline-none focus:ring-2 focus:ring-blue-600"
                    rows={5}
                />
            </div>

            {/* Font size slider */}
            <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-900">{textSize}px</span>
                <input
                    type="range"
                    min={8}
                    max={300}
                    value={textSize}
                    onChange={handleChangeSize}
                    aria-label="Font size slider"
                    className="w-full"
                />
            </div>

            {/* Toggle Favorites */}
            {toggleShowOnlyFavorites && (
                <div>
                    <button
                        onClick={toggleShowOnlyFavorites}
                        className={`w-full px-3 py-2 rounded-md text-sm font-medium ${showOnlyFavorites ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                            }`}
                    >
                        {showOnlyFavorites ? "Showing Favorites" : "Show Only Favorites"}
                    </button>
                </div>
            )}

            {/* Reset All */}
            <div>
                <button
                    onClick={resetAllSearchParams}
                    className="w-full px-3 py-2 rounded-md text-sm font-medium bg-red-100 text-red-800 hover:bg-red-200"
                >
                    Reset All
                </button>
            </div>

            {/* Filters */}
            <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Filter</h3>
                <div className="space-y-4 text-sm text-gray-900">
                    <div className="mt-2" id="subset-filter">
                        <select
                            className="w-full text-left bg-blue-50 text-blue-900 rounded-md px-3 py-2 text-sm font-medium"
                            value={selectedSubset}
                            onChange={handleChangeSubset}
                        >
                            <option value="">All writing systems</option>
                            {allSubsets.map((subset) => (
                                <option key={subset} value={subset}>
                                    {subset.charAt(0).toUpperCase() + subset.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Aside;




// import { useState, useEffect, useRef } from "react";
// import { useQuery } from "@tanstack/react-query";
// import FontsList from "@/components/fonts/FontsList";
// import { fetchFonts } from "@/services/fonts.api";
// import Header from "@/components/fonts/Header";
// import { useSearchParams } from "react-router-dom";
// import { isFontFavorite } from "@/utils/favoriteFonts";

// export const GoogleFontPage = () => {
//     const { data: fonts, isLoading, isError } = useQuery({
//         queryKey: ["fonts"],
//         queryFn: fetchFonts,
//     });

//     const [searchParams, setSearchParams] = useSearchParams();
//     const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

//     // Init from URL params
//     const initialText = searchParams.get("text") || "";
//     const initialSize = Number(searchParams.get("size")) || 40;
//     const initialSearchTerm = searchParams.get("search") || "";
//     const initialSubset = searchParams.get("subset") || "";
//     const initialLanguage = searchParams.get("lang") || "";

//     // State
//     const [previewText, setPreviewText] = useState<string>(initialText);
//     const [textSize, setTextSize] = useState<number>(initialSize);
//     const [searchTerm, setSearchTerm] = useState<string>(initialSearchTerm);
//     const [showOnlyFavorites, setShowOnlyFavorites] = useState<boolean>(false);
//     const [selectedSubset, setSelectedSubset] = useState<string>(initialSubset);
//     const [selectedLanguage, setSelectedLanguage] = useState<string>(initialLanguage);

//     // URL param handler
//     const updateSearchParam = (key: string, value: string) => {
//         if (key === "text") setPreviewText(value);
//         if (key === "size") setTextSize(Number(value));
//         if (key === "search") setSearchTerm(value);
//         if (key === "subset") setSelectedSubset(value);
//         if (key === "lang") setSelectedLanguage(value);

//         if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);

//         debounceTimeoutRef.current = setTimeout(() => {
//             const params = new URLSearchParams(searchParams);
//             if (value) {
//                 params.set(key, value);
//             } else {
//                 params.delete(key);
//             }
//             setSearchParams(params, { replace: true });
//         }, 300);
//     };

//     const resetAllSearchParams = () => {
//         setSearchParams({}, { replace: true });
//         setPreviewText("");
//         setTextSize(40);
//         setSearchTerm("");
//         setSelectedSubset("");
//         setSelectedLanguage("");
//         setShowOnlyFavorites(false);
//     };

//     useEffect(() => {
//         return () => {
//             if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
//         };
//     }, []);

//     if (isLoading) return <p className="p-6">Loading fonts...</p>;
//     if (isError || !fonts || !Array.isArray(fonts))
//         return <p className="p-6 text-red-500">Error loading fonts.</p>;

//     // Filter fonts
//     const filteredFonts = fonts.filter((font) => {
//         const matchesSearch = font.family.toLowerCase().includes(searchTerm.toLowerCase());
//         const matchesFavorite = showOnlyFavorites ? isFontFavorite(font.family) : true;
//         const matchesSubset = selectedSubset ? font.subsets.includes(selectedSubset) : true;
//         const matchesLanguage = selectedLanguage
//             ? font.supportedLanguages?.includes(selectedLanguage)
//             : true;

//         return matchesSearch && matchesFavorite && matchesSubset && matchesLanguage;
//     });

//     // Filter options
//     const allSubsets = Array.from(new Set(fonts.flatMap((f) => f.subsets))).sort();
//     const allLanguages = Array.from(
//         new Set(fonts.flatMap((f) => f.supportedLanguages ?? []))
//     ).sort();

//     return (
//         <div className="w-screen h-screen flex">
//             <aside className="h-screen overflow-y-auto">
//                 <aside
//                     previewText={previewText}
//                     updateSearchParam={updateSearchParam}
//                     textSize={textSize}
//                     showOnlyFavorites={showOnlyFavorites}
//                     toggleShowOnlyFavorites={() => setShowOnlyFavorites((prev) => !prev)}
//                     resetAllSearchParams={resetAllSearchParams}
//                     allSubsets={allSubsets}
//                     selectedSubset={selectedSubset}
//                     allLanguages={allLanguages}
//                     selectedLanguage={selectedLanguage}
//                 />
//             </aside>

//             <main className="flex-1 flex flex-col">
//                 <div className="p-6 sticky top-0 bg-white z-10 border-b">
//                     <Header
//                         searchTerm={searchTerm}
//                         setSearchTerm={(value) => updateSearchParam("search", value)}
//                     />
//                 </div>

//                 <FontsList
//                     fonts={filteredFonts}
//                     previewText={previewText}
//                     textSize={textSize}
//                 />
//             </main>
//         </div>
//     );
// };




// // import React from "react";
// // import { ChevronDown } from "lucide-react";

// // interface Props {
// //     previewText: string;
// //     updateSearchParam: (key: string, value: string) => void;
// //     textSize: number;
// //     showOnlyFavorites?: boolean;
// //     toggleShowOnlyFavorites?: () => void;
// //     resetAllSearchParams: () => void;
// //     allSubsets: string[];
// //     selectedSubset?: string;
// // }

// // const Aside = ({
// //     previewText,
// //     updateSearchParam,
// //     textSize,
// //     showOnlyFavorites,
// //     toggleShowOnlyFavorites,
// //     resetAllSearchParams,
// //     allSubsets,
// //     selectedSubset = "",
// // }: Props) => {
// //     const handleChangeText = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
// //         updateSearchParam("text", event.target.value);
// //     };

// //     const handleChangeSize = (event: React.ChangeEvent<HTMLInputElement>) => {
// //         updateSearchParam("size", event.target.value);
// //     };

// //     const handleChangeSubset = (event: React.ChangeEvent<HTMLSelectElement>) => {
// //         updateSearchParam("subset", event.target.value);
// //     };

// //     return (
// //         <div className="md:w-72 border-r border-gray-300 p-4 space-y-6 h-fit">
// //             {/* Preview text */}
// //             <div>
// //                 <label htmlFor="preview-text" className="block text-sm font-medium text-gray-900 mb-1">
// //                     Preview
// //                 </label>
// //                 <textarea
// //                     id="preview-text"
// //                     value={previewText}
// //                     onChange={handleChangeText}
// //                     className="w-full rounded-md border border-gray-300 p-2 text-lg font-sans resize-none focus:outline-none focus:ring-2 focus:ring-blue-600"
// //                     rows={5}
// //                 />
// //             </div>

// //             {/* Font size slider */}
// //             <div className="flex items-center space-x-2">
// //                 <span className="text-sm font-medium text-gray-900">{textSize}px</span>
// //                 <input
// //                     type="range"
// //                     min={8}
// //                     max={300}
// //                     value={textSize}
// //                     onChange={handleChangeSize}
// //                     aria-label="Font size slider"
// //                     className="w-full"
// //                 />
// //             </div>

// //             {/* Toggle Favorites */}
// //             {toggleShowOnlyFavorites && (
// //                 <div>
// //                     <button
// //                         onClick={toggleShowOnlyFavorites}
// //                         className={`w-full px-3 py-2 rounded-md text-sm font-medium ${showOnlyFavorites ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800 hover:bg-gray-200"
// //                             }`}
// //                     >
// //                         {showOnlyFavorites ? "Showing Favorites" : "Show Only Favorites"}
// //                     </button>
// //                 </div>
// //             )}

// //             {/* Reset All */}
// //             <div>
// //                 <button
// //                     onClick={resetAllSearchParams}
// //                     className="w-full px-3 py-2 rounded-md text-sm font-medium bg-red-100 text-red-800 hover:bg-red-200"
// //                 >
// //                     Reset All
// //                 </button>
// //             </div>

// //             {/* Filters */}
// //             <div>
// //                 <h3 className="text-sm font-semibold text-gray-900 mb-3">Filter</h3>
// //                 <div className="space-y-4 text-sm text-gray-900">
// //                     {/* Writing System filter */}
// //                     <div>

// //                         <div className="mt-2" id="subset-filter">
// //                             <select
// //                                 className="w-full text-left bg-blue-50 text-blue-900 rounded-md px-3 py-2 text-sm font-medium"
// //                                 value={selectedSubset}
// //                                 onChange={handleChangeSubset}
// //                             >
// //                                 <option value="">All writing systems</option>
// //                                 {allSubsets.map((subset) => (
// //                                     <option key={subset} value={subset}>
// //                                         {subset.charAt(0).toUpperCase() + subset.slice(1)}
// //                                     </option>
// //                                 ))}
// //                             </select>
// //                         </div>
// //                     </div>

// //                     {/* Language (Future Feature) */}
// //                     <div>
// //                         <button
// //                             type="button"
// //                             aria-controls="language-filter"
// //                             aria-expanded="false"
// //                             className="flex items-center justify-between w-full font-semibold"
// //                         >
// //                             <span>Language</span>
// //                             <ChevronDown className="w-4 h-4" />
// //                         </button>
// //                         <div className="mt-2 text-xs italic text-gray-500">Coming soon...</div>
// //                     </div>
// //                 </div>
// //             </div>
// //         </div>
// //     );
// // };

// // export default Aside;


// // // import React from "react";
// // // import { ChevronDown } from "lucide-react";

// // // interface Props {
// // //     previewText: string;
// // //     updateSearchParam: (key: string, value: string) => void;
// // //     textSize: number;
// // //     showOnlyFavorites?: boolean;
// // //     toggleShowOnlyFavorites?: () => void;
// // //     resetAllSearchParams: () => void;
// // //     allSubsets: string[];
// // // }

// // // const Aside = ({
// // //     previewText,
// // //     updateSearchParam,
// // //     textSize,
// // //     showOnlyFavorites,
// // //     toggleShowOnlyFavorites,
// // //     resetAllSearchParams,
// // //     allSubsets
// // // }: Props) => {
// // //     const handleChangeText = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
// // //         updateSearchParam("text", event.target.value);
// // //     };

// // //     const handleChangeSize = (event: React.ChangeEvent<HTMLInputElement>) => {
// // //         updateSearchParam("size", event.target.value);
// // //     };

// // //     return (
// // //         <div className="md:w-72 border-r border-gray-300 p-4 space-y-6 h-fit">
// // //             {/* Preview text */}
// // //             <div>
// // //                 <label
// // //                     htmlFor="preview-text"
// // //                     className="block text-sm font-medium text-gray-900 mb-1"
// // //                 >
// // //                     Preview
// // //                 </label>
// // //                 <textarea
// // //                     id="preview-text"
// // //                     value={previewText}
// // //                     onChange={handleChangeText}
// // //                     className="w-full rounded-md border border-gray-300 p-2 text-lg font-sans resize-none focus:outline-none focus:ring-2 focus:ring-blue-600"
// // //                     rows={5}
// // //                 />
// // //             </div>

// // //             {/* Font size slider */}
// // //             <div className="flex items-center space-x-2">
// // //                 <span className="text-sm font-medium text-gray-900">{textSize}px</span>
// // //                 <input
// // //                     type="range"
// // //                     min={8}
// // //                     max={300}
// // //                     value={textSize}
// // //                     onChange={handleChangeSize}
// // //                     aria-label="Font size slider"
// // //                     className="w-full"
// // //                 />
// // //             </div>

// // //             {/* Toggle Favorites */}
// // //             {toggleShowOnlyFavorites && (
// // //                 <div>
// // //                     <button
// // //                         onClick={toggleShowOnlyFavorites}
// // //                         className={`w-full px-3 py-2 rounded-md text-sm font-medium ${showOnlyFavorites
// // //                             ? "bg-blue-600 text-white"
// // //                             : "bg-gray-100 text-gray-800 hover:bg-gray-200"
// // //                             }`}
// // //                     >
// // //                         {showOnlyFavorites ? "Showing Favorites" : "Show Only Favorites"}
// // //                     </button>
// // //                 </div>
// // //             )}

// // //             {/* Reset All */}
// // //             <div>
// // //                 <button
// // //                     onClick={resetAllSearchParams}
// // //                     className="w-full px-3 py-2 rounded-md text-sm font-medium bg-red-100 text-red-800 hover:bg-red-200"
// // //                 >
// // //                     Reset All
// // //                 </button>
// // //             </div>

// // //             {/* Filters */}
// // //             <div>
// // //                 <h3 className="text-sm font-semibold text-gray-900 mb-3">Filter</h3>
// // //                 <div className="space-y-4 text-sm text-gray-900">
// // //                     {/* Language filter */}
// // //                     <div>
// // //                         <button
// // //                             type="button"
// // //                             aria-controls="language-filter"
// // //                             aria-expanded="false"
// // //                             className="flex items-center justify-between w-full bg-blue-100 text-blue-900 rounded-md px-3 py-2 font-medium"
// // //                         >
// // //                             <span>Language</span>
// // //                             <ChevronDown className="w-4 h-4" />
// // //                         </button>
// // //                         <div className="mt-2 space-y-2" id="language-filter">

// // //                             <select
// // //                                 className="w-full text-left bg-blue-100 text-blue-900 rounded-md px-3 py-1 text-xs font-medium"
// // //                                 id="preview-text"
// // //                                 name="preview-text"
// // //                             >
// // //                                 <option>Writing system</option>
// // //                                 {
// // //                                     allSubsets.map((item) => {
// // //                                         return (
// // //                                             <option>{item}</option>
// // //                                         )
// // //                                     })
// // //                                 }
// // //                             </select>

// // //                             <button className="w-full text-left bg-blue-100 text-blue-900 rounded-md px-3 py-1 text-xs font-medium">
// // //                                 Language
// // //                             </button>
// // //                         </div>
// // //                     </div>

// // //                     {/* Feeling filter */}
// // //                     <div>
// // //                         <button
// // //                             type="button"
// // //                             aria-controls="feeling-filter"
// // //                             aria-expanded="false"
// // //                             className="flex items-center justify-between w-full font-semibold"
// // //                         >
// // //                             <span>Feeling</span>
// // //                             <ChevronDown className="w-4 h-4" />
// // //                         </button>
// // //                         <div className="mt-2 grid grid-cols-2 gap-2 text-xs" id="feeling-filter">
// // //                             <button className="bg-blue-100 text-blue-900 rounded-md px-3 py-1 font-medium">Business</button>
// // //                             <button className="bg-blue-100 text-blue-900 rounded-md px-3 py-1 font-medium">Calm</button>
// // //                             <button className="italic text-xs text-gray-600">Cute</button>
// // //                             <button className="bg-blue-100 text-blue-900 rounded-md px-3 py-1 font-medium">Playful</button>
// // //                             <button className="italic text-xs text-gray-600">Fancy</button>
// // //                             <button className="bg-blue-100 text-blue-900 rounded-md px-3 py-1 font-medium">Stiff</button>
// // //                         </div>
// // //                         <div className="mt-1 text-xs text-gray-500">Show 12 more</div>
// // //                     </div>
// // //                 </div>
// // //             </div>
// // //         </div>
// // //     );
// // // };

// // // export default Aside;

