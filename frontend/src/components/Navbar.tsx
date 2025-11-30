import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { LogIn, ArrowLeft, User } from "lucide-react";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <nav className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-30 pointer-events-none">
      {/* Lado Esquerdo: Logo */}
      <div className="pointer-events-auto">
        <Link to="/" className="flex items-center gap-4 group">
          <div className="relative">
            <div className="absolute -inset-2 bg-cyan-500/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <img 
              src="/android-chrome-192x192.png" 
              alt="Kodarys Logo" 
              className="w-10 h-10 object-contain drop-shadow-[0_0_10px_rgba(34,211,238,0.8)] relative z-10" 
            />
          </div>
          <span className="text-white font-serif tracking-[0.3em] text-sm uppercase font-bold drop-shadow-sm">
            Kodarys
          </span>
        </Link>
      </div>

      {/* Lado Direito: Ações Dinâmicas */}
      <div className="pointer-events-auto">
        {isHomePage ? (
          /* Lógica da Home Page */
          user ? (
            <div className="flex items-center gap-4">
              <Link to="/profile" className="flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-900/20 backdrop-blur-md text-purple-200 hover:bg-purple-900/40 transition-all">
                <User className="w-4 h-4" />
                <span className="text-xs tracking-widest font-bold uppercase">{user.name}</span>
              </Link>
              <button 
                onClick={signOut}
                className="text-xs text-white/50 hover:text-white transition-colors"
              >
                SAIR
              </button>
            </div>
          ) : (
            <Link 
              to="/auth/login"
              className="flex items-center gap-2 px-6 py-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-md text-white/90 hover:bg-white/10 hover:text-cyan-300 hover:border-cyan-500/50 transition-all duration-300 text-sm font-bold tracking-widest font-serif"
            >
              <LogIn className="w-4 h-4" />
              LOGIN
            </Link>
          )
        ) : (
          /* Lógica para Login/Registro (Botão Voltar) */
          <Link 
            to="/" 
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-all group border border-transparent hover:border-white/10"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-serif tracking-wide text-sm font-bold">Voltar para Home</span>
          </Link>
        )}
      </div>
    </nav>
  );
}