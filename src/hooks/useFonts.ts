import { useQuery } from "@tanstack/react-query";
import { fetchFonts } from "../services/fonts.api";

export const useFonts = () => {
    return useQuery({
        queryKey: ["fonts"],
        queryFn: fetchFonts,
    });
};
