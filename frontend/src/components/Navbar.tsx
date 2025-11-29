import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import UserCard from "./UserCard";
import { Separator } from "./Separator";

export default function Navbar() {
  const { user } = useAuth();
  const activate = false;

  return (
    <>
      <nav className="flex items-center justify-between !py-6 !px-24">
        <h1 className="text-2xl">Kodarys</h1>
        <ul className="flex items-center gap-10">
          {activate ? (
            <>
              <a href="#home" className="">
                Home
                <div className="bg-blue-500 h-[1px] w-0 transition-all hover:w-full duration-300"></div>
              </a>
              <a href="#about" className="">
                Sobre Nós
                <div className="bg-blue-500 h-[1px] w-0 transition-all hover:w-full duration-300"></div>
              </a>
              <a href="#offers" className="">
                Ofertas
                <div className="bg-blue-500 h-[1px] w-0 transition-all hover:w-full duration-300"></div>
              </a>
            </>
          ) : (
            <>
              <a href="#home" className="">
                Home
              </a>
              <a href="#about" className="">
                Sobre Nós
              </a>
              <a href="#offers" className="">
                Ofertas
              </a>
            </>
          )}

          {user ? (
            <Link
              to="/profile"
              className="cursor-pointer hover:opacity-80 transition-opacity"
            >
              <UserCard />
            </Link>
          ) : (
            <Link to="/auth/login" className="text-white">
              Login
            </Link>
          )}
        </ul>
      </nav>
      <Separator />
    </>
  );
}
