import {createContext, useState, useContext, ReactNode} from "react";

type User = {
    id: string;
    name: string;
    classe: string;
    email: string;
    avatar?: string | null;
}

type AuthContextType = {
    user: User | null;
    signIn: () => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
    children: ReactNode
}

export const AuthProvider = ({children}: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);

    const signIn = async () => {
        setUser({
            id: "1",
            name: "John Doe",
            classe: "Guerreiro",
            email: "john.doe@example.com",
            avatar: "https://example.com/avatar.jpg"
        })
        localStorage.setItem("user", JSON.stringify({
            id: "1",
            name: "John Doe",
            classe: "Guerreiro",
            email: "john.doe@example.com",
            avatar: "https://example.com/avatar.jpg"
        }))
    }

    const signOut = async () => {
        setUser(null);
        localStorage.removeItem("user");

    }

    return (
        <AuthContext.Provider 
        value={{
            user, 
            signIn, 
            signOut}}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if(!context) {
        throw new Error ("o useAuth deve ser usado dentro de um AuthProvider")
    }
    return context;
}