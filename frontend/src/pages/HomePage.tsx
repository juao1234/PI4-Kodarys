import Navbar from "../components/Navbar";
import { HeroContent } from "../components/HeroContent";
import AboutUs from "../components/AboutUs";
import Pricing from "../components/Princing";

export default function HomePage() {


  return (
    <>
      <div className="main-content">
        <Navbar />
        <HeroContent />
      </div>

      <main>
        <AboutUs />
        <Pricing />
      </main>
    </>
  );
}
