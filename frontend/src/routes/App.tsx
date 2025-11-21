import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/login";
import HomePage from "../pages/HomePage";
import LabPage from "../pages/LabPage";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/auth/login" element={<Login />} />
                <Route path="/" element={<HomePage />} />
                <Route path="/lab" element={<LabPage />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App;
