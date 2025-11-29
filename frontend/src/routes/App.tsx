import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/login";
import HomePage from "../pages/HomePage";
import RegisterPage from "../pages/RegisterPage";
import LabPage from "../pages/LabPage";
import ProfilePage from "../pages/ProfilePage";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/auth/login" element={<Login />} />
                <Route path="/" element={<HomePage />} />
                <Route path="/register" element={<RegisterPage />} />       
                <Route path="/lab" element={<LabPage />} />
                <Route path="/profile" element={<ProfilePage />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App;