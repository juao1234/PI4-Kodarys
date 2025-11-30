import Navbar from "../components/Navbar";
import { HeroContent } from "../components/HeroContent";
import Cursos from "../components/Cursos"
import AboutUs from "../components/AboutUs";
import Pricing from "../components/Princing";

export default function HomePage() {


  return (
    <>
      <div className="main-content">
        <Navbar />
        <HeroContent />
      </div>

      // NÃO IMPLEMENTADO AINDA, CASO HAJA TEMPO SERÁ IMPLEMENTADO!
      <main>
        <Cursos />
        <AboutUs />
        <Pricing />
      </main>
    </>
  );
}
