import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleFontPage } from "@/pages/GoogleFontPage";
import { DetailsFont } from "./components/fonts/DetailsFont";
import { EmployeePage } from "./pages/EmployeePage";

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<GoogleFontPage />} />
          <Route path="/fonts" element={<GoogleFontPage />} />
          <Route path="/fonts/:name" element={<DetailsFont />} />
          <Route path="/employee" element={<EmployeePage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
