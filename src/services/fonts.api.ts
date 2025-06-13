
import axios from "axios";

const API_KEY = "AIzaSyBVytj9ZoAOVtHq2Pjs_T2w0TMc64axYiU";
const BASE_URL = "https://www.googleapis.com/webfonts/v1/webfonts";

export const fetchFonts = async () => {
    const res = await axios.get(`${BASE_URL}?key=${API_KEY}`);
    if (!res.data || !res.data.items) {
        throw new Error("No font data found");
    }
    return res.data.items; // ✅ Trả về đúng mảng fonts
};
