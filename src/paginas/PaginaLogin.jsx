import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAutenticacao } from '../contextos/ContextoAutenticacao';
import InputTexto from '../componentes/InputTexto';
import Botao from '../componentes/Botao';
import { Mail, Lock, Truck, AlertCircle, LogIn } from 'lucide-react';

export default function PaginaLogin() {
    const navegar = useNavigate();
    const { login, carregando, erro, limparErro } = useAutenticacao();

    const [formulario, setFormulario] = useState({
        email: '',
        senha: '',
    });
    const [errosValidacao, setErrosValidacao] = useState({});

    const aoMudarCampo = (campo) => (evento) => {
        setFormulario((anterior) => ({ ...anterior, [campo]: evento.target.value }));
        setErrosValidacao((anterior) => ({ ...anterior, [campo]: '' }));
        if (erro) limparErro();
    };

    const validarFormulario = () => {
        const erros = {};

        if (!formulario.email.trim()) {
            erros.email = 'Informe seu e-mail.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formulario.email)) {
            erros.email = 'Formato de e-mail inválido.';
        }

        if (!formulario.senha.trim()) {
            erros.senha = 'Informe sua senha.';
        } else if (formulario.senha.length < 6) {
            erros.senha = 'A senha deve ter no mínimo 6 caracteres.';
        }

        setErrosValidacao(erros);
        return Object.keys(erros).length === 0;
    };

    const aoSubmeter = async (evento) => {
        evento.preventDefault();
        if (!validarFormulario()) return;

        try {
            await login(formulario);
            navegar('/rotas-extras', { replace: true });
        } catch {
            // Erro já tratado no contexto
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-azul-950 relative overflow-hidden">
            {/* Background decorativo */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-azul-500/5 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-azul-400/5 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-azul-500/3 rounded-full blur-3xl" />
            </div>

            {/* Card de Login */}
            <div className="w-full max-w-md relative animar-fadeIn">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-azul-500 to-azul-400 shadow-2xl shadow-azul-500/30 mb-5">
                        <Truck size={32} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-cinza-100 mb-2">
                        TransFret
                    </h1>
                    <p className="text-cinza-400 text-sm">
                        Sistema de Fretamento Corporativo
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-azul-900/60 backdrop-blur-xl border border-azul-700/30 rounded-2xl p-8 shadow-2xl shadow-black/20">
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-cinza-100">
                            Acesse sua conta
                        </h2>
                        <p className="text-sm text-cinza-400 mt-1">
                            Entre com suas credenciais corporativas
                        </p>
                    </div>

                    {/* Mensagem de erro da API */}
                    {erro && (
                        <div className="mb-5 flex items-center gap-3 p-4 rounded-xl bg-erro/10 border border-erro/20 animar-fadeIn">
                            <AlertCircle size={18} className="text-erro shrink-0" />
                            <p className="text-sm text-erro/90">{erro}</p>
                        </div>
                    )}

                    <form onSubmit={aoSubmeter} className="space-y-5">
                        <InputTexto
                            id="campo-email"
                            rotulo="E-mail"
                            tipo="email"
                            placeholder="seu.email@empresa.com"
                            valor={formulario.email}
                            aoMudar={aoMudarCampo('email')}
                            icone={Mail}
                            erro={errosValidacao.email}
                            obrigatorio
                        />

                        <InputTexto
                            id="campo-senha"
                            rotulo="Senha"
                            tipo="password"
                            placeholder="••••••••"
                            valor={formulario.senha}
                            aoMudar={aoMudarCampo('senha')}
                            icone={Lock}
                            erro={errosValidacao.senha}
                            obrigatorio
                        />

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-azul-700 bg-azul-800 text-azul-500 focus:ring-azul-500/30"
                                />
                                <span className="text-xs text-cinza-400">Lembrar de mim</span>
                            </label>
                            <button
                                type="button"
                                className="text-xs text-azul-400 hover:text-azul-300 transition-colors cursor-pointer"
                            >
                                Esqueceu a senha?
                            </button>
                        </div>

                        <Botao
                            tipo="submit"
                            larguraTotal
                            carregando={carregando}
                            tamanho="lg"
                            icone={LogIn}
                        >
                            Entrar
                        </Botao>
                    </form>

                    {/* Credenciais de demonstração */}
                    <div className="mt-6 pt-5 border-t border-azul-700/30">
                        <p className="text-[11px] text-cinza-400 text-center mb-2 uppercase tracking-wider font-medium">
                            Credenciais de demonstração
                        </p>
                        <div className="bg-azul-800/50 rounded-lg p-3 space-y-1">
                            <p className="text-xs text-cinza-300">
                                <span className="text-cinza-400">E-mail:</span>{' '}
                                <code className="text-azul-400 font-mono">admin@transporte.com</code>
                            </p>
                            <p className="text-xs text-cinza-300">
                                <span className="text-cinza-400">Senha:</span>{' '}
                                <code className="text-azul-400 font-mono">admin123</code>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-[11px] text-cinza-400/60 mt-6">
                    © 2026 TransFret — Sistema de Fretamento Corporativo
                </p>
            </div>
        </div>
    );
}
