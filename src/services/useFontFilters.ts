// hooks/useFontFilters.ts
import { useSearchParams } from "react-router-dom";

export const useFontFilters = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const getFilter = (key: string) => searchParams.get(key) || "";
    const setFilter = (key: string, value: string) => {
        if (value) searchParams.set(key, value);
        else searchParams.delete(key);
        setSearchParams(searchParams);
    };

    return {
        category: getFilter("category"),
        subset: getFilter("subset"),
        sort: getFilter("sort"),
        setFilter,
    };
};
