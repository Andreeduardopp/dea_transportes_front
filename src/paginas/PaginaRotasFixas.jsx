import { useState, useEffect, useCallback } from 'react';
import {
    Building2,
    Clock,
    Users,
    Save,
    RotateCcw,
    CheckCircle2,
    AlertCircle,
    MapPin,
    CalendarDays,
} from 'lucide-react';
import Botao from '../componentes/Botao';
import MapaInterativo from '../componentes/mapa/MapaInterativo';
import BuscaEndereco from '../componentes/mapa/BuscaEndereco';
import ListaParadas from '../componentes/mapa/ListaParadas';
import { ServicoRotasFixas, ServicoGeocodificacao } from '../servicos/api';
import { formatarPayloadRotaFixa, validarFormularioRotaFixa } from '../utilidades/formatadores';

/** @typedef {import('../types/logistica').RotaFixaCreatePayload} RotaFixaCreatePayload */
/** @typedef {import('../types/logistica').RotaFixa} RotaFixa */

export default function PaginaRotasFixas() {
    // ===== Estado do formulário =====
    const [formulario, setFormulario] = useState({
        empresa: '',
        motorista: '',
        horarioPartida: '',
        diasDaSemana: '',
    });

    const [empresas, setEmpresas] = useState([]);
    const [motoristas, setMotoristas] = useState([]);
    const [paradas, setParadas] = useState([]);
    const [centroFoco, setCentroFoco] = useState(null);
    const [errosValidacao, setErrosValidacao] = useState({});
    const [salvando, setSalvando] = useState(false);
    const [mensagemSucesso, setMensagemSucesso] = useState('');
    const [erroGeral, setErroGeral] = useState('');

    // ===== Carrega empresas e motoristas =====
    useEffect(() => {
        const carregar = async () => {
            try {
                const [empresasRes, motoristasRes] = await Promise.all([
                    ServicoRotasFixas.listarEmpresasParceiras(),
                    ServicoRotasFixas.listarMotoristas(),
                ]);
                setEmpresas(Array.isArray(empresasRes) ? empresasRes : []);
                setMotoristas(Array.isArray(motoristasRes) ? motoristasRes : []);
            } catch {
                console.error('Erro ao carregar empresas/motoristas');
            }
        };
        carregar();
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

    // ===== Salvar rota fixa =====
    const aoSalvar = async () => {
        const { valido, erros } = validarFormularioRotaFixa(formulario, paradas);

        if (!valido) {
            setErrosValidacao(erros);
            return;
        }

        setSalvando(true);
        setErroGeral('');
        setMensagemSucesso('');

        try {
            /** @type {RotaFixaCreatePayload} */
            const payload = formatarPayloadRotaFixa(formulario, paradas);
            /** @type {RotaFixa} */
            const rotaCriada = await ServicoRotasFixas.criar(payload);

            setMensagemSucesso(
                rotaCriada?.id
                    ? `Rota fixa #${rotaCriada.id} cadastrada com sucesso!`
                    : 'Rota fixa cadastrada com sucesso!'
            );

            setFormulario({
                empresa: '',
                motorista: '',
                horarioPartida: '',
                diasDaSemana: '',
            });
            setParadas([]);
        } catch (erro) {
            if (erro.response?.status === 400 && erro.response?.data) {
                const dados = erro.response.data;
                const errosMapeados = {};

                if (Array.isArray(dados.empresa)) errosMapeados.empresa = dados.empresa[0];
                if (Array.isArray(dados.motorista)) errosMapeados.motorista = dados.motorista[0];
                if (Array.isArray(dados.horario_partida))
                    errosMapeados.horarioPartida = dados.horario_partida[0];
                if (Array.isArray(dados.dias_da_semana))
                    errosMapeados.diasDaSemana = dados.dias_da_semana[0];

                if (Array.isArray(dados.origem_nome) || Array.isArray(dados.destino_nome))
                    errosMapeados.paradas =
                        dados.origem_nome?.[0] || dados.destino_nome?.[0] || errosMapeados.paradas;

                if (Array.isArray(dados.paradas)) {
                    const msgParadas = dados.paradas
                        .flatMap((p) => (typeof p === 'object' ? Object.values(p).flat() : [p]))
                        .filter(Boolean)[0];
                    if (msgParadas) errosMapeados.paradas = msgParadas;
                }

                if (Object.keys(errosMapeados).length > 0) {
                    setErrosValidacao((ant) => ({ ...ant, ...errosMapeados }));
                }
            }
            setErroGeral('Não foi possível salvar a rota. Tente novamente.');
        } finally {
            setSalvando(false);
        }
    };

    const aoLimpar = () => {
        setFormulario({
            empresa: '',
            motorista: '',
            horarioPartida: '',
            diasDaSemana: '',
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
                            Cadastrar Rota Fixa
                        </h2>
                        <p className="text-xs text-cinza-400 mt-1">
                            Configure horário, recorrência e defina os pontos no mapa
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
                                value={formulario.empresa}
                                onChange={aoMudarCampo('empresa')}
                                className={`w-full rounded-lg border bg-azul-800/60 backdrop-blur-sm px-4 py-3 text-sm text-cinza-100 outline-none transition-all duration-200 appearance-none cursor-pointer ${errosValidacao.empresa
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
                            {errosValidacao.empresa && (
                                <p className="text-xs text-erro animar-fadeIn">{errosValidacao.empresa}</p>
                            )}
                        </div>

                        {/* Motorista */}
                        <div className="flex flex-col gap-1.5">
                            <label
                                htmlFor="campo-motorista"
                                className="text-sm font-medium text-cinza-300 flex items-center gap-1.5"
                            >
                                <Users size={14} className="text-cinza-400" />
                                Motorista
                                <span className="text-xs text-cinza-500 ml-1">(opcional)</span>
                            </label>
                            <select
                                id="campo-motorista"
                                value={formulario.motorista}
                                onChange={aoMudarCampo('motorista')}
                                className={`w-full rounded-lg border bg-azul-800/60 backdrop-blur-sm px-4 py-3 text-sm text-cinza-100 outline-none transition-all duration-200 appearance-none cursor-pointer ${errosValidacao.motorista
                                        ? 'border-erro/60 focus:border-erro'
                                        : 'border-azul-700/50 focus:border-azul-500 focus:ring-2 focus:ring-azul-500/20 hover:border-azul-600'
                                    }`}
                            >
                                <option value="" className="bg-azul-800">
                                    Nenhum
                                </option>
                                {motoristas.map((motorista) => (
                                    <option
                                        key={motorista.id}
                                        value={motorista.id}
                                        className="bg-azul-800"
                                    >
                                        {motorista.nome ?? `#${motorista.id}`}
                                    </option>
                                ))}
                            </select>
                            {errosValidacao.motorista && (
                                <p className="text-xs text-erro animar-fadeIn">
                                    {errosValidacao.motorista}
                                </p>
                            )}
                        </div>

                        {/* Horário e Dias da Semana */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1.5">
                                <label
                                    htmlFor="campo-horario"
                                    className="text-sm font-medium text-cinza-300 flex items-center gap-1.5"
                                >
                                    <Clock size={14} className="text-cinza-400" />
                                    Partida
                                    <span className="text-erro">*</span>
                                </label>
                                <input
                                    id="campo-horario"
                                    type="time"
                                    value={formulario.horarioPartida}
                                    onChange={aoMudarCampo('horarioPartida')}
                                    className={`w-full rounded-lg border bg-azul-800/60 backdrop-blur-sm px-3 py-3 text-sm text-cinza-100 outline-none transition-all duration-200 ${errosValidacao.horarioPartida
                                            ? 'border-erro/60'
                                            : 'border-azul-700/50 focus:border-azul-500 focus:ring-2 focus:ring-azul-500/20'
                                        }`}
                                />
                                {errosValidacao.horarioPartida && (
                                    <p className="text-xs text-erro animar-fadeIn">
                                        {errosValidacao.horarioPartida}
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label
                                    htmlFor="campo-dias"
                                    className="text-sm font-medium text-cinza-300 flex items-center gap-1.5"
                                >
                                    <CalendarDays size={14} className="text-cinza-400" />
                                    Dias
                                    <span className="text-erro">*</span>
                                </label>
                                <select
                                    id="campo-dias"
                                    value={formulario.diasDaSemana}
                                    onChange={aoMudarCampo('diasDaSemana')}
                                    className={`w-full rounded-lg border bg-azul-800/60 backdrop-blur-sm px-4 py-3 text-sm text-cinza-100 outline-none transition-all duration-200 appearance-none cursor-pointer ${errosValidacao.diasDaSemana
                                            ? 'border-erro/60 focus:border-erro'
                                            : 'border-azul-700/50 focus:border-azul-500 focus:ring-2 focus:ring-azul-500/20 hover:border-azul-600'
                                        }`}
                                >
                                    <option value="" className="bg-azul-800">
                                        Selecione...
                                    </option>
                                    <option value="SEG_SEX" className="bg-azul-800">
                                        Segunda a Sexta
                                    </option>
                                    <option value="SEG_SAB" className="bg-azul-800">
                                        Segunda a Sábado
                                    </option>
                                    <option value="TODO_DIA" className="bg-azul-800">
                                        Todos os dias
                                    </option>
                                    <option value="FIM_SEMANA" className="bg-azul-800">
                                        Fim de semana
                                    </option>
                                </select>
                                {errosValidacao.diasDaSemana && (
                                    <p className="text-xs text-erro animar-fadeIn">
                                        {errosValidacao.diasDaSemana}
                                    </p>
                                )}
                            </div>
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
                            <ListaParadas paradas={paradas} aoRemoverParada={aoRemoverParada} />
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

