import { useState } from "react";
import "../styles/login.css";
import KeyIcon from "@mui/icons-material/Key";
import UserIcon from "@mui/icons-material/Person";
import EyeIcon from "@mui/icons-material/Visibility";
import EyeClosedIcon from "@mui/icons-material/VisibilityOff";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { signIn } = useAuth();
  const navigate = useNavigate();

  // agora login é por email + senha
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  async function handleLogar() {
    if (!email || !senha) {
      alert("Preencha email e senha.");
      return;
    }

    const usuario = {
      email,
      senha,
    };

    console.log("Enviando login:", usuario);

    setLoading(true);
    let resposta: Response;

    try {
      resposta = await fetch("http://localhost:8080/api/usuario/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(usuario),
      });
    } catch (error) {
      console.error("Erro ao enviar:", error);
      alert("Erro ao conectar ao servidor.");
      setLoading(false);
      return;
    }

    try {
      const data = await resposta.json();
      console.log("Resposta do backend:", data);

      if (data.status === "ok") {
        alert("Login realizado com sucesso!");
        await signIn(email); // 👈 salva email + nível 1 no contexto
        navigate("/");       // 👈 volta pra Home
      } else {
        alert(data.mensagem || "Erro ao fazer login.");
      }
    } catch (error) {
      console.error("Erro ao ler JSON:", error);
      alert("Resposta inválida do servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <h1 className="text-white text-5xl">Kodarys</h1>
      <div className="flex flex-col gap-8 bg-slate-900/80 !p-16 border border-slate-950/30 rounded-2xl ">
        <div className="flex flex-col gap-3 !text-center">
          <h3 className="text-white font-inherit tracking-wide text-xl font-bold">
            Entre com a sua conta Kodarys
          </h3>
          <h4 className="text-neutral-400 font-inherit text-lg">
            A aventura aguarda o seu retorno
          </h4>
        </div>

        {/* Email */}
        <div className="flex flex-col gap-2">
          <p className="text-white font-inherit tracking-wide">Email</p>
          <div className="flex items-center gap-2 border border-neutral-400 rounded-lg !p-2">
            <UserIcon className="!mr-4.3" />
            <input
              type="email"
              placeholder="Digite seu email"
              className="!w-full bg-transparent outline-none text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        {/* Senha */}
        <div className="flex flex-col gap-2">
          <p className="text-white font-inherit tracking-wide">Senha</p>
          <div className="flex items-center gap-2 border border-slate-400 rounded-lg !p-2 justify-between flex-wrap">
            <KeyIcon />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Digite sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="!w-full bg-transparent outline-none text-white"
            />
            <div className="cursor-pointer">
              {showPassword ? (
                <EyeClosedIcon onClick={() => setShowPassword(!showPassword)} />
              ) : (
                <EyeIcon onClick={() => setShowPassword(!showPassword)} />
              )}
            </div>
          </div>
        </div>

        {/* Botão */}
        {loading ? (
          <button
            className="bg-blue-500 text-white !p-4 rounded-lg cursor-pointer"
            disabled
          >
            Carregando...
          </button>
        ) : (
          <button
            onClick={handleLogar}
            className="bg-blue-500 text-white !p-4 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors hover:-translate-y-1 transition-transform"
          >
            Entrar na aventura
          </button>
        )}

        <p className="text-center">
          Novo por aqui?{" "}
          <Link
            to="/register"
            className="text-blue-500 cursor-pointer hover:underline hover:text-blue-700 transition-colors"
          >
            Crie a sua conta
          </Link>
        </p>
      </div>
    </div>
  );
}
