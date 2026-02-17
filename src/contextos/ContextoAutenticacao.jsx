import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ServicoAutenticacao, extrairMensagemErro } from '../servicos/api';

const ContextoAutenticacao = createContext(null);

function mensagemDeErroAuth(erro) {
    const status = erro.response?.status;
    const data = erro.response?.data;
    if (status === 401) return 'E-mail ou senha inválidos.';
    if (status >= 500) return 'Erro no servidor. Tente de novo.';
    return extrairMensagemErro(data) ?? 'Não foi possível conectar ao servidor. Tente novamente.';
}

export function ProvedorAutenticacao({ children }) {
    const [usuario, setUsuario] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState(null);

    // Valida token ao montar: getCurrentUser; se 401, tenta refresh; se falhar, limpa
    useEffect(() => {
        let cancelado = false;

        async function validarSessao() {
            if (!ServicoAutenticacao.estaAutenticado()) {
                setCarregando(false);
                return;
            }
            try {
                const user = await ServicoAutenticacao.getCurrentUser();
                if (!cancelado) setUsuario(user ?? ServicoAutenticacao.obterUsuarioAtual());
            } catch (e) {
                if (e.response?.status === 401) {
                    try {
                        await ServicoAutenticacao.refreshTokens();
                        const user = await ServicoAutenticacao.getCurrentUser();
                        if (!cancelado) setUsuario(user ?? ServicoAutenticacao.obterUsuarioAtual());
                    } catch {
                        ServicoAutenticacao.logout();
                        if (!cancelado) setUsuario(null);
                    }
                } else if (!cancelado) {
                    setUsuario(ServicoAutenticacao.obterUsuarioAtual());
                }
            } finally {
                if (!cancelado) setCarregando(false);
            }
        }

        validarSessao();
        return () => { cancelado = true; };
    }, []);

    const login = useCallback(async (credenciais) => {
        setCarregando(true);
        setErro(null);
        try {
            const resposta = await ServicoAutenticacao.login(credenciais);
            setUsuario(resposta.user ?? resposta.usuario);
            return resposta;
        } catch (e) {
            setErro(mensagemDeErroAuth(e));
            throw e;
        } finally {
            setCarregando(false);
        }
    }, []);

    const signUp = useCallback(async (email, password1, password2) => {
        setCarregando(true);
        setErro(null);
        try {
            const resposta = await ServicoAutenticacao.signUp(email, password1, password2);
            setUsuario(resposta.user ?? resposta.usuario);
            return resposta;
        } catch (e) {
            setErro(mensagemDeErroAuth(e));
            throw e;
        } finally {
            setCarregando(false);
        }
    }, []);

    const loginWithGoogle = useCallback(async (accessToken) => {
        setCarregando(true);
        setErro(null);
        try {
            const resposta = await ServicoAutenticacao.loginWithGoogle(accessToken);
            setUsuario(resposta.user ?? resposta.usuario);
            return resposta;
        } catch (e) {
            setErro(mensagemDeErroAuth(e));
            throw e;
        } finally {
            setCarregando(false);
        }
    }, []);

    const logout = useCallback(async () => {
        await ServicoAutenticacao.logout();
        setUsuario(null);
        setErro(null);
    }, []);

    const limparErro = useCallback(() => {
        setErro(null);
    }, []);

    const valor = {
        usuario,
        carregando,
        erro,
        estaAutenticado: !!usuario,
        login,
        signUp,
        loginWithGoogle,
        logout,
        limparErro,
    };

    return (
        <ContextoAutenticacao.Provider value={valor}>
            {children}
        </ContextoAutenticacao.Provider>
    );
}

export function useAutenticacao() {
    const contexto = useContext(ContextoAutenticacao);
    if (!contexto) {
        throw new Error('useAutenticacao deve ser usado dentro de um ProvedorAutenticacao');
    }
    return contexto;
}

export default ContextoAutenticacao;
