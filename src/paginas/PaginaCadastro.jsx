import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAutenticacao } from '../contextos/ContextoAutenticacao';
import InputTexto from '../componentes/InputTexto';
import Botao from '../componentes/Botao';
import { Mail, Lock, LockKeyhole, Truck, AlertCircle, UserPlus } from 'lucide-react';

export default function PaginaCadastro() {
    const navegar = useNavigate();
    const { signUp, carregando, erro, limparErro, estaAutenticado } = useAutenticacao();

    useEffect(() => {
        if (estaAutenticado) navegar('/rotas-extras', { replace: true });
    }, [estaAutenticado, navegar]);

    const [formulario, setFormulario] = useState({
        email: '',
        senha: '',
        confirmarSenha: '',
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
            erros.senha = 'Informe uma senha.';
        } else if (formulario.senha.length < 6) {
            erros.senha = 'A senha deve ter no mínimo 6 caracteres.';
        }

        if (!formulario.confirmarSenha.trim()) {
            erros.confirmarSenha = 'Confirme a senha.';
        } else if (formulario.senha !== formulario.confirmarSenha) {
            erros.confirmarSenha = 'As senhas não conferem.';
        }

        setErrosValidacao(erros);
        return Object.keys(erros).length === 0;
    };

    const aoSubmeter = async (evento) => {
        evento.preventDefault();
        if (!validarFormulario()) return;

        limparErro();
        setErrosValidacao({});

        try {
            await signUp(formulario.email, formulario.senha, formulario.confirmarSenha);
            navegar('/rotas-extras', { replace: true });
        } catch (e) {
            const data = e.response?.data;
            if (data && typeof data === 'object') {
                const fieldErrors = {};
                ['email', 'password1', 'password2'].forEach((campo) => {
                    const val = data[campo];
                    const msg = Array.isArray(val) ? val[0] : typeof val === 'string' ? val : null;
                    if (msg) {
                        if (campo === 'password1') fieldErrors.senha = msg;
                        else if (campo === 'password2') fieldErrors.confirmarSenha = msg;
                        else fieldErrors[campo] = msg;
                    }
                });
                if (Object.keys(fieldErrors).length) setErrosValidacao((prev) => ({ ...prev, ...fieldErrors }));
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-azul-950 relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-azul-500/5 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-azul-400/5 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-azul-500/3 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md relative animar-fadeIn">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-azul-500 to-azul-400 shadow-2xl shadow-azul-500/30 mb-5">
                        <Truck size={32} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-cinza-100 mb-2">TransFret</h1>
                    <p className="text-cinza-400 text-sm">Sistema de Fretamento Corporativo</p>
                </div>

                <div className="bg-azul-900/60 backdrop-blur-xl border border-azul-700/30 rounded-2xl p-8 shadow-2xl shadow-black/20">
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-cinza-100">Criar conta</h2>
                        <p className="text-sm text-cinza-400 mt-1">Preencha os dados para se cadastrar</p>
                    </div>

                    {erro && (
                        <div className="mb-5 flex items-center gap-3 p-4 rounded-xl bg-erro/10 border border-erro/20 animar-fadeIn">
                            <AlertCircle size={18} className="text-erro shrink-0" />
                            <p className="text-sm text-erro/90">{erro}</p>
                        </div>
                    )}

                    <form onSubmit={aoSubmeter} className="space-y-5">
                        <InputTexto
                            id="cadastro-email"
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
                            id="cadastro-senha"
                            rotulo="Senha"
                            tipo="password"
                            placeholder="••••••••"
                            valor={formulario.senha}
                            aoMudar={aoMudarCampo('senha')}
                            icone={Lock}
                            erro={errosValidacao.senha}
                            obrigatorio
                        />

                        <InputTexto
                            id="cadastro-confirmar-senha"
                            rotulo="Confirmar senha"
                            tipo="password"
                            placeholder="••••••••"
                            valor={formulario.confirmarSenha}
                            aoMudar={aoMudarCampo('confirmarSenha')}
                            icone={LockKeyhole}
                            erro={errosValidacao.confirmarSenha}
                            obrigatorio
                        />

                        <Botao
                            tipo="submit"
                            larguraTotal
                            carregando={carregando}
                            tamanho="lg"
                            icone={UserPlus}
                        >
                            Cadastrar
                        </Botao>

                        <p className="text-center text-sm text-cinza-400 pt-2">
                            Já tem conta?{' '}
                            <Link to="/login" className="text-azul-400 hover:text-azul-300 font-medium">
                                Faça login
                            </Link>
                        </p>
                    </form>
                </div>

                <p className="text-center text-[11px] text-cinza-400/60 mt-6">
                    © 2026 TransFret — Sistema de Fretamento Corporativo
                </p>
            </div>
        </div>
    );
}
