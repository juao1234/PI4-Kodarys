import React, {createContext, useState, useContext, ReactNode} from "react";

type User = {
    id: string;
    name: string;
    email: string;
    avatar?: string;
}

type AuthContextType = {
    user: User | null;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
    children: ReactNode
}

export const AuthProvider = ({children}: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);

    const signIn = async (email: string , password: string) => {
        setUser({
            id: "1",
            name: "John Doe",
            email: "john.doe@example.com",
            avatar: "https://example.com/avatar.jpg"
        })
    }

    const signOut = async () => {
        setUser(null);
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