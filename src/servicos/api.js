import axios from 'axios';

const URL_BASE_API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
    baseURL: URL_BASE_API,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor — injeta token JWT em cada requisição
api.interceptors.request.use(
    (configuracao) => {
        const token = localStorage.getItem('token_acesso');
        if (token) {
            configuracao.headers.Authorization = `Bearer ${token}`;
        }
        return configuracao;
    },
    (erro) => Promise.reject(erro)
);

// Interceptor — trata respostas 401 (token expirado)
api.interceptors.response.use(
    (resposta) => resposta,
    async (erro) => {
        const requisicaoOriginal = erro.config;

        if (erro.response?.status === 401 && !requisicaoOriginal._tentouRefresh) {
            requisicaoOriginal._tentouRefresh = true;

            try {
                const tokenRefresh = localStorage.getItem('token_refresh');
                if (tokenRefresh) {
                    const resposta = await axios.post(`${URL_BASE_API}/api/v1/auth/token/refresh/`, {
                        refresh: tokenRefresh,
                    });

                    const novoToken = resposta.data.access;
                    localStorage.setItem('token_acesso', novoToken);
                    requisicaoOriginal.headers.Authorization = `Bearer ${novoToken}`;

                    return api(requisicaoOriginal);
                }
            } catch (erroRefresh) {
                localStorage.removeItem('token_acesso');
                localStorage.removeItem('token_refresh');
                window.location.href = '/login';
                return Promise.reject(erroRefresh);
            }
        }

        return Promise.reject(erro);
    }
);

// ===== Serviços de Autenticação =====
export const ServicoAutenticacao = {
    async login(credenciais) {
        // Simulação de autenticação com backend Django JWT
        // Em produção, descomentar a chamada real:
        // const resposta = await api.post('/api/v1/auth/token/', credenciais);

        // Simulação local
        await new Promise((resolver) => setTimeout(resolver, 1200));

        if (
            credenciais.email === 'admin@transporte.com' &&
            credenciais.senha === 'admin123'
        ) {
            const dadosSimulados = {
                access: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.simulado_token_acesso',
                refresh: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.simulado_token_refresh',
                usuario: {
                    id: 1,
                    nome: 'Administrador',
                    email: 'admin@transporte.com',
                    cargo: 'Gestor de Frotas',
                },
            };

            localStorage.setItem('token_acesso', dadosSimulados.access);
            localStorage.setItem('token_refresh', dadosSimulados.refresh);
            localStorage.setItem('usuario', JSON.stringify(dadosSimulados.usuario));

            return dadosSimulados;
        }

        const erro = new Error('Credenciais inválidas');
        erro.response = { status: 401, data: { detail: 'E-mail ou senha incorretos.' } };
        throw erro;
    },

    logout() {
        localStorage.removeItem('token_acesso');
        localStorage.removeItem('token_refresh');
        localStorage.removeItem('usuario');
    },

    obterUsuarioAtual() {
        const usuario = localStorage.getItem('usuario');
        return usuario ? JSON.parse(usuario) : null;
    },

    estaAutenticado() {
        return !!localStorage.getItem('token_acesso');
    },
};

// ===== Serviço de Rotas Extras =====
export const ServicoRotasExtras = {
    async salvar(dadosRota) {
        // Em produção, descomentar:
        // const resposta = await api.post('/api/v1/rotas-extras/', dadosRota);
        // return resposta.data;

        // Simulação local
        await new Promise((resolver) => setTimeout(resolver, 1500));
        console.log('📦 Payload enviado para /api/v1/rotas-extras/:', JSON.stringify(dadosRota, null, 2));

        return {
            id: Math.floor(Math.random() * 1000),
            ...dadosRota,
            status: 'pendente',
            criado_em: new Date().toISOString(),
        };
    },

    async listarEmpresasParceiras() {
        // Em produção, descomentar:
        // const resposta = await api.get('/api/v1/empresas-parceiras/');
        // return resposta.data;

        // Dados simulados
        return [
            { id: 1, nome: 'TransLog Ltda.' },
            { id: 2, nome: 'Viação Rápida S.A.' },
            { id: 3, nome: 'Express Fretamentos' },
            { id: 4, nome: 'MoveTransp Ltda.' },
            { id: 5, nome: 'Fretacar Transportes' },
        ];
    },
};

// ===== Serviço de Geocodificação (Nominatim) =====
export const ServicoGeocodificacao = {
    async buscarEndereco(consulta) {
        if (!consulta || consulta.trim().length < 3) return [];

        const resposta = await axios.get('https://nominatim.openstreetmap.org/search', {
            params: {
                q: consulta,
                format: 'json',
                addressdetails: 1,
                limit: 5,
                countrycodes: 'BR',
            },
            headers: {
                'Accept-Language': 'pt-BR',
            },
        });

        return resposta.data.map((item) => ({
            id: item.place_id,
            nome: item.display_name,
            latitude: parseFloat(item.lat),
            longitude: parseFloat(item.lon),
        }));
    },

    async geocodificacaoReversa(latitude, longitude) {
        try {
            const resposta = await axios.get('https://nominatim.openstreetmap.org/reverse', {
                params: {
                    lat: latitude,
                    lon: longitude,
                    format: 'json',
                    addressdetails: 1,
                },
                headers: {
                    'Accept-Language': 'pt-BR',
                },
            });

            return resposta.data.display_name || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
        } catch {
            return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
        }
    },
};

export default api;
