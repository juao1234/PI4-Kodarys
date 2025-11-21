import { GoogleGenAI } from '@google/genai';
import { useMemo, useRef, useState } from 'react';
import Navbar from '../components/Navbar';

type ChatMessage = {
  role: 'user' | 'model';
  text: string;
};

const starterCode = `// Você pode escrever JavaScript aqui e clicar em Executar
function somar(a, b) {
  console.log('Somando', a, '+', b);
  return a + b;
}

const resultado = somar(2, 3);
console.log('Resultado:', resultado);`;

const modelName = 'gemini-2.5-flash';

const formatValue = (value: unknown) => {
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
};

export default function LabPage() {
  const [code, setCode] = useState(starterCode);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [executionError, setExecutionError] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: 'Olá! Sou o assistente Gemini. Envie sua dúvida de código que eu ajudo aqui no laboratório.',
    },
  ]);
  const [isStreaming, setIsStreaming] = useState(false);
  const placeholderIndexRef = useRef<number | null>(null);

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
  const aiClient = useMemo(() => {
    if (!apiKey) return null;
    return new GoogleGenAI({ apiKey });
  }, [apiKey]);

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
      setTerminalOutput(buffer.length ? buffer : ['(sem saída)']);
    } catch (err) {
      setExecutionError(err instanceof Error ? err.message : String(err));
      setTerminalOutput(buffer);
    } finally {
      console.log = originalLog;
    }
  };

  const sendMessage = async () => {
    if (!chatInput.trim() || isStreaming) return;
    const prompt = chatInput.trim();
    setChatInput('');

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

    try {
      const stream = await aiClient.models.generateContentStream({
        model: modelName,
        config: {
          thinkingConfig: { thinkingBudget: -1 },
          tools: [{ googleSearch: {} }],
        },
        contents: [
          ...chatMessages.map((msg) => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }],
          })),
          { role: 'user', parts: [{ text: prompt }] },
        ],
      });

      let assembled = '';
      for await (const chunk of stream) {
        assembled += chunk.text ?? '';
        setChatMessages((prev) => {
          const updated = [...prev];
          const idx = placeholderIndexRef.current ?? updated.length - 1;
          updated[idx] = { role: 'model', text: assembled };
          return updated;
        });
      }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b1324] via-[#0f1c33] to-[#1a2a4b] text-slate-100">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 pb-20">
        <header className="py-12 text-center space-y-3">
          <p className="text-sm uppercase tracking-[0.35rem] text-amber-200/80">Lab IA</p>
          <h1 className="text-4xl font-bold">Laboratório de Código + Terminal + Gemini</h1>
          <p className="text-slate-300">
            Escreva código, veja a saída em tempo real e converse com o Gemini para tirar dúvidas.
          </p>
          <div className="text-xs text-amber-200/80">
            Modelo: {modelName} {apiKey ? '' : ' (aguardando chave VITE_GEMINI_API_KEY)'}
          </div>
        </header>

        <div className="grid lg:grid-cols-2 gap-8">
          <section className="bg-slate-900/60 border border-slate-800/60 rounded-3xl shadow-xl shadow-amber-900/20 p-6 backdrop-blur">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xs uppercase text-amber-200/80">IDE rápida</div>
                <h2 className="text-lg font-semibold">Editor + Terminal</h2>
              </div>
              <button
                onClick={runCode}
                className="bg-amber-300 text-black font-semibold px-4 py-2 rounded-full hover:bg-amber-400 transition-colors"
              >
                Executar código
              </button>
            </div>
            <div className="space-y-4">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                className="w-full h-64 rounded-2xl bg-[#0f172a] border border-slate-800/80 p-4 font-mono text-sm text-slate-50 shadow-inner shadow-black/40 focus:outline-none focus:ring-2 focus:ring-amber-300/60"
              />

              <div className="rounded-2xl bg-black border border-slate-800/80 p-4 font-mono text-sm text-green-300 min-h-[160px] shadow-inner shadow-black/60">
                <div className="text-xs text-slate-400 mb-2">Terminal</div>
                {terminalOutput.length === 0 && !executionError && (
                  <p className="text-slate-500">Aguardando execução...</p>
                )}
                {terminalOutput.map((line, idx) => (
                  <div key={idx} className="whitespace-pre-wrap">{`> ${line}`}</div>
                ))}
                {executionError && (
                  <div className="text-red-400 mt-3">Erro: {executionError}</div>
                )}
              </div>
            </div>
          </section>

          <section className="bg-slate-900/60 border border-slate-800/60 rounded-3xl shadow-xl shadow-blue-900/30 p-6 backdrop-blur flex flex-col">
            <div className="mb-4">
              <div className="text-xs uppercase text-blue-200/80">Chat IA</div>
              <h2 className="text-lg font-semibold">Gemini como pair-programmer</h2>
              {!apiKey && (
                <p className="text-xs text-amber-200/80 mt-1">
                  Adicione VITE_GEMINI_API_KEY no .env para habilitar o chat.
                </p>
              )}
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {chatMessages.map((msg, idx) => (
                <div
                  key={`${msg.role}-${idx}-${msg.text.slice(0, 8)}`}
                  className={`rounded-2xl px-4 py-3 max-w-[90%] ${
                    msg.role === 'user'
                      ? 'bg-amber-300/90 text-black ml-auto'
                      : 'bg-slate-800/80 text-slate-100'
                  }`}
                >
                  <div className="text-[11px] uppercase tracking-wide opacity-70">
                    {msg.role === 'user' ? 'Você' : 'Gemini'}
                  </div>
                  <div className="whitespace-pre-wrap">{msg.text || 'Digitando...'}</div>
                </div>
              ))}
            </div>

            <form
              className="mt-4 flex gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
            >
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Pergunte algo sobre seu código..."
                className="flex-1 rounded-full bg-slate-800/80 border border-slate-700/70 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300/60"
              />
              <button
                type="submit"
                disabled={isStreaming}
                className="bg-blue-500 disabled:bg-blue-900/60 text-white font-semibold px-4 py-3 rounded-full hover:bg-blue-600 transition-colors"
              >
                {isStreaming ? 'Enviando...' : 'Enviar'}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
