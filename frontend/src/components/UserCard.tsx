import UserIcon from "@mui/icons-material/Person"
import { useAuth } from "../contexts/AuthContext"
import { useNavigate } from "react-router-dom"

export default function UserCard() {
    let { user, signOut } = useAuth();
    const navigate = useNavigate();

    const handleLogout = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        signOut();
        navigate("/auth/login");
    };

    return (
        <div className="flex items-center gap-2">
            <div className="bg-blue-500 p-2 rounded-full"><UserIcon/></div>
            <div className="flex flex-col">
                <h2 className="text-white font-bold">{user?.name}</h2>
                <div className="flex gap-2">
                    <p className="text-pink-500 font-bold">{user?.level} - {user?.classe}</p>
                </div>
            </div>
            <button 
                onClick={handleLogout}
                className="text-white"
            >
                Sair
            </button>
        </div>
    )
}