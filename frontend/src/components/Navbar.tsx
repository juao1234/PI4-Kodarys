import { useAuth } from "../contexts/AuthContext";
import { useEffect, useState } from "react";
import UserCard from "./UserCard";
import { Separator } from "./Separator";

export default function Navbar() {
    let { user } = useAuth();

    const [activate] = useState(false);

    useEffect(() => {
        user = JSON.parse(localStorage.getItem("user")!)
    }, [])

    return (
        <>
        <nav className="flex items-center justify-between !py-6 !px-24">
            <h1 className="text-2xl">Kodarys</h1>
            <ul className="flex items-center gap-10">
                {activate ? (
                    <>
                    <a href="#home" className="">Home
                        <div className="bg-blue-500 h-[1px] w-0 transition-all hover:w-full duration-300"></div>
                    </a>
                    <a href="#about" className="">Sobre Nós
                        <div className="bg-blue-500 h-[1px] w-0 transition-all hover:w-full duration-300"></div>
                    </a>
                    <a href="#offers" className="">Ofertas
                        <div className="bg-blue-500 h-[1px] w-0 transition-all hover:w-full duration-300"></div>
                    </a>
                    </>
                ) : (
                    <>
                    <a href="#home" className="">Home</a>
                    <a href="#about" className="">Sobre Nós</a>
                    <a href="#offers" className="">Ofertas</a>
                    </>
                )}                
            {user ? (
                <UserCard/>
            ) : (
                <>
                <a href="/auth/login" className="text-white">Login</a>
                </>
            )}
            </ul>
        </nav>
        <Separator />
        </>
    )
}
