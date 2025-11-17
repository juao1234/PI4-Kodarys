import { useState } from "react";
import "../styles/login.css";
import KeyIcon from "@mui/icons-material/Key"
import UserIcon from "@mui/icons-material/Person"
import EyeIcon from "@mui/icons-material/Visibility"
import EyeClosedIcon from "@mui/icons-material/VisibilityOff"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="login-page">
      <h1 className="text-white text-5xl">Kodarys</h1>
      <div className="flex flex-col gap-8 bg-slate-900/80 !p-16 border border-slate-950/30 rounded-2xl ">
        <div className="flex flex-col gap-3 !text-center">
          <h3 className="text-white font-inherit tracking-wide text-xl font-bold">Entre com a sua conta Kodarys</h3>
          <h4 className="text-neutral-400 font-inherit text-lg">A aventura aguarda o seu retorno</h4>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-white font-inherit tracking-wide">Nome do usuário</p>
          <div className="flex items-center gap-2 border border-neutral-400 rounded-lg !p-2">
            <UserIcon  className="!mr-4.3"/>
            <input placeholder="Digite seu nome" className="!w-full"/>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-white font-inherit tracking-wide">Senha</p>
          <div className="flex items-center gap-2 border border-slate-400 rounded-lg !py-1 justify-between flex-wrap !px-2">
            <KeyIcon />
          <input
            type={showPassword ? "text" : "password"} 
            placeholder="Digite sua senha" 
          />
          <div className="cursor-pointer">
            {showPassword? <EyeClosedIcon onClick={() => setShowPassword(!showPassword)} /> : <EyeIcon onClick={() => setShowPassword(!showPassword)} />}
          </div>
          </div>
        </div>
        <button type="submit" className="bg-blue-500 text-white !p-4 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors hover:-translate-y-3 transition-transform">Entrar na aventura</button>
        <p className="text-center">Novo por aqui?<span className="text-blue-500 cursor-pointer hover:underline hover:text-blue-700 transition-colors"> Crie a sua conta</span></p>
      </div>
    </div>
  );
}
