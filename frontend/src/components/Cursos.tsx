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
      const resp = await axios.get(`http://localhost:8080/api/progresso?userId=${encodeURIComponent(user?.email)}`);
      const data = resp.data;
      // A API /api/progresso retorna um objeto de estado de narrativa,
      // que é convertido em um array representando o curso/missão atual.
      const cursosConvertidos: CursoComProgresso[] = [
        {
          id_curso: data.missao_atual ?? "missao_desconhecida",
          titulo: data.missao_atual ?? "Missão atual",
          descricao: `Status da missão: ${data.status_missao ?? "DESCONHECIDO"}`,
          qtd_modulos: 1,
          modulo_atual: data.status_missao === "EM_ANDAMENTO" ? 1 : 0,
          total_modulos: 1,
          porcentagem: data.status_missao === "EM_ANDAMENTO" ? 50 : 0,
          st: data.status_missao === "EM_ANDAMENTO",
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
  <div>
    <h1>Cursos</h1>

    {cursos.map((curso) => (
      <div key={curso.id_curso}>
        <h3>
          {curso.titulo}
          {curso.eh_missao_atual && <span> (Missão atual)</span>}
        </h3>
        <p>{curso.descricao}</p>

        <p>
          Progresso: {curso.porcentagem}% (({curso.modulo_atual}/{curso.total_modulos}))
        </p>
        <progress value={curso.porcentagem} max={100} />

        <button
          onClick={() => { navigate("/lab")}}
        >
          {curso.st ? "Continuar" : "Iniciar"}
        </button>
      </div>
    ))}
  </div>
);
}