import { useAuth } from "../contexts/AuthContext"
import { LinkButton } from "./LinkButton"


export function HeroContent() {

    const { user } = useAuth()

    return (
        <div className="flex items-center justify-center !py-64">
            <div className="flex flex-col gap-5 text-center">
                <h1 className="text-4xl font-bold">Desvende a magia da programação</h1>
                <p className="text-md">Aprenda <span>Python</span> através de uma aventura de RPG imersiva <br></br>torne-se um mestre do código</p>
                {user ? (
                    <LinkButton href="#pricing" text="Comece sua aventura" />
                ) : (
                    <LinkButton href="#pricing" text="Comece sua aventura" />
                )}
            </div>
        </div>
    )
}