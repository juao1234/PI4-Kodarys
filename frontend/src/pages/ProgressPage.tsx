import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Sparkles, Clock, BookOpen, Lock, Trophy, Star } from "lucide-react";
import Navbar from "../components/Navbar";
import { useAuth } from "../contexts/AuthContext";

type ProgressPayload = {
  missao_atual?: string;
  ultima_missao?: string;
  ponto_historia_atual?: string;
  status_missao?: string;
  modulo_status?: string;
  ultima_atualizacao?: string;
  porcentagem?: number;
};

const MISSION_NAMES: Record<string, string> = {
  "M01_INTRO": "Capítulo 1: O Despertar da Sintaxe",
  "M02_VARIAVEIS": "Capítulo 2: O Segredo das Variáveis",
  "M03_INPUT": "Capítulo 3: O Oráculo de Entrada",
  "M04_OPERADORES": "Capítulo 4: A Alquimia dos Operadores",
  "M05_FINAL": "Desafio Final: A Provação do Mago",
};

export default function ProgressPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [progress, setProgress] = useState<ProgressPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) {
      navigate("/auth/login");
      return;
    }

    const fetchProgress = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `http://localhost:8080/api/progresso?userId=${encodeURIComponent(user.email)}`
        );
        if (res.ok) {
          const data = (await res.json()) as ProgressPayload;
          setProgress(data);
        }
      } catch (err) {
        console.error("Erro ao buscar progresso", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [user?.email, navigate]);

  // CORREÇÃO AQUI: Alterado de 35 para 0 no valor padrão
  const completion = useMemo(() => {
    if (!progress) return 0;
    const finished =
      progress.status_missao === "CONCLUIDA" || progress.modulo_status === "CONCLUIDO";
    // Se não tiver porcentagem vindo do banco, e não estiver finalizado, assume 0%
    const base = progress.porcentagem ?? (finished ? 100 : 0); 
    return Math.min(100, Math.max(0, base));
  }, [progress]);

  const statusLabel = useMemo(() => {
    if (!progress) return "Carregando...";
    if (progress.status_missao === "CONCLUIDA" || progress.modulo_status === "CONCLUIDO")
      return "Módulo Concluído";
    if (progress.status_missao === "EM_ANDAMENTO") return "Em Andamento";
    return "Não Iniciado";
  }, [progress]);

  const rawMissionName = progress?.missao_atual || progress?.ultima_missao || "M01_INTRO";
  const displayMissionName = MISSION_NAMES[rawMissionName] || rawMissionName;

  const lastUpdate = useMemo(() => {
    if (!progress?.ultima_atualizacao) return "Hoje";
    const date = new Date(progress.ultima_atualizacao);
    return Number.isNaN(date.getTime()) ? "Recentemente" : date.toLocaleDateString('pt-BR');
  }, [progress]);

  const isModuleFinished = progress?.modulo_status === "CONCLUIDO";

  const displayName = user?.name ? (user.name.includes('@') ? user.name.split('@')[0] : user.name) : "Viajante";

  return (
    <div className="relative w-full min-h-screen bg-black overflow-hidden font-sans text-white selection:bg-cyan-500/30">
      
      <div
        className="absolute inset-0 z-0 opacity-40"
        style={{
          backgroundImage: 'url(/homepage.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#050508]/80 via-[#050508]/95 to-[#050508] pointer-events-none" />
      
      <Navbar />

      <main className="relative z-10 w-full min-h-screen flex flex-col items-center justify-center px-6 py-20">
        
        <div className="flex flex-col items-center text-center gap-8 animate-fade-in-up w-full max-w-5xl">
          
          <div className="flex flex-col items-center gap-3 mb-4">
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-[0.3em] border border-cyan-500/30 px-4 py-1.5 rounded-full bg-cyan-950/30 backdrop-blur-sm">
              <Star className="w-3 h-3" /> Área do Aprendiz
            </div>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-500 drop-shadow-2xl">
              Olá, {displayName}
            </h1>
            <p className="text-slate-400 max-w-xl font-light text-lg tracking-wide">
              O grimório reagiu à sua presença. <br/>Sua jornada continua exatamente de onde parou.
            </p>
          </div>

          <div className="w-full flex flex-col gap-4">
            
            <div className={`w-full relative overflow-hidden rounded-3xl p-1 p-[1px] ${isModuleFinished ? 'bg-gradient-to-r from-yellow-500/50 via-orange-500/50 to-yellow-500/50' : 'bg-gradient-to-r from-cyan-500/30 to-purple-500/30'}`}>
              <div className="absolute inset-0 bg-black/40 backdrop-blur-xl rounded-3xl" />
              
              <div className="relative bg-[#0a0a0f]/90 rounded-[23px] p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
                
                <div className={`absolute top-0 right-0 w-96 h-96 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none opacity-40 ${isModuleFinished ? 'bg-amber-500' : 'bg-cyan-500'}`}></div>

                <div className="flex flex-col items-center md:items-start gap-5 text-center md:text-left z-10 flex-1">
                  <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-2xl border ${isModuleFinished ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' : 'bg-cyan-500/20 border-cyan-500/30 text-cyan-300'}`}>
                      {isModuleFinished ? <Trophy className="w-8 h-8" /> : <Sparkles className="w-8 h-8" />}
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold font-serif text-white leading-tight">{displayMissionName}</h2>
                      <span className={`text-sm font-mono uppercase tracking-widest font-bold ${isModuleFinished ? 'text-amber-400' : 'text-cyan-400'}`}>
                        {statusLabel}
                      </span>
                    </div>
                  </div>
                  
                  <div className="w-full max-w-md space-y-2">
                    <div className="flex justify-between text-xs text-slate-400 uppercase tracking-wider font-bold">
                      <span>Sincronização</span>
                      <span>{completion}%</span>
                    </div>
                    <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className={`h-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(0,0,0,0.5)] ${isModuleFinished ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600'}`}
                        style={{ width: `${completion}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4 w-full md:w-auto z-10">
                  <button
                    onClick={() => !isModuleFinished && navigate("/lab")}
                    disabled={isModuleFinished}
                    className={`relative group/btn flex items-center justify-center gap-4 px-12 py-5 rounded-xl font-bold text-lg tracking-widest shadow-xl border transition-all duration-300 overflow-hidden
                      ${isModuleFinished 
                        ? 'bg-gradient-to-b from-slate-800 to-slate-900 border-slate-700/50 text-slate-500 cursor-not-allowed shadow-none grayscale opacity-80' 
                        : 'bg-gradient-to-r from-cyan-600 to-blue-700 text-white border-cyan-400/30 hover:shadow-[0_0_40px_-10px_rgba(8,145,178,0.6)] hover:-translate-y-1'
                      }`}
                  >
                    {!isModuleFinished && (
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                    )}
                    
                    {isModuleFinished ? <Lock className="w-5 h-5" /> : <Play className="w-6 h-6 fill-current relative z-10" />}
                    
                    <span className="relative z-10 font-serif">
                      {isModuleFinished ? "EM BREVE NOVAS MISSÕES" : "CONTINUAR JORNADA"}
                    </span>
                  </button>
                </div>

              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <StatCard 
                icon={<Clock className="w-5 h-5 text-amber-300" />}
                label="Último Acesso"
                value={lastUpdate}
                delay="200ms"
              />
              <StatCard 
                icon={<BookOpen className="w-5 h-5 text-emerald-300" />}
                label="Status do Módulo"
                value={progress?.modulo_status === 'CONCLUIDO' ? 'Finalizado' : 'Em Progresso'}
                delay="300ms"
              />
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value, delay }: { icon: React.ReactNode, label: string, value: string, delay: string }) {
  return (
    <div 
      className="bg-[#0a0a0f]/60 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 hover:bg-white/5 hover:border-white/20 transition-all duration-300 backdrop-blur-md group shadow-lg"
      style={{ animationDelay: delay }}
    >
      <div className="p-3 rounded-full bg-white/5 border border-white/5 group-hover:scale-110 group-hover:bg-white/10 transition-transform duration-300">
        {icon}
      </div>
      <div className="flex flex-col items-center">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500 font-bold mb-1">{label}</p>
        <p className="text-xl font-bold font-serif text-white tracking-wide">{value}</p>
      </div>
    </div>
  );
}