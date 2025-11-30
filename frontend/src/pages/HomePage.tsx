import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { HeroContent } from "../components/HeroContent";
import Cursos from "../components/Cursos"
import AboutUs from "../components/AboutUs";
import Pricing from "../components/Princing";

export default function HomePage() {
  const [moduleStatus, setModuleStatus] = useState<string | null>(null);

  useEffect(() => {
    const status = sessionStorage.getItem("kodarys-module-status");
    if (status) {
      setModuleStatus(status);
      sessionStorage.removeItem("kodarys-module-status");
    }
  }, []);


  return (
    <>
      <div className="main-content">
        <Navbar />
        {moduleStatus === 'concluido' && (
          <div className="flex justify-center w-full !px-4">
            <div className="bg-green-600 text-white font-semibold !px-4 !py-2 rounded-lg shadow-lg shadow-green-900/30 border border-green-400/70">
              Módulo concluído! Seu progresso foi salvo.
            </div>
          </div>
        )}
        <HeroContent />
      </div>
      <main>
        <Cursos />
        <AboutUs />
        <Pricing />
      </main>
    </>
  );
}
