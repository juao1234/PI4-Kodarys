import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { LogIn, ArrowLeft, User, LogOut, Sparkles } from "lucide-react";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  // Estilo base dos botões secundários (Perfil/Voltar)
  const glassButtonStyle = "flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 hover:border-cyan-500/50 transition-all duration-300 group shadow-lg";

  return (
    <nav className="absolute top-0 left-0 w-full z-50 pointer-events-none flex justify-center">
      {/* Container largo para telas grandes */}
      <div className="w-full max-w-[1600px] px-8 py-8 md:px-16 flex justify-between items-center">
      
        {/* --- LADO ESQUERDO: LOGO --- */}
        <div className="pointer-events-auto">
          <Link to="/" className="group relative flex items-center gap-4">
            {/* Brilho de fundo no logo */}
            <div className="absolute -inset-4 bg-gradient-to-r from-cyan-600/30 to-purple-600/30 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <div className="relative">
              <img 
                src="/android-chrome-192x192.png" 
                alt="Kodarys Logo" 
                className="w-14 h-14 object-contain drop-shadow-[0_0_15px_rgba(34,211,238,0.6)] transition-transform duration-300 group-hover:scale-110" 
              />
              <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-cyan-300 opacity-0 group-hover:opacity-100 animate-pulse transition-opacity" />
            </div>

            <div className="flex flex-col">
              <span className="font-serif tracking-[0.25em] text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-white drop-shadow-sm">
                KODARYS
              </span>
              <span className="text-xs text-cyan-400/60 uppercase tracking-widest font-mono hidden md:block group-hover:text-cyan-400 transition-colors">
                System.Magic.Init()
              </span>
            </div>
          </Link>
        </div>

        {/* --- LADO DIREITO: AÇÕES --- */}
        <div className="pointer-events-auto flex items-center gap-6">
          {isHomePage ? (
            user ? (
              // === USUÁRIO LOGADO ===
              <div className="flex items-center gap-4 animate-fade-in">
                <Link 
                  to="/profile" 
                  className={`${glassButtonStyle} hover:!border-purple-500/50 hover:bg-purple-900/20 pr-8`}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-cyan-500 flex items-center justify-center shadow-inner">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex flex-col leading-none">
                    <span className="text-[0.65rem] text-purple-300 uppercase font-bold tracking-wider mb-0.5">Aprendiz</span>
                    <span className="text-sm font-bold text-white tracking-wide">{user.name}</span>
                  </div>
                </Link>

                <button 
                  onClick={signOut}
                  className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-red-500/20 hover:border-red-500/50 backdrop-blur-md transition-all text-white/50 hover:text-red-200 shadow-lg"
                  title="Sair do Sistema"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              // === BOTÃO DE LOGIN (DESTACADO) ===
              <Link 
                to="/auth/login"
                // Aumentei padding (px-12 py-4), adicionei borda brilhante e sombra maior
                className="relative inline-flex items-center justify-center px-12 py-4 rounded-full bg-gradient-to-r from-cyan-600 via-blue-600 to-blue-700 text-white font-bold text-base tracking-[0.2em] shadow-[0_0_20px_-5px_rgba(8,145,178,0.5)] hover:shadow-[0_0_40px_-5px_rgba(8,145,178,0.8)] hover:-translate-y-1 transition-all duration-300 overflow-hidden group font-serif border border-cyan-400/30"
              >
                {/* Efeito de brilho "passando" */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                
                {/* Conteúdo Centralizado */}
                <div className="relative flex items-center gap-3 z-10">
                  {/* Ícone um pouco maior para acompanhar o botão grande */}
                  <LogIn className="w-5 h-5" />
                  {/* Leading-none remove espaçamento vertical extra da fonte */}
                  <span className="leading-none mt-[1px]">LOGIN</span>
                </div>
              </Link>
            )
          ) : (
            // === BOTÃO VOLTAR ===
            <Link 
              to="/" 
              className={`${glassButtonStyle} pr-8 pl-6 hover:pl-5 transition-all`}
            >
              <ArrowLeft className="w-5 h-5 text-cyan-300 group-hover:-translate-x-1 transition-transform duration-300" />
              <span className="text-sm font-medium text-white/80 group-hover:text-white font-serif tracking-wide leading-none mt-[1px]">
                Voltar ao Início
              </span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}