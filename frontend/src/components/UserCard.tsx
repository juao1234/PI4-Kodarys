import UserIcon from "@mui/icons-material/Person"
import { useAuth } from "../contexts/AuthContext"

export default function UserCard() {
    let { user, signOut } = useAuth();
    return (
        <div className="flex items-center gap-2">
            <div className="bg-blue-500 p-2 rounded-full"><UserIcon/></div>
            <div className="flex flex-col">
                <h2 className="text-white font-bold">{user?.name}</h2>
                <div className="flex gap-2">
                    <p className="text-pink-500 font-bold">{user?.level} - {user?.classe}</p>
                </div>
            </div>
            <button onClick={signOut}>Sair</button>
        </div>
    )
}