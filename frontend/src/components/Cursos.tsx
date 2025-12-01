import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type CursoComProgresso = {
  id_curso: string;
  titulo: string;
  descricao: string;
  qtd_modulos: number;
  modulo_atual: number;
  total_modulos: number;
  porcentagem: number;
  st: boolean;
  eh_missao_atual?: boolean;
};

export default function Cursos() {

    const user = useAuth().user
    const [cursos, setCursos] = useState<CursoComProgresso[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate()

useEffect(() => {
  if (!user) return;

  async function carregarCursos() {
    try {
      setLoading(true);
      const resp = await axios.get(`http://localhost:8080/api/progresso?userId=${encodeURIComponent(user?.email!)}`);
      const data = resp.data;
      // A API /api/progresso retorna um objeto de estado de narrativa,
      // que é convertido em um array representando o curso/missão atual.
      const cursosConvertidos: CursoComProgresso[] = [
        {
          id_curso: data.missao_atual ?? "missao_desconhecida",
          titulo: data.missao_atual ?? "Missão atual",
          descricao: data.ponto_historia_atual,
          qtd_modulos: 3,
          modulo_atual: data.status_missao === "EM_ANDAMENTO" ? data.modulo_atual : 0,
          total_modulos: 5,
          porcentagem: data.status_missao === "EM_ANDAMENTO" ? data.porcentagem : 0,
          st: data.status_missao === data.status_missao,
          eh_missao_atual: true,
        },
      ];
      
      setCursos(cursosConvertidos);
    } catch (e) {
      console.error("Erro ao buscar cursos:", e);
    } finally {
      setLoading(false);
    }
  }

  carregarCursos();
}, [user]);

if (!user) {
  return <div>Faça login para ver seus cursos.</div>;
}

if (loading) {
  return <div>Carregando cursos...</div>;
}

return (
  <div className="flex flex-col gap-4">
    <h1 className="text-2xl text-center">Cursos</h1>

    <div className="flex gap-4 justify-center">
      {cursos.map((curso) => (
        <div key={curso.id_curso} className="bg-indigo-900 !p-5 rounded-2xl border flex flex-col gap-2">
          {curso.eh_missao_atual && <h1 className="font-bold text-xl text-amber-400">(Missão atual)</h1>}
          <h3 className="text-xl font-semibold">
            {curso.titulo}
          </h3>
          <p className="text-white">Missão Anterior: <span className="text-amber-300">{curso.descricao}</span></p>

          <div className="flex gap-2 flex-col">
            <button
              onClick={() => {
                navigate("/lab");
              }}
              className="bg-amber-300 text-black font-semibold !px-4 !py-2 rounded-lg shadow-lg shadow-blue-900/30 hover:bg-amber-600 cursor-pointer"
            >
              {curso.st ? "Continuar" : "Iniciar"}
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);
}