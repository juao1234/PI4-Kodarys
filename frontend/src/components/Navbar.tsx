import { useAuth } from "../contexts/AuthContext";
import { useEffect } from "react";
import UserCard from "./UserCard";

export default function Navbar() {
    let { user } = useAuth();

    useEffect(() => {
        user = JSON.parse(localStorage.getItem("user")!)
    }, [])

    return (
        <nav className="flex items-center justify-between !p-8">
            <h1>Kodarys</h1>
            {user ? (
                <UserCard/>
            ) : (
                <a href="/auth/login">Login</a>
            )}
        </nav>
    )
}