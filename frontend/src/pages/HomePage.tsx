import Navbar from "../components/Navbar";
import { HeroContent } from "../components/HeroContent";

export default function HomePage() {
  return (
    <>
      <div className="main-content">
        <Navbar />
        <HeroContent />
      </div>
    </>
  );
}
