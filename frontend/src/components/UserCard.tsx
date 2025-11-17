import UserIcon from "@mui/icons-material/Person"
import { useAuth } from "../contexts/AuthContext"

export default function UserCard() {
    let { user, signOut } = useAuth();
    return (
        <div className="">
            <UserIcon/>
            <div>
                <h2>{user?.name}</h2>
                <p>{user?.classe}</p>
            </div>
            <button onClick={signOut}>Sair</button>
        </div>
    )
}