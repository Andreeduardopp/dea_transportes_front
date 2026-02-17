import { MapPin, Trash2, GripVertical } from 'lucide-react';
import { obterRotuloParada, encurtarEndereco } from '../../utilidades/formatadores';

export default function ListaParadas({ paradas = [], aoRemoverParada }) {
    if (paradas.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-8 px-4">
                <div className="w-14 h-14 rounded-full bg-azul-700/30 flex items-center justify-center mb-3">
                    <MapPin size={24} className="text-cinza-400" />
                </div>
                <p className="text-sm text-cinza-400 text-center leading-relaxed">
                    Nenhuma parada definida.
                    <br />
                    <span className="text-cinza-300 font-medium">Clique no mapa</span> ou use a busca para adicionar.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {paradas.map((parada, indice) => {
                const rotulo = obterRotuloParada(indice, paradas.length);
                const ehOrigem = indice === 0;
                const ehDestino = indice === paradas.length - 1 && paradas.length > 1;

                let corFundo = 'bg-azul-700/20 border-azul-700/30';
                let corIcone = 'text-azul-400';
                let corNumero = 'bg-azul-500/20 text-azul-400';

                if (ehOrigem) {
                    corFundo = 'bg-sucesso/5 border-sucesso/20';
                    corIcone = 'text-sucesso';
                    corNumero = 'bg-sucesso/20 text-sucesso';
                } else if (ehDestino) {
                    corFundo = 'bg-erro/5 border-erro/20';
                    corIcone = 'text-erro';
                    corNumero = 'bg-erro/20 text-erro';
                }

                return (
                    <div
                        key={parada.id}
                        className={`flex items-center gap-3 p-3 rounded-xl border ${corFundo} transition-all duration-200 hover:border-azul-600/40 group animar-fadeIn`}
                    >
                        {/* Indicador de arraste */}
                        <div className="text-cinza-400/30 group-hover:text-cinza-400/60 transition-colors cursor-grab">
                            <GripVertical size={14} />
                        </div>

                        {/* Número */}
                        <div className={`w-7 h-7 rounded-full ${corNumero} flex items-center justify-center text-xs font-bold shrink-0`}>
                            {indice + 1}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <p className={`text-xs font-semibold ${corIcone} mb-0.5`}>
                                {rotulo}
                            </p>
                            <p className="text-xs text-cinza-300 truncate" title={parada.endereco}>
                                {parada.carregandoEndereco ? (
                                    <span className="animar-pulsar text-cinza-400">Buscando endereço...</span>
                                ) : (
                                    encurtarEndereco(parada.endereco, 45)
                                )}
                            </p>
                        </div>

                        {/* Remover */}
                        <button
                            onClick={() => aoRemoverParada(parada.id)}
                            className="p-1.5 rounded-lg text-cinza-400/50 hover:text-erro hover:bg-erro/10 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                            title="Remover parada"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                );
            })}

            {/* Linha conectora visual */}
            {paradas.length >= 2 && (
                <div className="flex items-center gap-2 px-4 py-2">
                    <div className="h-px flex-1 bg-gradient-to-r from-sucesso/40 via-azul-500/40 to-erro/40 rounded-full" />
                    <span className="text-[10px] text-cinza-400 font-medium">
                        {paradas.length} ponto{paradas.length > 1 ? 's' : ''} na rota
                    </span>
                    <div className="h-px flex-1 bg-gradient-to-r from-erro/40 via-azul-500/40 to-sucesso/40 rounded-full" />
                </div>
            )}
        </div>
    );
}
