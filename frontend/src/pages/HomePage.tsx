import { useEffect, useState } from "react";
import { HeroContent } from "../components/HeroContent";
import Cursos from "../components/Cursos"
import { useAuth} from "../contexts/AuthContext"

export default function HomePage() {
  const [moduleStatus, setModuleStatus] = useState<string | null>(null);
  const { user } = useAuth()

  useEffect(() => {
    const status = sessionStorage.getItem("kodarys-module-status");
    if (status) {
      setModuleStatus(status);
      sessionStorage.removeItem("kodarys-module-status");
    }
  }, []);

  return (
    <>
      <div className="main-content relative">
  
        
        {moduleStatus === 'concluido' && (
          <div className="absolute top-24 left-0 w-full z-50 flex justify-center px-4">
            <div className="bg-green-600/90 backdrop-blur text-white font-semibold px-6 py-3 rounded-lg shadow-[0_0_20px_rgba(34,197,94,0.5)] border border-green-400">
              \u2728 Modulo concluido! Progresso salvo no grimório.
            </div>
          </div>
        )}
        
        <HeroContent />
      </div>
      
      <main id="cursos" className="relative z-10 bg-[#0f1016]">
        {user && <Cursos />}
      </main>
    </>
  );
}