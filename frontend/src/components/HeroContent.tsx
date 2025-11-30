import { useAuth } from "../contexts/AuthContext";
import { LinkButton } from "./LinkButton";

export function HeroContent() {
  const { user } = useAuth();

  return (
    <div className="flex items-center justify-center !py-64">
      <div className="flex flex-col gap-5 text-center">
        {user ? (
          <>
            <h1 className="text-4xl font-bold">
              Bem-vindo(a), {user.name}!
            </h1>
            <p className="text-md">
              Nível <span>{user.level}</span> • Classe{" "}
              <span>{user.classe ?? "Aventureiro"}</span>
            </p>        
          </>
        ) : (
          <>
            <h1 className="text-4xl font-bold">
              Desvende a magia da programação
            </h1>
            <p className="text-md">
              Aprenda <span>Python</span> através de uma aventura de RPG
              imersiva <br />
              torne-se um mestre do código
            </p>
          </>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <LinkButton
            href="/login"
            text={user ? "Continuar sua aventura" : "Comece sua aventura"}
          />

          { user ? (
            <LinkButton
              href="/lab"
              text="Abrir Lab IA"
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
