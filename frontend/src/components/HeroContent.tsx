import { useAuth } from "../contexts/AuthContext";
import { LinkButton } from "./LinkButton";
import Cursos from "../components/Cursos";

export function HeroContent() {
  const { user } = useAuth();

  return (
    <div className="flex items-center justify-center !py-64">
      <div className="flex flex-col gap-5 text-center">
        {user ? (
          <>
          <Cursos/>
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
          { user ? (
            null
          ) : (
            <LinkButton
            href="/register"
            text={"Comece sua aventura"}
          />
          )
          }
        </div>
      </div>
    </div>
  );
}
