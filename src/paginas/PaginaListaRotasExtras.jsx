import { useState, useEffect, useMemo } from 'react';
import { Route, List, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { ServicoRotasExtras } from '../servicos/api';
import { formatarDataHora, encurtarEndereco } from '../utilidades/formatadores';

const ITENS_POR_PAGINA = 10;

export default function PaginaListaRotasExtras() {
    const [rotas, setRotas] = useState([]);
    const [empresas, setEmpresas] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');
    const [paginaAtual, setPaginaAtual] = useState(1);

    const mapaEmpresas = useMemo(() => {
        const mapa = {};
        empresas.forEach((e) => (mapa[e.id] = e.nome));
        return mapa;
    }, [empresas]);

    useEffect(() => {
        const carregar = async () => {
            setCarregando(true);
            setErro('');
            try {
                const [rotasRes, empresasRes] = await Promise.all([
                    ServicoRotasExtras.listar(),
                    ServicoRotasExtras.listarEmpresasParceiras(),
                ]);
                setRotas(Array.isArray(rotasRes) ? rotasRes : []);
                setEmpresas(Array.isArray(empresasRes) ? empresasRes : []);
            } catch (err) {
                setErro('Não foi possível carregar as rotas extras. Tente novamente.');
                setRotas([]);
            } finally {
                setCarregando(false);
            }
        };
        carregar();
    }, []);

    const totalPaginas = Math.max(1, Math.ceil(rotas.length / ITENS_POR_PAGINA));
    const indiceInicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
    const rotasPagina = useMemo(
        () => rotas.slice(indiceInicio, indiceInicio + ITENS_POR_PAGINA),
        [rotas, indiceInicio]
    );

    const podeAnterior = paginaAtual > 1;
    const podeProximo = paginaAtual < totalPaginas;

    return (
        <div className="flex-1 flex flex-col min-h-0 p-4 sm:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto w-full flex flex-col gap-6">
                {/* Cabeçalho */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-cinza-100 flex items-center gap-2">
                            <List size={22} className="text-azul-400" />
                            Rotas Extras
                        </h2>
                        <p className="text-sm text-cinza-400 mt-1">
                            {rotas.length} rota(s) cadastrada(s)
                        </p>
                    </div>
                </div>

                {/* Erro */}
                {erro && (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-erro/10 border border-erro/20 animar-fadeIn">
                        <AlertCircle size={20} className="text-erro shrink-0" />
                        <p className="text-sm text-erro/90">{erro}</p>
                    </div>
                )}

                {/* Tabela */}
                <div className="flex-1 min-h-0 rounded-xl border border-azul-700/30 bg-azul-900/50 backdrop-blur-sm overflow-hidden">
                    {carregando ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-10 h-10 border-2 border-azul-500 border-t-transparent rounded-full animar-girar" />
                        </div>
                    ) : rotasPagina.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-cinza-400">
                            <Route size={48} className="mb-3 opacity-50" />
                            <p className="text-sm font-medium">
                                {rotas.length === 0
                                    ? 'Nenhuma rota extra cadastrada.'
                                    : 'Nenhuma rota nesta página.'}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-azul-700/40 bg-azul-800/40">
                                            <th className="px-4 py-3 text-xs font-semibold text-cinza-400 uppercase tracking-wider">
                                                Horário
                                            </th>
                                            <th className="px-4 py-3 text-xs font-semibold text-cinza-400 uppercase tracking-wider">
                                                Origem
                                            </th>
                                            <th className="px-4 py-3 text-xs font-semibold text-cinza-400 uppercase tracking-wider">
                                                Destino
                                            </th>
                                            <th className="px-4 py-3 text-xs font-semibold text-cinza-400 uppercase tracking-wider">
                                                Motorista
                                            </th>
                                            <th className="px-4 py-3 text-xs font-semibold text-cinza-400 uppercase tracking-wider">
                                                Empresa
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rotasPagina.map((rota) => (
                                            <tr
                                                key={rota.id}
                                                className="border-b border-azul-700/20 hover:bg-azul-800/30 transition-colors"
                                            >
                                                <td className="px-4 py-3 text-sm text-cinza-200 whitespace-nowrap">
                                                    {formatarDataHora(rota.data_hora_execucao)}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-cinza-200">
                                                    {encurtarEndereco(rota.origem_nome)}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-cinza-200">
                                                    {encurtarEndereco(rota.destino_nome)}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-cinza-200">
                                                    {rota.motorista != null
                                                        ? `#${rota.motorista}`
                                                        : '—'}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-cinza-200">
                                                    {mapaEmpresas[rota.empresa] ?? `#${rota.empresa}`}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Paginação */}
                            {totalPaginas > 1 && (
                                <div className="flex items-center justify-between px-4 py-3 border-t border-azul-700/30 bg-azul-800/30">
                                    <p className="text-xs text-cinza-400">
                                        Página {paginaAtual} de {totalPaginas} •{' '}
                                        {indiceInicio + 1}–
                                        {Math.min(
                                            indiceInicio + ITENS_POR_PAGINA,
                                            rotas.length
                                        )}{' '}
                                        de {rotas.length}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() =>
                                                setPaginaAtual((p) => Math.max(1, p - 1))
                                            }
                                            disabled={!podeAnterior}
                                            className="p-2 rounded-lg text-cinza-400 hover:text-cinza-100 hover:bg-azul-700/50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors cursor-pointer"
                                            aria-label="Página anterior"
                                        >
                                            <ChevronLeft size={18} />
                                        </button>
                                        <button
                                            onClick={() =>
                                                setPaginaAtual((p) =>
                                                    Math.min(totalPaginas, p + 1)
                                                )
                                            }
                                            disabled={!podeProximo}
                                            className="p-2 rounded-lg text-cinza-400 hover:text-cinza-100 hover:bg-azul-700/50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors cursor-pointer"
                                            aria-label="Próxima página"
                                        >
                                            <ChevronRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
