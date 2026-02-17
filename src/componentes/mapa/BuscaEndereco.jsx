import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, MapPin, Loader2, X } from 'lucide-react';
import { ServicoGeocodificacao } from '../../servicos/api';

export default function BuscaEndereco({ aoSelecionarEndereco }) {
    const [consulta, setConsulta] = useState('');
    const [resultados, setResultados] = useState([]);
    const [carregando, setCarregando] = useState(false);
    const [aberto, setAberto] = useState(false);
    const referenciaInput = useRef(null);
    const referenciaPainel = useRef(null);
    const temporizador = useRef(null);

    // Debounce na busca
    const buscar = useCallback(async (texto) => {
        if (texto.trim().length < 3) {
            setResultados([]);
            setAberto(false);
            return;
        }

        setCarregando(true);
        try {
            const dados = await ServicoGeocodificacao.buscarEndereco(texto);
            setResultados(dados);
            setAberto(dados.length > 0);
        } catch {
            setResultados([]);
        } finally {
            setCarregando(false);
        }
    }, []);

    const aoDigitar = (evento) => {
        const valor = evento.target.value;
        setConsulta(valor);

        if (temporizador.current) clearTimeout(temporizador.current);
        temporizador.current = setTimeout(() => buscar(valor), 500);
    };

    const selecionarResultado = (resultado) => {
        aoSelecionarEndereco({
            latitude: resultado.latitude,
            longitude: resultado.longitude,
            endereco: resultado.nome,
        });
        setConsulta('');
        setResultados([]);
        setAberto(false);
    };

    const limparBusca = () => {
        setConsulta('');
        setResultados([]);
        setAberto(false);
        referenciaInput.current?.focus();
    };

    // Fecha ao clicar fora
    useEffect(() => {
        const aoClicarFora = (evento) => {
            if (
                referenciaPainel.current &&
                !referenciaPainel.current.contains(evento.target)
            ) {
                setAberto(false);
            }
        };

        document.addEventListener('mousedown', aoClicarFora);
        return () => document.removeEventListener('mousedown', aoClicarFora);
    }, []);

    return (
        <div ref={referenciaPainel} className="relative z-[1000]">
            <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-cinza-400 pointer-events-none">
                    {carregando ? (
                        <Loader2 size={16} className="animar-girar" />
                    ) : (
                        <Search size={16} />
                    )}
                </div>

                <input
                    ref={referenciaInput}
                    type="text"
                    value={consulta}
                    onChange={aoDigitar}
                    placeholder="Buscar endereço..."
                    className="w-full pl-9 pr-9 py-2.5 rounded-lg border border-azul-700/50 bg-azul-800/80 backdrop-blur-sm text-sm text-cinza-100 placeholder-cinza-400 outline-none focus:border-azul-500 focus:ring-2 focus:ring-azul-500/20 transition-all"
                />

                {consulta && (
                    <button
                        onClick={limparBusca}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-cinza-400 hover:text-cinza-200 transition-colors cursor-pointer"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>

            {/* Resultados */}
            {aberto && resultados.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-azul-800/95 backdrop-blur-xl border border-azul-700/40 rounded-xl shadow-2xl overflow-hidden animar-fadeIn">
                    <ul className="max-h-60 overflow-y-auto">
                        {resultados.map((resultado) => (
                            <li key={resultado.id}>
                                <button
                                    onClick={() => selecionarResultado(resultado)}
                                    className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-azul-700/30 transition-colors cursor-pointer border-b border-azul-700/20 last:border-b-0"
                                >
                                    <MapPin size={16} className="text-azul-400 mt-0.5 shrink-0" />
                                    <span className="text-sm text-cinza-200 leading-relaxed">
                                        {resultado.nome}
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {aberto && resultados.length === 0 && !carregando && consulta.length >= 3 && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-azul-800/95 backdrop-blur-xl border border-azul-700/40 rounded-xl shadow-2xl p-4 animar-fadeIn">
                    <p className="text-sm text-cinza-400 text-center">
                        Nenhum endereço encontrado.
                    </p>
                </div>
            )}
        </div>
    );
}
