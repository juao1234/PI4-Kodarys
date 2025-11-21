import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/login";
import HomePage from "../pages/HomePage";
import RegisterPage from "../pages/RegisterPage";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/auth/login" element={<Login />} />
                <Route path="/" element={<HomePage />} />
                <Route path="/register" element={<RegisterPage />} />       
            </Routes>
        </BrowserRouter>
    )
}

export default App;