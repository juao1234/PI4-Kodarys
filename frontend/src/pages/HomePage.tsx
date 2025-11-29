import Navbar from "../components/Navbar";
import { HeroContent } from "../components/HeroContent";
import AboutUs from "../components/AboutUs";
import Pricing from "../components/Princing";

export default function HomePage() {

  // === Função que envia dados de teste para o servidor Java ===
  async function enviarDadosTeste() {
    const usuarioTeste = {
      nome: "Teste " + Math.floor(Math.random() * 1000),
      idade: Math.floor(Math.random() * 80) + 10,
      email: "teste" + Math.floor(Math.random() * 1000) + "@exemplo.com"
    };

    console.log("Enviando:", usuarioTeste);

    try {
      const resposta = await fetch("http://localhost:8080/api/usuario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(usuarioTeste)
      });

      const data = await resposta.json();
      console.log("Resposta do servidor:", data);
      alert("Servidor respondeu: " + data.mensagem);

    } catch (error) {
      console.error("Erro ao enviar:", error);
      alert("Erro ao conectar ao servidor Java.");
    }
  }

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
