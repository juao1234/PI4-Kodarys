import { useAuth } from "../contexts/AuthContext";

export default function Cursos() {

    const { user } = useAuth();

    

    return (
        <div>
            <h1>Cursos</h1>

        </div>
    );
}