import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ServicoAutenticacao } from '../servicos/api';

const ContextoAutenticacao = createContext(null);

export function ProvedorAutenticacao({ children }) {
    const [usuario, setUsuario] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState(null);

    // Restaura sessão do localStorage ao montar
    useEffect(() => {
        const usuarioSalvo = ServicoAutenticacao.obterUsuarioAtual();
        if (usuarioSalvo && ServicoAutenticacao.estaAutenticado()) {
            setUsuario(usuarioSalvo);
        }
        setCarregando(false);
    }, []);

    const login = useCallback(async (credenciais) => {
        setCarregando(true);
        setErro(null);

        try {
            const resposta = await ServicoAutenticacao.login(credenciais);
            setUsuario(resposta.usuario);
            return resposta;
        } catch (erro) {
            const mensagem =
                erro.response?.data?.detail ||
                'Não foi possível conectar ao servidor. Tente novamente.';
            setErro(mensagem);
            throw erro;
        } finally {
            setCarregando(false);
        }
    }, []);

    const logout = useCallback(() => {
        ServicoAutenticacao.logout();
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
