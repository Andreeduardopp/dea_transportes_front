import { useState, useEffect, useCallback } from 'react';
import {
    Building2,
    CalendarDays,
    Clock,
    Users,
    Save,
    RotateCcw,
    CheckCircle2,
    AlertCircle,
    MapPin,
} from 'lucide-react';
import Botao from '../componentes/Botao';
import MapaInterativo from '../componentes/mapa/MapaInterativo';
import BuscaEndereco from '../componentes/mapa/BuscaEndereco';
import ListaParadas from '../componentes/mapa/ListaParadas';
import { ServicoRotasExtras, ServicoGeocodificacao } from '../servicos/api';
import { formatarPayloadRota, validarFormularioRota } from '../utilidades/formatadores';

export default function PaginaRotasExtras() {
    // ===== Estado do formulário =====
    const [formulario, setFormulario] = useState({
        empresaParceira: '',
        data: '',
        hora: '',
        quantidadePassageiros: '',
    });

    const [empresas, setEmpresas] = useState([]);
    const [paradas, setParadas] = useState([]);
    const [centroFoco, setCentroFoco] = useState(null);
    const [errosValidacao, setErrosValidacao] = useState({});
    const [salvando, setSalvando] = useState(false);
    const [mensagemSucesso, setMensagemSucesso] = useState('');
    const [erroGeral, setErroGeral] = useState('');

    // ===== Carrega empresas parceiras =====
    useEffect(() => {
        const carregarEmpresas = async () => {
            try {
                const dados = await ServicoRotasExtras.listarEmpresasParceiras();
                setEmpresas(dados);
            } catch {
                console.error('Erro ao carregar empresas parceiras');
            }
        };
        carregarEmpresas();
    }, []);

    // ===== Handlers do formulário =====
    const aoMudarCampo = (campo) => (evento) => {
        setFormulario((anterior) => ({ ...anterior, [campo]: evento.target.value }));
        setErrosValidacao((anterior) => ({ ...anterior, [campo]: '' }));
        setErroGeral('');
        setMensagemSucesso('');
    };

    // ===== Handlers do mapa =====
    const aoClicarMapa = useCallback(async (latlng) => {
        const novaParada = {
            id: `parada_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            latitude: latlng.lat,
            longitude: latlng.lng,
            endereco: '',
            carregandoEndereco: true,
        };

        setParadas((anterior) => [...anterior, novaParada]);
        setErrosValidacao((anterior) => ({ ...anterior, paradas: '' }));

        // Geocodificação reversa
        try {
            const endereco = await ServicoGeocodificacao.geocodificacaoReversa(
                latlng.lat,
                latlng.lng
            );
            setParadas((anterior) =>
                anterior.map((p) =>
                    p.id === novaParada.id
                        ? { ...p, endereco, carregandoEndereco: false }
                        : p
                )
            );
        } catch {
            setParadas((anterior) =>
                anterior.map((p) =>
                    p.id === novaParada.id
                        ? {
                            ...p,
                            endereco: `${latlng.lat.toFixed(5)}, ${latlng.lng.toFixed(5)}`,
                            carregandoEndereco: false,
                        }
                        : p
                )
            );
        }
    }, []);

    const aoSelecionarEnderecoBusca = useCallback((endereco) => {
        const novaParada = {
            id: `parada_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            latitude: endereco.latitude,
            longitude: endereco.longitude,
            endereco: endereco.endereco,
            carregandoEndereco: false,
        };

        setParadas((anterior) => [...anterior, novaParada]);
        setCentroFoco([endereco.latitude, endereco.longitude]);
        setErrosValidacao((anterior) => ({ ...anterior, paradas: '' }));
    }, []);

    const aoRemoverParada = useCallback((id) => {
        setParadas((anterior) => anterior.filter((p) => p.id !== id));
    }, []);

    // ===== Salvar rota =====
    const aoSalvar = async () => {
        const { valido, erros } = validarFormularioRota(formulario, paradas);

        if (!valido) {
            setErrosValidacao(erros);
            return;
        }

        setSalvando(true);
        setErroGeral('');
        setMensagemSucesso('');

        try {
            const payload = formatarPayloadRota(formulario, paradas);
            await ServicoRotasExtras.salvar(payload);
            setMensagemSucesso('Rota extra cadastrada com sucesso!');

            // Limpar formulário
            setFormulario({
                empresaParceira: '',
                data: '',
                hora: '',
                quantidadePassageiros: '',
            });
            setParadas([]);
        } catch {
            setErroGeral('Não foi possível salvar a rota. Tente novamente.');
        } finally {
            setSalvando(false);
        }
    };

    const aoLimpar = () => {
        setFormulario({
            empresaParceira: '',
            data: '',
            hora: '',
            quantidadePassageiros: '',
        });
        setParadas([]);
        setErrosValidacao({});
        setErroGeral('');
        setMensagemSucesso('');
    };

    return (
        <div className="flex-1 flex flex-col lg:flex-row min-h-0">
            {/* ===== Sidebar / Formulário ===== */}
            <aside className="w-full lg:w-[380px] xl:w-[400px] bg-azul-900/50 backdrop-blur-sm border-b lg:border-b-0 lg:border-r border-azul-700/20 flex flex-col overflow-y-auto">
                <div className="p-5 flex-1">
                    {/* Título */}
                    <div className="mb-6">
                        <h2 className="text-lg font-bold text-cinza-100 flex items-center gap-2">
                            <MapPin size={20} className="text-azul-400" />
                            Cadastrar Rota Extra
                        </h2>
                        <p className="text-xs text-cinza-400 mt-1">
                            Preencha os dados e defina os pontos no mapa
                        </p>
                    </div>

                    {/* Mensagem de sucesso */}
                    {mensagemSucesso && (
                        <div className="mb-4 flex items-center gap-3 p-4 rounded-xl bg-sucesso/10 border border-sucesso/20 animar-fadeIn">
                            <CheckCircle2 size={18} className="text-sucesso shrink-0" />
                            <p className="text-sm text-sucesso/90">{mensagemSucesso}</p>
                        </div>
                    )}

                    {/* Mensagem de erro geral */}
                    {erroGeral && (
                        <div className="mb-4 flex items-center gap-3 p-4 rounded-xl bg-erro/10 border border-erro/20 animar-fadeIn">
                            <AlertCircle size={18} className="text-erro shrink-0" />
                            <p className="text-sm text-erro/90">{erroGeral}</p>
                        </div>
                    )}

                    {/* Campos do formulário */}
                    <div className="space-y-4">
                        {/* Empresa Parceira */}
                        <div className="flex flex-col gap-1.5">
                            <label
                                htmlFor="campo-empresa"
                                className="text-sm font-medium text-cinza-300 flex items-center gap-1.5"
                            >
                                <Building2 size={14} className="text-cinza-400" />
                                Empresa Parceira
                                <span className="text-erro">*</span>
                            </label>
                            <select
                                id="campo-empresa"
                                value={formulario.empresaParceira}
                                onChange={aoMudarCampo('empresaParceira')}
                                className={`w-full rounded-lg border bg-azul-800/60 backdrop-blur-sm px-4 py-3 text-sm text-cinza-100 outline-none transition-all duration-200 appearance-none cursor-pointer ${errosValidacao.empresaParceira
                                        ? 'border-erro/60 focus:border-erro'
                                        : 'border-azul-700/50 focus:border-azul-500 focus:ring-2 focus:ring-azul-500/20 hover:border-azul-600'
                                    }`}
                            >
                                <option value="" className="bg-azul-800">
                                    Selecione uma empresa...
                                </option>
                                {empresas.map((empresa) => (
                                    <option key={empresa.id} value={empresa.id} className="bg-azul-800">
                                        {empresa.nome}
                                    </option>
                                ))}
                            </select>
                            {errosValidacao.empresaParceira && (
                                <p className="text-xs text-erro animar-fadeIn">
                                    {errosValidacao.empresaParceira}
                                </p>
                            )}
                        </div>

                        {/* Data e Hora */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1.5">
                                <label
                                    htmlFor="campo-data"
                                    className="text-sm font-medium text-cinza-300 flex items-center gap-1.5"
                                >
                                    <CalendarDays size={14} className="text-cinza-400" />
                                    Data
                                    <span className="text-erro">*</span>
                                </label>
                                <input
                                    id="campo-data"
                                    type="date"
                                    value={formulario.data}
                                    onChange={aoMudarCampo('data')}
                                    className={`w-full rounded-lg border bg-azul-800/60 backdrop-blur-sm px-3 py-3 text-sm text-cinza-100 outline-none transition-all duration-200 ${errosValidacao.data
                                            ? 'border-erro/60'
                                            : 'border-azul-700/50 focus:border-azul-500 focus:ring-2 focus:ring-azul-500/20'
                                        }`}
                                />
                                {errosValidacao.data && (
                                    <p className="text-xs text-erro animar-fadeIn">
                                        {errosValidacao.data}
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label
                                    htmlFor="campo-hora"
                                    className="text-sm font-medium text-cinza-300 flex items-center gap-1.5"
                                >
                                    <Clock size={14} className="text-cinza-400" />
                                    Hora
                                    <span className="text-erro">*</span>
                                </label>
                                <input
                                    id="campo-hora"
                                    type="time"
                                    value={formulario.hora}
                                    onChange={aoMudarCampo('hora')}
                                    className={`w-full rounded-lg border bg-azul-800/60 backdrop-blur-sm px-3 py-3 text-sm text-cinza-100 outline-none transition-all duration-200 ${errosValidacao.hora
                                            ? 'border-erro/60'
                                            : 'border-azul-700/50 focus:border-azul-500 focus:ring-2 focus:ring-azul-500/20'
                                        }`}
                                />
                                {errosValidacao.hora && (
                                    <p className="text-xs text-erro animar-fadeIn">
                                        {errosValidacao.hora}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Quantidade de Passageiros */}
                        <div className="flex flex-col gap-1.5">
                            <label
                                htmlFor="campo-passageiros"
                                className="text-sm font-medium text-cinza-300 flex items-center gap-1.5"
                            >
                                <Users size={14} className="text-cinza-400" />
                                Quantidade de Passageiros
                                <span className="text-erro">*</span>
                            </label>
                            <input
                                id="campo-passageiros"
                                type="number"
                                min="1"
                                max="200"
                                value={formulario.quantidadePassageiros}
                                onChange={aoMudarCampo('quantidadePassageiros')}
                                placeholder="Ex: 30"
                                className={`w-full rounded-lg border bg-azul-800/60 backdrop-blur-sm px-4 py-3 text-sm text-cinza-100 placeholder-cinza-400 outline-none transition-all duration-200 ${errosValidacao.quantidadePassageiros
                                        ? 'border-erro/60'
                                        : 'border-azul-700/50 focus:border-azul-500 focus:ring-2 focus:ring-azul-500/20'
                                    }`}
                            />
                            {errosValidacao.quantidadePassageiros && (
                                <p className="text-xs text-erro animar-fadeIn">
                                    {errosValidacao.quantidadePassageiros}
                                </p>
                            )}
                        </div>

                        {/* Separador */}
                        <div className="border-t border-azul-700/20 pt-4">
                            <h3 className="text-sm font-semibold text-cinza-200 mb-3 flex items-center gap-2">
                                <MapPin size={14} className="text-azul-400" />
                                Paradas da Rota
                            </h3>

                            {/* Busca de endereço */}
                            <div className="mb-3">
                                <BuscaEndereco aoSelecionarEndereco={aoSelecionarEnderecoBusca} />
                            </div>

                            {/* Erro de paradas */}
                            {errosValidacao.paradas && (
                                <div className="mb-3 flex items-center gap-2 p-3 rounded-lg bg-erro/10 border border-erro/20 animar-fadeIn">
                                    <AlertCircle size={14} className="text-erro shrink-0" />
                                    <p className="text-xs text-erro/90">{errosValidacao.paradas}</p>
                                </div>
                            )}

                            {/* Lista de paradas */}
                            <ListaParadas
                                paradas={paradas}
                                aoRemoverParada={aoRemoverParada}
                            />
                        </div>
                    </div>
                </div>

                {/* Ações */}
                <div className="p-5 border-t border-azul-700/20 bg-azul-900/30 space-y-2">
                    <Botao
                        aoClicar={aoSalvar}
                        carregando={salvando}
                        larguraTotal
                        tamanho="lg"
                        icone={Save}
                    >
                        Salvar Rota
                    </Botao>
                    <Botao
                        aoClicar={aoLimpar}
                        variante="fantasma"
                        larguraTotal
                        tamanho="sm"
                        icone={RotateCcw}
                    >
                        Limpar Tudo
                    </Botao>
                </div>
            </aside>

            {/* ===== Mapa ===== */}
            <section className="flex-1 relative min-h-[400px] lg:min-h-0">
                <MapaInterativo
                    paradas={paradas}
                    aoClicarMapa={aoClicarMapa}
                    aoRemoverParada={aoRemoverParada}
                    centroFoco={centroFoco}
                />
            </section>
        </div>
    );
}
