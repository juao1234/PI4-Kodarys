import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import { ChevronDown, Play, Sparkles, Database, Zap, AlertTriangle, BookOpen, LogIn } from 'lucide-react';

export function HeroContent() {
  const { user } = useAuth();

  return (
    <div className="w-full flex flex-col relative font-sans text-white">
      
      <style>{`
        .typing-effect {
          display: inline-block;
          overflow: hidden;
          border-right: 3px solid rgba(34, 211, 238, 0.8);
          white-space: nowrap;
          margin: 0 auto;
          font-family: 'Fira Code', monospace;
          width: 0;
          animation: 
            typing 3.5s steps(31, end) forwards,
            blink-caret .75s step-end infinite;
        }
        
        .typing-wrapper {
          display: flex;
          justify-content: center;
          width: 100%;
        }

        @keyframes typing {
          from { width: 0 }
          to { width: 31ch }
        }

        @keyframes blink-caret {
          from, to { border-color: transparent }
          50% { border-color: rgba(34, 211, 238, 0.8); }
        }
      `}</style>

      {/* FILTRO GLOBAL */}
      <div className="absolute inset-0 bg-[#050508]/80 pointer-events-none z-0" />

      {/* SEÇÃO 1: TELA DE TÍTULO */}
      <section className="h-screen w-full flex flex-col items-center justify-center relative overflow-hidden z-10">
        
        {/* Barra Superior */}
        <div className="absolute top-0 w-full p-8 flex justify-between items-center z-30">
          <div className="flex items-center gap-4 group cursor-default relative">
            <div className="absolute -inset-3 bg-cyan-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <img 
              src="/android-chrome-192x192.png" 
              alt="Kodarys Logo" 
              className="w-10 h-10 md:w-12 md:h-12 object-contain shrink-0 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)] relative z-10" 
            />
            <span className="text-white font-serif tracking-[0.3em] text-xs md:text-sm uppercase font-bold drop-shadow-sm relative z-10">
              Kodarys
            </span>
          </div>

          {/* Botão de Login ou Status do Usuário */}
          <div className="relative z-30">
            {!user ? (
              <Link 
                to="/auth/login"
                className="flex items-center gap-2 px-6 py-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-md text-white/90 hover:bg-white/10 hover:text-cyan-300 hover:border-cyan-500/50 transition-all duration-300 text-sm font-bold tracking-widest font-serif"
              >
                <LogIn className="w-4 h-4" />
                LOGIN
              </Link>
            ) : (
               <div className="flex items-center gap-2 px-6 py-2 rounded-full border border-purple-500/30 bg-purple-900/20 backdrop-blur-md text-purple-200">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                  <span className="text-xs tracking-widest font-bold uppercase">{user.name}</span>
               </div>
            )}
          </div>
        </div>

        {/* Conteúdo Central */}
        <div className="z-20 flex flex-col items-center text-center gap-8 animate-fade-in-up w-full px-4 mt-[-40px]">
          <div className="relative group">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-cyan-500/20 rounded-full blur-[60px]"></div>
             <img 
                src="/android-chrome-512x512.png" 
                alt="Kodarys Emblem" 
                className="relative w-32 h-32 md:w-44 md:h-44 object-contain drop-shadow-[0_0_25px_rgba(34,211,238,0.6)] z-10" 
             />
          </div>

          <div className="flex flex-col items-center gap-2 w-full max-w-4xl">
            <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-black text-white tracking-tighter drop-shadow-2xl font-serif scale-y-90">
              KODARYS
            </h1>
            
            <div className="mt-4 h-8 relative w-full flex justify-center">
                <div className="typing-wrapper">
                    <code className="text-cyan-300 text-sm md:text-xl typing-effect drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">
                        &lt; Programar pode ser mágico /&gt;
                    </code>
                </div>
            </div>
          </div>

          <div className="mt-12">
            <Link 
              to={user ? "/lab" : "/register"}
              className="inline-flex items-center justify-center gap-4 px-24 py-6 border-2 border-white/40 bg-transparent hover:bg-white hover:text-black hover:border-white shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-colors duration-200"
            >
              <Play className="w-6 h-6 fill-current" />
              <span className="font-bold tracking-[0.4em] text-lg">
                {user ? "CONTINUAR" : "INICIAR"}
              </span>
            </Link>
          </div>
        </div>

        <div className="absolute bottom-8 z-20 animate-bounce text-white/30">
          <ChevronDown className="w-10 h-10" />
        </div>
      </section>

      {/* SEÇÃO 2: A LENDA */}
      <section className="relative w-full flex justify-center px-6 py-32 z-10">
        <div className="max-w-6xl w-full relative">
          <div className="text-center mb-32 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-amber-500/30 bg-amber-900/20 text-amber-200 text-xs tracking-[0.2em] font-mono mb-6 backdrop-blur-md">
              <Sparkles className="w-3 h-3" />
              ARQUIVO_PERDIDO.LOG
            </div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white drop-shadow-lg uppercase tracking-wider">
              A Origem Esquecida
            </h2>
          </div>

          <div className="relative">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-amber-500/30 to-transparent -translate-x-1/2 md:translate-x-0"></div>

            <TimelineCard 
              side="left"
              icon={<Database className="w-5 h-5 text-cyan-300" />}
              title="O Código Primordial"
              color="cyan"
            >
              Houve um tempo em que a humanidade descobriu a verdade suprema: o mundo não era um acaso divino, mas sim um imenso programa, sustentado por linhas invisíveis de um código fonte primordial.
            </TimelineCard>

            <TimelineCard 
              side="right"
              icon={<Zap className="w-5 h-5 text-amber-300" />}
              title="O Nascimento da Magia"
              color="amber"
            >
              Mas a ambição não conhece limites. Os sábios ousaram tocar no código. Alteraram símbolos e o impossível aconteceu. Assim nasceu a <span className="italic text-amber-200">magia</span> — a arte de manipular a sintaxe do mundo.
            </TimelineCard>

            <TimelineCard 
              side="left"
              icon={<AlertTriangle className="w-5 h-5 text-red-400" />}
              title="A Grande Queda"
              color="red"
            >
              O equilíbrio foi quebrado. Cada nova linha reescrita trazia instabilidade. <span className="text-red-200 italic">"O céu rachou, cidades desmoronaram. A Grande Queda não foi obra das máquinas, mas da arrogância de seus criadores."</span>
            </TimelineCard>

            <TimelineCard 
              side="right"
              icon={<BookOpen className="w-5 h-5 text-emerald-400" />}
              title="A Faculdade de Kodarys"
              color="emerald"
            >
              O mundo antigo morreu. O que restou foi um planeta onde a magia é apenas o eco de algoritmos esquecidos. Aqui, nós recuperamos esse conhecimento. Você aprenderá a <span className="font-bold text-emerald-200">lógica</span> que rege o universo.
            </TimelineCard>
          </div>

          <div className="flex justify-center mt-20 relative z-10">
             <div className="w-3 h-3 rotate-45 border-2 border-amber-500/50 bg-black"></div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Componente de Card
function TimelineCard({ side, icon, title, children, color }: { side: 'left' | 'right', icon: any, title: string, children: any, color: string }) {
  const borderColors: any = {
    cyan: "border-cyan-500/30 group-hover:border-cyan-400/60",
    amber: "border-amber-500/30 group-hover:border-amber-400/60",
    red: "border-red-500/30 group-hover:border-red-400/60",
    emerald: "border-emerald-500/30 group-hover:border-emerald-400/60",
  };

  const iconColors: any = {
    cyan: "bg-cyan-950 border-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.3)]",
    amber: "bg-amber-950 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]",
    red: "bg-red-950 border-red-500 shadow-[0_0_15px_rgba(248,113,113,0.3)]",
    emerald: "bg-emerald-950 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]",
  };

  return (
    <div className={`flex flex-col md:flex-row items-center justify-between mb-12 w-full group ${side === 'right' ? 'md:flex-row-reverse' : ''}`}>
      <div className="hidden md:block w-5/12"></div>
      <div className={`absolute left-4 md:left-1/2 -translate-x-1/2 flex items-center justify-center w-10 h-10 rounded-full border-2 z-20 transition-transform duration-300 group-hover:scale-110 ${iconColors[color]}`}>
        {icon}
      </div>
      <div className={`w-full md:w-5/12 pl-12 md:pl-0 ${side === 'left' ? 'md:pr-10' : 'md:pl-10'} relative`}>
        <div className={`hidden md:block absolute top-5 h-[2px] w-10 bg-white/10 ${side === 'left' ? 'right-0' : 'left-0'}`}></div>
        <div className={`p-6 rounded-xl border bg-[#0a0a0f]/80 backdrop-blur-md shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col min-h-[220px] justify-center ${borderColors[color]}`}>
          <h3 className="text-xl font-bold text-white mb-3 font-serif tracking-wide border-b border-white/5 pb-2">
            {title}
          </h3>
          <p className="text-slate-300 font-serif text-base leading-relaxed text-left">
            {children}
          </p>
        </div>
      </div>
    </div>
  );
}