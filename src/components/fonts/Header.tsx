import React, { useEffect, useRef } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";

interface HeaderProps {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
}

const Header: React.FC<HeaderProps> = ({ searchTerm, setSearchTerm }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (searchTerm.trim() === "") return;

        const params = new URLSearchParams(searchParams);
        params.set("search", searchTerm);

        if (location.pathname !== "/fonts") {
            navigate("/fonts");
        }
    }, [searchTerm]);

    // ✅ Focus vào ô tìm kiếm khi pathname là /fonts
    useEffect(() => {
        if (location.pathname === "/fonts") {
            inputRef.current?.focus();
        }
    }, [location.pathname]);

    return (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 px-4 py-2">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => { navigate("/fonts"); }}>
                <img
                    alt="Google Fonts logo"
                    className="w-6 h-6"
                    src="https://storage.googleapis.com/a1aa/image/42e5c8d4-6b59-4994-d2cd-b45f2bc8956b.jpg"
                />
                <span className="font-semibold text-lg select-none">
                    Google Fonts
                </span>
            </div>

            <div className="flex items-center space-x-3 w-full md:w-auto">
                <div className="relative flex-1 md:flex-none">
                    <input
                        ref={inputRef}
                        aria-label="Search fonts"
                        type="search"
                        placeholder="Search fonts"
                        className="w-full rounded-full border border-gray-300 bg-gray-100 py-2 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
            </div>
        </div>
    );
};

export default Header;
