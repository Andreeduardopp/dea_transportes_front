import { Loader2 } from 'lucide-react';

const variantes = {
    primario:
        'bg-azul-500 hover:bg-azul-400 text-white shadow-lg shadow-azul-500/25 hover:shadow-azul-400/30',
    secundario:
        'bg-azul-800 hover:bg-azul-700 text-cinza-200 border border-azul-700/50',
    perigo:
        'bg-erro/90 hover:bg-erro text-white shadow-lg shadow-erro/25',
    fantasma:
        'bg-transparent hover:bg-azul-800/50 text-cinza-300 hover:text-cinza-100',
};

const tamanhos = {
    sm: 'px-3 py-2 text-xs',
    md: 'px-5 py-3 text-sm',
    lg: 'px-6 py-3.5 text-base',
};

export default function Botao({
    children,
    variante = 'primario',
    tamanho = 'md',
    carregando = false,
    desabilitado = false,
    icone: Icone,
    larguraTotal = false,
    tipo = 'button',
    aoClicar,
    className = '',
    ...props
}) {
    return (
        <button
            type={tipo}
            onClick={aoClicar}
            disabled={desabilitado || carregando}
            className={`
        inline-flex items-center justify-center gap-2 rounded-lg
        font-semibold transition-all duration-200 cursor-pointer
        focus:outline-none focus:ring-2 focus:ring-azul-500/40 focus:ring-offset-2 focus:ring-offset-azul-900
        active:scale-[0.97]
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
        ${variantes[variante]}
        ${tamanhos[tamanho]}
        ${larguraTotal ? 'w-full' : ''}
        ${className}
      `}
            {...props}
        >
            {carregando ? (
                <>
                    <Loader2 size={18} className="animar-girar" />
                    <span>Processando...</span>
                </>
            ) : (
                <>
                    {Icone && <Icone size={18} />}
                    {children}
                </>
            )}
        </button>
    );
}
