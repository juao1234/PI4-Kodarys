import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/login";
import HomePage from "../pages/HomePage";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/auth/login" element={<Login />} />
                <Route path="/" element={<HomePage />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App;