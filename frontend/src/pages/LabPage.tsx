import { GoogleGenAI } from '@google/genai';
import { useMemo, useRef, useState, useEffect } from 'react';
import { Send, Code2, Sparkles, Play, Terminal, X, Home, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
  PERSONAS,
  DEFAULT_MISSION,
  MISSION_OBJECTIVES,
  MISSION_ALLOWED,
  MISSION_ORDER,
  FINAL_JUMP_KEYWORD,
  PersonaKey,
  ChatMessage,
  Stage,
  MissionStatus,
  initialMessages,
  pickAutoPersona,
  buildSystemPrompt,
} from '../config/chatConfig';

// Página principal do laboratório: chat narrativo + IDE (Pyodide) e progresso das missões.
type LastAttempt = { code: string; output: string[]; error: string | null };

const STARTER_CODE = '';

const MODEL_NAME = 'gemini-2.5-flash';

const NavbarLocal: React.FC = () => {
  return (
    <nav className="absolute top-0 left-0 w-full z-50 !px-6 !py-4 flex justify-between items-center pointer-events-none">
      {/* Lado Esquerdo: Logo */}
      <div className="flex items-center gap-2 pointer-events-auto cursor-pointer group">
        <div className="p-2 bg-white/10 rounded-full backdrop-blur-sm border border-white/10 group-hover:bg-purple-500/20 transition-colors">
          <Sparkles className="w-5 h-5 text-purple-300" />
        </div>
        {/* Ao clicar no logo, também leva para o perfil se estiver logado */}
        <Link to='/profile' className="font-bold text-lg tracking-wide text-white/90 drop-shadow-md">
          KODARYS
        </Link>
      </div>

      {/* Lado Direito: Botão Voltar para Área Logada */}
      <div className="pointer-events-auto">
        <Link 
          to="/progresso" 
          className="flex items-center gap-2 !px-4 !py-2 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white border border-transparent hover:border-white/10"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Voltar para o Grimório</span>
        </Link>
      </div>
    </nav>
  );
};

interface CodeEditorProps {
  code: string;
  setCode: (code: string) => void;
  runCode: () => void;
  terminalOutput: string[];
  executionError: string | null;
  onClose?: () => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  setCode,
  runCode,
  terminalOutput,
  executionError,
  onClose,
}) => {
  return (
    <div className="w-full h-full flex flex-col gap-4">
      <div className="flex-1 bg-[#0f172a]/90 rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden relative backdrop-blur-sm">
        <div className="flex items-center justify-between !px-4 !py-3 bg-white/10 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
              <div className="w-3 h-3 rounded-full bg-green-500/50" />
            </div>
            <span className="ml-3 text-xs text-slate-400 font-mono">script.py</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={runCode}
              className="flex items-center gap-2 !px-3 !py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-md transition-all shadow-lg shadow-purple-900/20"
            >
              <Play className="w-3 h-3 fill-current" /> Run Code
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-white/10 rounded-md text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          className="flex-1 w-full bg-[#0c1224] p-4 font-mono text-sm text-gray-200 focus:outline-none resize-none"
          placeholder="# Begin your incantation..."
        />

        <div className="h-1/3 bg-[#0b1021] border-t border-white/10 p-4 font-mono text-sm overflow-y-auto">
          <div className="flex items-center gap-2 text-slate-400 mb-2 text-xs uppercase tracking-wider">
            <Terminal className="w-3 h-3" /> Output Log
          </div>
          {terminalOutput.length === 0 && !executionError && (
            <span className="text-slate-600 italic opacity-70">...awaiting execution...</span>
          )}
          {terminalOutput.map((line, idx) => (
            <div key={idx} className="text-green-300 whitespace-pre-wrap">{`> ${line}`}</div>
          ))}
          {executionError && (
            <div className="text-red-300 mt-2 whitespace-pre-wrap border-l-2 border-red-500/60 pl-3">
              {`Error: ${executionError}`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function LabPage() {
  const { user } = useAuth();
  const userId = user?.email;
  const navigate = useNavigate();
  const moduleCompletionSentRef = useRef(false);

  const [code, setCode] = useState(STARTER_CODE);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [executionError, setExecutionError] = useState<string | null>(null);
  const [lastAttempt, setLastAttempt] = useState<LastAttempt | null>(null);
  const [currentMission, setCurrentMission] = useState<string>(DEFAULT_MISSION);
  const [moduleCompleted, setModuleCompleted] = useState(false);
  const [pyodide, setPyodide] = useState<any>(null);
  const [pyStatus, setPyStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [chatInput, setChatInput] = useState('');
  
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(initialMessages);
  
  const [isStreaming, setIsStreaming] = useState(false);
  const [stage, setStage] = useState<Stage>('story');
  const [missionStatus, setMissionStatus] = useState<MissionStatus>('incomplete');
  const storageKey = useMemo(() => `kodarys-code-${userId ?? 'anon'}`, [userId]);

  const placeholderIndexRef = useRef<number | null>(null);
  const lastPersonaRef = useRef<PersonaKey>('sygnus');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
  const aiClient = useMemo(() => {
    if (!apiKey) return null;
    return new GoogleGenAI({ apiKey });
  }, [apiKey]);

  // Carrega Pyodide
  useEffect(() => {
    const ensurePyodide = async () => {
      if (typeof window === 'undefined' || pyodide || pyStatus === 'loading') return;
      setPyStatus('loading');
      try {
        if (!window.loadPyodide) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Falha ao carregar Pyodide'));
            document.body.appendChild(script);
          });
        }
        const py = await window.loadPyodide?.({
          stdin: () => '',
        });
        if (py) {
          setPyodide(py);
          setPyStatus('ready');
        } else {
          throw new Error('Pyodide não inicializado');
        }
      } catch (err) {
        setPyStatus('error');
        setExecutionError(err instanceof Error ? err.message : String(err));
      }
    };
    void ensurePyodide();
  }, [pyodide, pyStatus]);

  // Carrega o último código digitado (por usuário)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved !== null) {
        setCode(saved);
      } else {
        setCode(STARTER_CODE);
      }
    } catch {
      // ignora erro de storage
    }
  }, [storageKey]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    if (stage === 'story' && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages, stage]);

  // --- CARREGAR PROGRESSO E CHAT DO BACKEND ---
  useEffect(() => {
    const fetchProgress = async () => {
      if (!userId) return; // Não carrega se não tiver user
      
      try {
        const res = await fetch(`http://localhost:8080/api/progresso?userId=${encodeURIComponent(userId)}`);
        if (!res.ok) return;
        
        const data = await res.json();
        
        if (data.missao_atual) {
          setCurrentMission(data.missao_atual);
        } else if (data.ultima_missao) {
          setCurrentMission(data.ultima_missao);
        }

        if (data.status_missao === 'CONCLUIDA') {
          setMissionStatus('complete');
        } else {
          setMissionStatus('incomplete');
        }

        if (data.modulo_status === 'CONCLUIDO') {
          setModuleCompleted(true);
          setMissionStatus('complete');
        }

        if (data.historico_dialogos && Array.isArray(data.historico_dialogos) && data.historico_dialogos.length > 0) {
          const loadedMsgs: ChatMessage[] = data.historico_dialogos.map((d: any) => ({
            role: d.persona === 'user' ? 'user' : 'model',
            text: d.texto,
            persona: d.persona === 'user' ? undefined : d.persona
          }));
          
          setChatMessages(loadedMsgs);
          
          setTimeout(() => {
            if (chatContainerRef.current) {
              chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
            }
          }, 100);
        } 
        
      } catch (error) {
        console.error("Erro ao carregar progresso:", error);
      }
    };

    fetchProgress();
  }, [userId]);

  const persistDialog = async (text: string, persona: PersonaKey | 'user') => {
    try {
      await fetch('http://localhost:8080/api/evento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_usuario: userId,
          id_missao: currentMission,
          tipo: 'dialogo',
          persona,
          texto: text,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch {
      // silencia erro de rede
    }
  };

  const persistTentativa = async (codigo: string, output: string[], erro?: string) => {
    try {
      const res = await fetch('http://localhost:8080/api/evento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_usuario: userId,
          id_missao: currentMission,
          tipo: 'tentativa',
          codigo_submetido: codigo,
          output,
          resultado: erro ? 'FALHA' : 'PENDENTE',
          data: new Date().toISOString(),
          erro,
        }),
      });
      if (res.ok) {
        void res.json();
      }
    } catch {
      // silencia erro
    }
  };

  const persistModuleCompletion = async () => {
    if (!userId || moduleCompletionSentRef.current) return;
    moduleCompletionSentRef.current = true;
    try {
      await fetch('http://localhost:8080/api/evento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_usuario: userId,
          id_missao: currentMission,
          tipo: 'concluir_modulo',
        }),
      });
    } catch {
      // silencia erro
    }
  };

  const handleSetCode = (newCode: string) => {
    setCode(newCode);
    try {
      localStorage.setItem(storageKey, newCode);
    } catch {
      // ignora erro de storage
    }
  };

  const runCode = async () => {
    setStage('practice');
    if (!pyodide) {
      setExecutionError(pyStatus === 'loading' ? 'Carregando engine Python...' : 'Engine Python indisponível.');
      return;
    }

    const stdout: string[] = [];
    const stderr: string[] = [];

    pyodide.setStdout?.({ batched: (data: string) => stdout.push(data) });
    pyodide.setStderr?.({ batched: (data: string) => stderr.push(data) });

    pyodide.globals.set('__pyodide_input', (msg?: string) => {
      const val = window.prompt(msg ?? 'Digite um valor:');
      return val ?? '';
    });
    await pyodide.runPythonAsync(`import builtins\nbuiltins.input = __pyodide_input`);

    try {
      await pyodide.runPythonAsync(code);
    } catch (err) {
      stderr.push(err instanceof Error ? err.message : String(err));
    }

    const output = stdout.length ? stdout.map((line) => line.trimEnd()) : [];
    const errorText = stderr.join('\n').trim() || null;

    setTerminalOutput(output);
    setExecutionError(errorText);
    setLastAttempt({ code, output, error: errorText });
    void persistTentativa(code, output, errorText ?? undefined);

    const hasVisibleOutput = output.some((line) => line.trim().length > 0);
    const success = !errorText && hasVisibleOutput;
    setMissionStatus(success ? 'awaiting_feedback' : 'incomplete');
    const joinedOutput = output.join(' | ').trim();
    const runFeedback = success
      ? { persona: 'sygnus' as PersonaKey, text: `${PERSONAS.sygnus.prefix}: Boa execução. A runa respondeu ao seu comando.` }
      : { persona: 'raxos' as PersonaKey, text: `${PERSONAS.raxos.prefix}: Magia falhou: ${errorText ?? 'erro desconhecido'}. Tente novamente.` };

    const missionObjective = MISSION_OBJECTIVES[currentMission] ?? MISSION_OBJECTIVES[DEFAULT_MISSION];
    const autoPrompt = `Avalie a execução automática: ${success ? 'sucesso' : 'falha'}.
Conceito foco: ${missionObjective}
Saída: ${joinedOutput || '(sem saída)'}
Erro: ${errorText ?? 'nenhum'}
Não cite códigos de missão. Dê feedback curto, pedagógico e mencione o próximo passo como uma pequena cena ou obstáculo resolvido. Tom de ${runFeedback.persona}.`;
    void sendPrompt(autoPrompt, runFeedback.persona, true);
  };

  const sendPrompt = async (prompt: string, forcedPersona?: PersonaKey, silentUser?: boolean) => {
    if (!prompt.trim() || isStreaming) return;
    const persona = forcedPersona ?? pickAutoPersona(stage, lastPersonaRef.current);
    lastPersonaRef.current = persona;
    
    if (!silentUser) {
      void persistDialog(prompt, 'user');
    }

    setChatMessages((prev) => {
      const withUser = silentUser ? [] : [{ role: 'user' as const, text: prompt }];
      const combined = [...prev, ...withUser, { role: 'model' as const, text: '', persona }];
      placeholderIndexRef.current = combined.length - 1;
      return combined;
    });
    setIsStreaming(true);

    if (!aiClient) {
      setTimeout(() => {
        setChatMessages((prev) => {
          const updated = [...prev];
          const idx = placeholderIndexRef.current ?? updated.length - 1;
          updated[idx] = { role: 'model', text: 'Narrador: (Sistema) Configure sua API Key para ouvir as vozes de Kodarys.' };
          return updated;
        });
        setIsStreaming(false);
      }, 500);
      return;
    }

    const missionObjective = MISSION_OBJECTIVES[currentMission] ?? MISSION_OBJECTIVES[DEFAULT_MISSION];
    const allowedConcepts = MISSION_ALLOWED[currentMission] ?? MISSION_ALLOWED[DEFAULT_MISSION];
    const isFirstContact = !lastAttempt;
    const attemptContext = lastAttempt
      ? `\n\nÚltima execução do aprendiz (avalie e dê feedback objetivo):\nMissão: ${currentMission}\nCódigo:\n${lastAttempt.code}\nSaída: ${lastAttempt.output.join(' | ')}\nErro: ${lastAttempt.error ?? 'nenhum'}`
      : '';

    const onboarding = isFirstContact
      ? '\nÉ o primeiro contato do aprendiz com programação; Sygnus deve apresentar o conceito do print/strings do zero antes de qualquer pergunta ou tarefa.'
      : '';

    const systemText = buildSystemPrompt({
      persona,
      stage,
      missionObjective,
      missionStatus,
      allowedConcepts,
      onboarding,
    });

    const userPrompt =
      prompt +
      (attemptContext
        ? `\n\nLeia e avalie a última execução (responda em até 4 frases):${attemptContext}`
        : '');

    try {
      const stream = await aiClient.models.generateContentStream({
        model: MODEL_NAME,
        config: {
          thinkingConfig: { thinkingBudget: 0 },
          tools: [{ googleSearch: {} }],
        },
        contents: [
          { role: 'user', parts: [{ text: systemText }] },
          ...chatMessages.map((msg) => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }],
          })),
          { role: 'user', parts: [{ text: userPrompt }] },
        ],
      });

      let assembled = '';

      for await (const chunk of stream) {
        const text = chunk.text ?? '';
        assembled += text;

        setChatMessages((prev) => {
          const updated = [...prev];
          const idx = placeholderIndexRef.current ?? updated.length - 1;
          updated[idx] = { role: 'model', text: assembled, persona };
          return updated;
        });
      }
      
      void persistDialog(assembled, persona);
      
      if (missionStatus === 'awaiting_feedback') {
        setMissionStatus('complete');
        handleMissionCompletion(currentMission);
      }
    } catch (err) {
      setChatMessages((prev) => {
        const updated = [...prev];
        const idx = placeholderIndexRef.current ?? updated.length - 1;
        updated[idx] = {
          role: 'model',
          text: `System Error: Connection to the Ether failed. (${err instanceof Error ? err.message : String(err)})`,
        };
        return updated;
      });
    } finally {
      setIsStreaming(false);
      placeholderIndexRef.current = null;
    }
  };

  const sendMessage = async () => {
    if (!chatInput.trim()) return;
    const prompt = chatInput.trim();
    if (prompt === FINAL_JUMP_KEYWORD) {
      setChatInput('');
      setModuleCompleted(false);
      setCurrentMission('M05_FINAL');
      setMissionStatus('incomplete');
      setStage('story');
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'model',
          persona: 'sygnus',
          text: `${PERSONAS.sygnus.prefix}: Atalho de teste ativado. Você foi levado ao desafio final da dungeon. Prepare uma saudação com nome e idade, some +5 na idade e mostre com print().`,
        },
      ]);
      return;
    }
    setChatInput('');
    await sendPrompt(prompt);
  };

  const getNextMission = (mission: string) => {
    const idx = MISSION_ORDER.indexOf(mission);
    if (idx === -1) return null;
    return MISSION_ORDER[idx + 1] ?? null;
  };

  const handleMissionCompletion = (mission: string) => {
    const next = getNextMission(mission);
    if (!next) {
      setModuleCompleted(true);
      const congrats = `${PERSONAS.sygnus.prefix}: Parabéns! Você concluiu o Módulo. Sua saudação final ecoou por toda Kodarys.`;
      setChatMessages((prev) => [...prev, { role: 'model', persona: 'sygnus', text: congrats }]);
      void persistModuleCompletion();
      sessionStorage.setItem('kodarys-module-status', 'concluido');
      setTimeout(() => {
        if (window.history.length > 1) {
          navigate(-1);
        } else {
          navigate('/', { replace: true });
        }
      }, 800);
      return;
    }
    setTimeout(() => {
      setCurrentMission(next);
      setMissionStatus('incomplete');
      setStage('story');
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'model',
          persona: 'sygnus',
          text: `${PERSONAS.sygnus.prefix}: Excelente! Avancemos para ${next}. Teste o que aprendeu e me mostre sua próxima execução.`,
        },
      ]);
    }, 300);
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-sans selection:bg-purple-500/30">
      <div
        className="absolute inset-0 z-0 transition-transform duration-[20s] ease-linear scale-105 hover:scale-110"
        style={{
          backgroundImage: 'url(/homepage.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/60 via-black/75 to-black/95 pointer-events-none" />
      <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-black/50 pointer-events-none mix-blend-overlay" />

      <NavbarLocal />

      <main className="relative z-20 w-full h-full flex flex-col items-center justify-center !px-4 !py-6">
        <div className="w-full max-w-7xl flex flex-col gap-4 h-full">
          {moduleCompleted && (
            <div className="w-full flex justify-center">
              <div className="!px-4 !py-2 rounded-full bg-green-600/80 text-white text-sm font-semibold shadow-lg shadow-green-900/30 border border-green-400/50">
                Parabéns você concluiu o Módulo!
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-5 flex-1 min-h-[80vh]">
            <div className="bg-[#0b1021]/85 border border-white/10 rounded-2xl p-4 flex flex-col overflow-hidden shadow-2xl shadow-black/50">
              <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto mb-4 pr-2 space-y-4 scroll-smooth mask-image-gradient"
                style={{ maskImage: 'linear-gradient(to bottom, transparent, black 8%, black 100%)' }}
              >
                {chatMessages.map((msg, idx) => {
                  const match = msg.text.match(/^([^:]+):(.*)/s);
                  const name = match ? match[1].trim() : msg.role === 'user' ? 'Human' : 'Unknown';
                  const content = match ? match[2] : msg.text;
                  const codeMatch = msg.text.match(/```(?:python)?\\s*([\\s\\S]*?)```/i);
                  const snippet = codeMatch ? codeMatch[1].trim() : null;

                  let nameColor = 'text-slate-400';
                  if (msg.role === 'user') nameColor = 'text-cyan-300 shadow-cyan-500/20 drop-shadow-sm';
                  else if (name.includes('Sygnus')) nameColor = PERSONAS.sygnus.color;
                  else if (name.includes('Lyra')) nameColor = PERSONAS.lyra.color;
                  else if (name.includes('Raxos')) nameColor = PERSONAS.raxos.color;
                  else if (name.includes('Narrador') || name.includes('Sistema')) nameColor = PERSONAS.narrador.color;

                  return (
                    <div key={idx} className="group animate-fade-in-up w-full flex justify-center">
                      <div className="w-full max-w-3xl flex flex-col gap-1 !py-1 !px-4 rounded-lg hover:bg-white/5 transition-colors duration-300">
                        <span className={`text-sm font-bold font-mono uppercase tracking-wider ${nameColor}`}>
                          {msg.role === 'user' ? (user?.name || userId) : name}
                        </span>
                        <p className="text-slate-200 text-sm md:text-base leading-relaxed font-light opacity-95 group-hover:opacity-100 whitespace-pre-wrap">
                          {content}
                        </p>
                        {snippet && (
                          <div className="flex justify-end">
                            <button
                              onClick={() => {
                                handleSetCode(snippet);
                                setStage('practice');
                              }}
                              className="text-xs !px-2 !py-1 rounded bg-purple-700/60 text-white border border-purple-500/50 hover:bg-purple-600 transition-colors"
                            >
                              Enviar código para IDE
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                {isStreaming && (
                  <div className="flex items-center gap-2 !px-2 opacity-50">
                    <span className="text-purple-400 font-mono text-xs uppercase animate-pulse">Recebendo sinal...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="glass-panel rounded-2xl p-1 flex items-center shadow-2xl shadow-purple-900/10 bg-[#0f172a]/80 border border-white/10">
                <textarea
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder={isStreaming ? 'O éter está ocupado...' : 'Fale seu destino... (Shift+Enter para nova linha)'}
                  className="flex-1 bg-transparent border-none text-white placeholder-slate-500 focus:ring-0 resize-none min-h-[50px] max-h-[120px] !py-3 !px-4 text-base"
                  disabled={isStreaming}
                  rows={1}
                />
                <div className="flex items-center gap-2 pr-2 pb-2">
                  <button
                    onClick={() => sendMessage()}
                    disabled={!chatInput.trim() || isStreaming}
                    className={`p-2 rounded-xl transition-all duration-200 ${
                      chatInput.trim() && !isStreaming
                        ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/25'
                        : 'bg-white/5 text-slate-600 cursor-not-allowed'
                    } ml-[1px]`}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>

            </div>

            <div className="bg-[#0b1021]/85 border border-white/10 rounded-2xl p-4 backdrop-blur-lg shadow-2xl shadow-black/50 min-h-[60vh] flex flex-col gap-3 !p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-200 font-semibold">
                  <Code2 className="w-4 h-4 text-purple-300" />
                  <span>Grimório do Aprendiz</span>
                </div>
                <div className="text-[11px] text-purple-300 font-mono uppercase tracking-[0.2em]">
                  {stage === 'practice' ? 'Prática ativa' : 'Aberto'}
                </div>
              </div>
              <div className="flex-1 min-h-[50vh]">
                <CodeEditor
                  code={code}
                  setCode={handleSetCode}
                  runCode={runCode}
                  terminalOutput={terminalOutput}
                  executionError={executionError}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
declare global {
  interface Window {
    loadPyodide?: any;
  }
}