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
