import { useEffect, useState, useRef } from "react"; 
import Navbar from "../components/Navbar";
import { HeroContent } from "../components/HeroContent";
import Cursos from "../components/Cursos";
import { useAuth } from "../contexts/AuthContext";
import "../styles/HomePage.css";

export default function HomePage() {
  const [moduleStatus, setModuleStatus] = useState<string | null>(null);
  const { user } = useAuth();
  const [isDescriptionVisible, setDescriptionVisible] = useState(false);
  const descriptionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const status = sessionStorage.getItem("kodarys-module-status");
    if (status) {
      setModuleStatus(status);
      sessionStorage.removeItem("kodarys-module-status");
    }
  }, []);

  useEffect(() => {
    const currentRef = descriptionRef.current;
    
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        
        if (entry.isIntersecting) {
          setDescriptionVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.1,
      }
    );

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return (
    <>
      <div className="main-content">
        <Navbar />
        
        {moduleStatus === 'concluido' && (
          <div className="flex justify-center w-full px-4">
            <div className="bg-green-600 text-white font-semibold px-4 py-2 rounded-lg shadow-lg shadow-green-900/30 border border-green-400/70">
              Módulo concluído! Seu progresso foi salvo.
            </div>
          </div>
        )}
        
        <HeroContent />
      </div>
      
      <section 
        ref={descriptionRef}
        className={`project-description-section ${isDescriptionVisible ? 'is-visible' : ''}`}
      >
        <div className="container">
          <h2>O que é o Kodarys?</h2>
          <p>
            O projeto Kodarys é uma plataforma inovadora de ensino de programação
            que transforma o aprendizado em uma experiência divertida e imersiva,
            combinando elementos de gamificação, visual novel e RPG. Pensada
            especialmente para estudantes que enfrentam dificuldades com métodos
            tradicionais e falta de engajamento, a plataforma oferece uma jornada
            interativa onde o usuário aprende praticando, lendo, observando,
            interagindo e até ensinando, com o apoio de uma inteligência
            artificial integrada à narrativa. Com um modelo de negócios baseado
            em assinaturas mensais e pacotes para instituições de ensino, o
            Kodarys se destaca por unir uma prática estilo LeetCode com uma
            história envolvente, tornando o estudo de programação acessível,
            estimulante e mágico.
          </p>
        </div>
      </section>

      <main id="cursos">
        {user && <Cursos />}
      </main>
    </>
  );
}