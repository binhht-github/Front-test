
const Filter = () => {
    return (
        <div className="flex flex-wrap gap-4 mt-6">
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-4 py-3 max-w-xs">
                <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-900">
                        Readability
                    </p>
                    <p className="text-xs text-gray-600">
                        How type influences readability
                    </p>
                </div>
                <div className="bg-blue-200 rounded-md p-2">
                    <svg aria-hidden="true" className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" >
                        <path d="M12 2a10 10 0 0 0-7.07 17.07">
                        </path>
                        <path d="M12 2a10 10 0 0 1 7.07 17.07">
                        </path>
                        <circle cx="12" cy="12" r="3">
                        </circle>
                    </svg>
                </div>
            </div>
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-4 py-3 max-w-xs">
                <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-900">
                        Material design guidelines
                    </p>
                    <p className="text-xs text-gray-600">
                        Styling text
                    </p>
                </div>
                <div className="bg-blue-200 rounded-md p-2">
                    <svg aria-hidden="true" className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" >
                        <circle cx="12" cy="12" r="9">
                        </circle>
                        <path d="M12 3v18">
                        </path>
                        <path d="M3 12h18">
                        </path>
                        <path d="M16 8l-4 8">
                        </path>
                        <path d="M8 8l4 8">
                        </path>
                    </svg>
                </div>
            </div>
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-4 py-3 max-w-xs">
                <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-900">
                        Optimize font loading
                    </p>
                    <p className="text-xs text-gray-600">
                        Achieve faster page load times
                    </p>
                </div>
                <div className="bg-blue-200 rounded-md p-2">
                    <svg aria-hidden="true" className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" >
                        <path d="M15 3l6 6-6 6">
                        </path>
                        <path d="M3 12h18">
                        </path>
                    </svg>
                </div>
            </div>
            <button aria-label="Google Fonts API" className="flex items-center justify-center rounded-full bg-white border border-gray-300 w-12 h-12 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-600" type="button">
                <span className="sr-only">
                    Google Fonts API
                </span>
                <svg aria-hidden="true" className="w-6 h-6" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" >
                    <path d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20z">
                    </path>
                    <path d="M12 6v6l4 2">
                    </path>
                </svg>
            </button>
        </div>
    )
}

export default Filter;