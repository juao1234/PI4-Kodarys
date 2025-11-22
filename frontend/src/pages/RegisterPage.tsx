import { useState } from "react";
import "../styles/login.css";
import KeyIcon from "@mui/icons-material/Key";
import UserIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import EyeIcon from "@mui/icons-material/Visibility";
import EyeClosedIcon from "@mui/icons-material/VisibilityOff";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { signIn } = useAuth(); 
  const navigate = useNavigate();

  const handleRegister = () => {
    setLoading(true);
    setTimeout(() => {
        setLoading(false);
        navigate("/auth/login");
    }, 1000);
  }

  return (
    <div className="login-page">
      <h1 className="text-white text-5xl">Kodarys</h1>
      <div className="flex flex-col gap-8 bg-slate-900/80 !p-16 border border-slate-950/30 rounded-2xl ">
        <div className="flex flex-col gap-3 !text-center">
          <h3 className="text-white font-inherit tracking-wide text-xl font-bold">CRIE A SUA LENDA</h3>
          <h4 className="text-neutral-400 font-inherit text-lg">Inicie sua jornada no mundo da programação e magia.</h4>
        </div>
        
        <div className="flex flex-col gap-2">
          <p className="text-white font-inherit tracking-wide">Nome do usuário</p>
          <div className="flex items-center gap-2 border border-slate-400 rounded-lg !p-2">
            <UserIcon className="!mr-4.3"/>
            <input placeholder="Digite o seu Nome do Usuário" className="!w-full bg-transparent outline-none text-white"/>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-white font-inherit tracking-wide">Email</p>
          <div className="flex items-center gap-2 border border-slate-400 rounded-lg !p-2">
            <EmailIcon className="!mr-4.3"/>
            <input type="email" placeholder="Digite o seu email" className="!w-full bg-transparent outline-none text-white"/>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-white font-inherit tracking-wide">Senha</p>
          <div className="flex items-center gap-2 border border-slate-400 rounded-lg !p-2">
            <KeyIcon />
            <input
                type={showPassword ? "text" : "password"} 
                placeholder="Digite uma senha" 
                className="!w-full bg-transparent outline-none text-white"
            />
            <div className="cursor-pointer">
                {showPassword ? <EyeClosedIcon onClick={() => setShowPassword(!showPassword)} /> : <EyeIcon onClick={() => setShowPassword(!showPassword)} />}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-white font-inherit tracking-wide">Confirmar Senha</p>
          <div className="flex items-center gap-2 border border-slate-400 rounded-lg !p-2">
            <KeyIcon />
            <input
                type={showConfirmPassword ? "text" : "password"} 
                placeholder="Confirme a senha" 
                className="!w-full bg-transparent outline-none text-white"
            />
            <div className="cursor-pointer">
                {showConfirmPassword ? <EyeClosedIcon onClick={() => setShowConfirmPassword(!showConfirmPassword)} /> : <EyeIcon onClick={() => setShowConfirmPassword(!showConfirmPassword)} />}
            </div>
          </div>
        </div>

        {loading ? (
          <button className="bg-blue-500 text-white !p-4 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors hover:-translate-y-1 transition-transform" disabled={loading}>Carregando...</button>
        ) : (
          <button onClick={handleRegister} className="bg-blue-500 text-white !p-4 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors hover:-translate-y-1 transition-transform" disabled={loading}>Cadastrar</button>
        )}
        <p className="text-center">Já possui uma conta? <Link to="/auth/login" className="text-blue-500 cursor-pointer hover:underline hover:text-blue-700 transition-colors">Faça seu login</Link></p>
      </div>
    </div>
  );
}