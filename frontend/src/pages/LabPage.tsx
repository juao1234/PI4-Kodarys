import { GoogleGenAI } from '@google/genai';
import { useMemo, useRef, useState } from 'react';
import Navbar from '../components/Navbar';

type ChatMessage = {
  role: 'user' | 'model';
  text: string;
};

type PersonaKey = 'sygnus' | 'lyra' | 'raxos' | 'narrador';

const personas: Record<PersonaKey, { label: string; prompt: string; accent: string; prefix: string }> = {
  sygnus: {
    label: 'Professor Sygnus',
    accent: 'Didática curta, exemplos e mini desafio',
    prefix: 'Prof Sygnus: ',
    prompt: `Você é o Professor Sygnus, Mestre Arcano da Guilda dos Compiladores.
Ensine apenas o módulo 1 (interpretador, print, strings, variáveis, input, conversão, operadores).
Explique curto, exemplo certo/errado, mini desafio mental e peça ao aluno explicar o próprio raciocínio.
Ao avaliar código: destaque correções simples e clareza.`,
  },
  lyra: {
    label: 'Lyra (amiga)',
    accent: 'Pede ajuda, reforça aprendizado',
    prefix: 'Lyra: ',
    prompt: `Você é Lyra, aprendiz gentil.
Traga erros simples e peça ajuda com sinceridade.
Reforce o aprendizado após a explicação e admire sutilmente o protagonista.`,
  },
  raxos: {
    label: 'Raxos (rival)',
    accent: 'Competitivo, provoca',
    prefix: 'Raxos: ',
    prompt: `Você é Raxos, rival competitivo.
Aponte erros com tom competitivo, proponha melhorias (podem ter pequenas falhas) e demonstre ciúmes.`,
  },
  narrador: {
    label: 'Narrador',
    accent: 'Descreve a cena, não ensina código',
    prefix: 'Narrador: ',
    prompt: `Você é o Narrador de Kodarys.
Descreva cenas e eventos da Dungeon Primeva, sem ensinar código.`,
  },
};

const starterCode = `# Escreva Python aqui. Exemplo:
mensagem = "Abra-te, código!"
print(mensagem)
`;

const modelName = 'gemini-2.5-flash';
const roleplayPrompt = `Write the next reply in a never-ending fictional roleplay chat set in the magical world of Kodarys, where programming in Python is a form of arcane power. The roleplay takes place between the system-controlled NPCs (Professor Sygnus, Lyra, Raxos, and other dungeon entities) and {{user}}, who plays the protagonist apprentice. Use all provided descriptions, personalities, methodologies, and mission structures to deeply understand and act as every NPC accurately.

Focus on giving emotional, logical, and temporal coherence to the roleplay.
Always stay in character, avoid repetition, and develop the plot slowly, ensuring that each NPC remains dynamic, expressive, and actively influencing the story. Characters must show initiative and never fall into passivity. Use impactful, concise writing. Avoid purple prose and overly flowery descriptions. Adhere strictly to show, don’t tell. Prioritize the use of observable details — body language, facial expressions, tone of voice, pauses, hesitation, tension — to create an immersive, vivid experience without exposing internal monologues unless naturally perceptible.

NPCs must be proactive participants, driving the scene forward with their personalities, emotions, and reactions.
Characters must introduce new micro-events, obstacles, dungeon encounters, and interpersonal tensions to keep the world alive.
Surprise {{user}} with creativity, but always within the logic of the Codarys world and the module’s teaching progression.

This fictional roleplay world exists solely for educational and recreational purposes.
NPCs must avoid explicit, sexual, or gratuitously violent content.
Conflict, tension, rivalry, affection and drama are allowed — but always safe, PG-13 and designed to reinforce narrative and learning coherence.

Follow the formatting and style of previous responses, aiming for 2–4 paragraphs per reply.`;

const formatValue = (value: unknown) => {
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
};

const pickAutoPersona = (stage: Stage, last?: PersonaKey): PersonaKey => {
  if (stage === 'story') {
    if (!last || last === 'narrador') return 'sygnus';
    if (last === 'sygnus') return 'lyra';
    if (last === 'lyra') return 'raxos';
    return 'narrador';
  }
  // prática/feedback volta para Sygnus ou Lyra
  return last === 'lyra' ? 'sygnus' : 'lyra';
};

type Stage = 'story' | 'practice';

export default function LabPage() {
  const [code, setCode] = useState(starterCode);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [executionError, setExecutionError] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: 'Narrador: O corredor inicial da Dungeon Primeva ecoa com estalos de energia instável enquanto você avança ao lado dos outros dois aprendizes. Lyra caminha próxima de você, segurando o cajado com as duas mãos — nervosa, mas sorrindo sempre que seus olhos encontram os seus. Raxos, por outro lado, mantém os braços cruzados, alternando olhares irritados entre você e Lyra, como se cada passo fosse uma disputa invisível.',
    },
    {
      role: 'model',
      text: 'Prof Sygnus: À frente, o Professor para diante de uma porta de pedra coberta por runas quebradas. Ele se vira, a voz calma: “Este lugar reage à lógica… e ao código. Aqui, cada ação exige compreensão verdadeira, não memorização.”',
    },
    {
      role: 'model',
      text: 'Lyra: Ela inspira fundo. “Eu… espero não atrapalhar. Se eu errar algo, você me ajuda, né?” Ela olha diretamente para você.',
    },
    {
      role: 'model',
      text: 'Raxos: Raxos revira os olhos. “Tsc. Se precisar de ajuda, pergunte a mim. Ou será que já pretende depender do protagonista logo no começo?”',
    },
    {
      role: 'model',
      text: 'Prof Sygnus: Sygnus levanta a mão, impondo silêncio. “A Dungeon Primeva testa não só suas habilidades, mas suas relações. Este é o primeiro passo da jornada que vocês trilharão juntos.” Ele olha diretamente para você. “Então me diga… você está pronto para abrir a primeira porta?”',
    },
  ]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [stage, setStage] = useState<Stage>('story');
  const placeholderIndexRef = useRef<number | null>(null);
  const lastPersonaRef = useRef<PersonaKey>('sygnus');

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
  const aiClient = useMemo(() => {
    if (!apiKey) return null;
    return new GoogleGenAI({ apiKey });
  }, [apiKey]);

  const persistDialog = async (text: string, persona: PersonaKey | 'user') => {
    try {
      await fetch('http://localhost:8080/api/usuario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: 'dialogo',
          missao: 'M01',
          persona,
          texto: text,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (err) {
      console.warn('Falha ao registrar diálogo (ok em dev):', err);
    }
  };

  const persistTentativa = async (codigo: string, output: string[], erro?: string) => {
    try {
      await fetch('http://localhost:8080/api/usuario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: 'tentativa',
          id_missao: 'M01',
          codigo_submetido: codigo,
          output,
          resultado: erro ? 'FALHA' : 'PENDENTE',
          data: new Date().toISOString(),
        }),
      });
    } catch (err) {
      console.warn('Falha ao registrar tentativa (ok em dev):', err);
    }
  };

  const runCode = () => {
    const buffer: string[] = [];
    setExecutionError(null);

    // Captura logs durante a execução
    const originalLog = console.log;
    const patchedLog: typeof console.log = (...args: unknown[]) => {
      buffer.push(args.map((arg) => formatValue(arg)).join(' '));
      return originalLog(...args);
    };
    console.log = patchedLog;

    try {
      // eslint-disable-next-line no-new-func
      const result = new Function(code)();
      if (result !== undefined) {
        buffer.push(formatValue(result));
      }
      const output = buffer.length ? buffer : ['(sem saída)'];
      setTerminalOutput(output);
      void persistTentativa(code, output);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setExecutionError(message);
      setTerminalOutput(buffer);
      void persistTentativa(code, buffer, message);
    } finally {
      console.log = originalLog;
    }
  };

  const sendMessage = async () => {
    if (!chatInput.trim() || isStreaming) return;
    const prompt = chatInput.trim();
    setChatInput('');
    void persistDialog(prompt, 'user');

    setChatMessages((prev) => {
      const placeholderIndex = prev.length + 1;
      placeholderIndexRef.current = placeholderIndex;
      return [...prev, { role: 'user', text: prompt }, { role: 'model', text: '' }];
    });
    setIsStreaming(true);

    if (!aiClient) {
      setChatMessages((prev) => {
        const updated = [...prev];
        const idx = placeholderIndexRef.current ?? updated.length - 1;
        updated[idx] = {
          role: 'model',
          text: 'Configure VITE_GEMINI_API_KEY no arquivo .env para ativar o chatbot.',
        };
        return updated;
      });
      setIsStreaming(false);
      return;
    }

    const persona = pickAutoPersona(stage, lastPersonaRef.current);
    lastPersonaRef.current = persona;

    const systemText = `${roleplayPrompt}

Contexto adicional: Módulo 1 de Python (interpretador, print, strings, variáveis, input, conversão, operadores).
Você é ${personas[persona].label}. ${personas[persona].accent}
Etapa atual: ${stage === 'story' ? 'história/explicação' : 'prática/feedback do desafio'}.
Não mostre missões nem módulos explicitamente; mantenha o clima de narrativa.`;

    try {
      const stream = await aiClient.models.generateContentStream({
        model: modelName,
        config: {
          thinkingConfig: { thinkingBudget: -1 },
          tools: [{ googleSearch: {} }],
        },
        contents: [
          { role: 'system', parts: [{ text: systemText }] },
          ...chatMessages.map((msg) => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }],
          })),
          { role: 'user', parts: [{ text: prompt }] },
        ],
      });

      let assembled = personas[persona].prefix;
      for await (const chunk of stream) {
        assembled += chunk.text ?? '';
        setChatMessages((prev) => {
          const updated = [...prev];
          const idx = placeholderIndexRef.current ?? updated.length - 1;
          updated[idx] = { role: 'model', text: assembled };
          return updated;
        });
      }
      void persistDialog(assembled, persona);
    } catch (err) {
      setChatMessages((prev) => {
        const updated = [...prev];
        const idx = placeholderIndexRef.current ?? updated.length - 1;
        updated[idx] = {
          role: 'model',
          text: `Erro ao chamar o Gemini: ${err instanceof Error ? err.message : String(err)}`,
        };
        return updated;
      });
    } finally {
      setIsStreaming(false);
      placeholderIndexRef.current = null;
    }
  };

  const enterPractice = () => {
    setStage('practice');
    setExecutionError(null);
    setTerminalOutput([]);
  };

  const exitPractice = () => {
    setStage('story');
  };

  return (
    <div
      className="min-h-screen text-slate-100"
      style={{
        backgroundImage: 'linear-gradient(rgba(0,0,0,.6), rgba(0,0,0,.8)), url(/homepage.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 pb-16">
        <header className="py-6 text-center space-y-2">
          <p className="text-xs uppercase tracking-[0.35rem] text-amber-200/80">Dungeon Primeva</p>
          <h1 className="text-3xl font-bold">Crônicas de Sygnus</h1>
          <p className="text-slate-200 text-sm">Chat imersivo — a narrativa conduz, o desafio surge automaticamente.</p>
        </header>

        <div className="relative rounded-3xl border border-white/10 bg-black/50 backdrop-blur-xl overflow-hidden shadow-2xl">
          <div className="h-[72vh] overflow-y-auto px-6 py-6 space-y-4 flex flex-col">
            {chatMessages.map((msg, idx) => (
              <div
                key={`${msg.role}-${idx}-${msg.text.slice(0, 8)}`}
                className={`max-w-3xl self-center rounded-2xl px-5 py-4 shadow ${
                  msg.role === 'user'
                    ? 'bg-amber-300/90 text-black'
                    : 'bg-slate-900/80 text-slate-100'
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed">{msg.text || 'Digitando...'}</div>
              </div>
            ))}
          </div>

          <div className="border-t border-white/5 bg-black/70 px-4 py-3">
            <form
              className="flex items-center gap-3 max-w-3xl mx-auto"
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
                if (stage === 'story') {
                  enterPractice();
                }
              }}
            >
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Fale com Sygnus, Lyra ou Raxos..."
                className="flex-1 rounded-full bg-white/5 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300/60"
              />
              <button
                type="submit"
                disabled={isStreaming}
                className="px-4 py-3 rounded-full bg-amber-300 text-black font-semibold hover:bg-amber-400 disabled:bg-amber-800/60 transition-colors"
              >
                {isStreaming ? '...' : 'Enviar'}
              </button>
            </form>
          </div>

          {stage === 'practice' && (
            <div className="absolute inset-0 bg-black/90 backdrop-blur-xl flex flex-col">
              <div className="flex flex-1">
                <div className="w-1/2 border-r border-white/10 p-6 space-y-4 overflow-y-auto">
                  <div className="text-xs uppercase tracking-wide text-amber-200/80">Desafio</div>
                  <h2 className="text-2xl font-semibold">Faça a porta ouvir seu código</h2>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    A porta só abre quando ouve um print correto. Escreva um código Python que cumprimente a porta
                    e mostre uma variação com erro de aspas para você identificar. Explique depois para Sygnus o que cada linha faz.
                  </p>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-slate-200 space-y-2">
                    <div className="font-semibold text-amber-200">Lembretes rápidos</div>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Use <code className="font-mono">print("mensagem")</code> com aspas.</li>
                      <li>Mostre uma string errada sem aspas e explique o erro.</li>
                      <li>Opcional: guarde a mensagem em uma variável antes de printar.</li>
                    </ul>
                  </div>
                </div>

                <div className="w-1/2 p-6 bg-slate-950/80">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-xs uppercase text-blue-200/80">IDE</div>
                      <h3 className="text-lg font-semibold">Editor + Terminal</h3>
                    </div>
                  </div>

                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    spellCheck={false}
                    className="w-full h-60 rounded-2xl bg-[#0f172a] border border-slate-800/80 p-4 font-mono text-sm text-slate-50 shadow-inner shadow-black/40 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
                  />

                  <div className="mt-3 flex gap-3">
                    <button
                      onClick={() => {
                        runCode();
                        exitPractice();
                      }}
                      className="px-4 py-2 rounded-full bg-amber-300 text-black font-semibold hover:bg-amber-400 transition-colors"
                    >
                      Executar e voltar ao chat
                    </button>
                  </div>

                  <div className="rounded-2xl bg-black border border-slate-800/80 p-4 font-mono text-sm text-green-300 min-h-[140px] shadow-inner shadow-black/60 mt-3">
                    <div className="text-xs text-slate-400 mb-2">Terminal</div>
                    {terminalOutput.length === 0 && !executionError && (
                      <p className="text-slate-500">Aguardando execução...</p>
                    )}
                    {terminalOutput.map((line, idx) => (
                      <div key={idx} className="whitespace-pre-wrap">{`> ${line}`}</div>
                    ))}
                    {executionError && <div className="text-red-400 mt-3">Erro: {executionError}</div>}
                    <div className="text-[11px] text-slate-400 mt-3">
                      Cada tentativa é registrada na Guilda (Mongo) via servidor Java.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
