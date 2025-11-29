import { createContext, useState, useContext, ReactNode, useEffect } from "react";

type User = {
  id: string;
  name: string;
  classe: string;
  email: string;
  level: number;
  avatar?: string | null;
};

type AuthContextType = {
  user: User | null;
  signIn: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);

  // Carrega usuário salvo no localStorage (se existir)
  useEffect(() => {
    const localUser = localStorage.getItem("user");
    if (localUser) {
      try {
        const parsed = JSON.parse(localUser) as Partial<User>;
        setUser({
          id: parsed.id ?? "1",
          name: parsed.name ?? parsed.email ?? "Aventureiro",
          classe: parsed.classe ?? "Aventureiro",
          email: parsed.email ?? "",
          level: parsed.level ?? 1,
          avatar: parsed.avatar ?? null,
        });
      } catch (e) {
        console.error("Erro ao ler usuário do localStorage:", e);
      }
    }
  }, []);

  const signIn = async (email: string) => {
    const newUser: User = {
      id: "1",
      name: email,          // 👈 aparece no lugar do "John Doe"
      classe: "Aventureiro",
      email,
      level: 1,             // 👈 nível 1 fixo por enquanto
      avatar: null,
    };

    setUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("o useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};
