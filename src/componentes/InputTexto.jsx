import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function InputTexto({
    id,
    rotulo,
    tipo = 'text',
    placeholder = '',
    valor,
    aoMudar,
    icone: Icone,
    erro,
    obrigatorio = false,
    desabilitado = false,
    ...props
}) {
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const ehSenha = tipo === 'password';
    const tipoAtual = ehSenha && mostrarSenha ? 'text' : tipo;

    return (
        <div className="flex flex-col gap-1.5 w-full">
            {rotulo && (
                <label
                    htmlFor={id}
                    className="text-sm font-medium text-cinza-300 flex items-center gap-1"
                >
                    {rotulo}
                    {obrigatorio && <span className="text-erro">*</span>}
                </label>
            )}

            <div className="relative">
                {Icone && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-cinza-400 pointer-events-none">
                        <Icone size={18} />
                    </div>
                )}

                <input
                    id={id}
                    type={tipoAtual}
                    placeholder={placeholder}
                    value={valor}
                    onChange={aoMudar}
                    disabled={desabilitado}
                    required={obrigatorio}
                    className={`
            w-full rounded-lg border bg-azul-800/60 backdrop-blur-sm
            px-4 py-3 text-sm text-cinza-100 placeholder-cinza-400
            transition-all duration-200 outline-none
            ${Icone ? 'pl-10' : ''}
            ${ehSenha ? 'pr-10' : ''}
            ${erro
                            ? 'border-erro/60 focus:border-erro focus:ring-2 focus:ring-erro/20'
                            : 'border-azul-700/50 focus:border-azul-500 focus:ring-2 focus:ring-azul-500/20 hover:border-azul-600'
                        }
            ${desabilitado ? 'opacity-50 cursor-not-allowed' : ''}
          `}
                    {...props}
                />

                {ehSenha && (
                    <button
                        type="button"
                        onClick={() => setMostrarSenha(!mostrarSenha)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-cinza-400 hover:text-cinza-200 transition-colors"
                        tabIndex={-1}
                        aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                        {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                )}
            </div>

            {erro && (
                <p className="text-xs text-erro flex items-center gap-1 animar-fadeIn">
                    {erro}
                </p>
            )}
        </div>
    );
}
