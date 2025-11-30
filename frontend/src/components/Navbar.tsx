import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import UserCard from "./UserCard";
import { Separator } from "./Separator";

export default function Navbar() {
  const { user } = useAuth();

  return (
    <>
      <nav className="flex items-center justify-between !py-6 !px-24">
        <h1 className="text-2xl">Kodarys</h1>
        <ul className="flex items-center gap-10">
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
