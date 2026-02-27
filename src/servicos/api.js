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

                    const novoToken = resposta.data.access ?? resposta.data.access_token;
                    if (novoToken) {
                        localStorage.setItem('token_acesso', novoToken);
                        requisicaoOriginal.headers.Authorization = `Bearer ${novoToken}`;
                        return api(requisicaoOriginal);
                    }
                }
                localStorage.removeItem('token_acesso');
                localStorage.removeItem('token_refresh');
                localStorage.removeItem('usuario');
                const params = new URLSearchParams({
                    mensagem: 'Sessão expirada. Faça login novamente.',
                });
                window.location.href = `/login?${params.toString()}`;
                return Promise.reject(erro);
            } catch {
                // Refresh falhou: limpar tokens e redirecionar com mensagem
                localStorage.removeItem('token_acesso');
                localStorage.removeItem('token_refresh');
                localStorage.removeItem('usuario');
                const params = new URLSearchParams({
                    mensagem: 'Sessão expirada. Faça login novamente.',
                });
                window.location.href = `/login?${params.toString()}`;
                return Promise.reject(erro);
            }
        }

        return Promise.reject(erro);
    }
);

// Extrai mensagem de erro da resposta da API (non_field_errors, campos, etc.)
export function extrairMensagemErro(data) {
    if (!data || typeof data !== 'object') return null;
    const naoCampo = data.non_field_errors;
    if (Array.isArray(naoCampo) && naoCampo.length) return naoCampo[0];
    if (typeof naoCampo === 'string') return naoCampo;
    const camposConhecidos = ['email', 'password', 'password1', 'password2', 'access_token'];
    for (const c of camposConhecidos) {
        const val = data[c];
        if (Array.isArray(val) && val.length) return val[0];
        if (typeof val === 'string') return val;
    }
    // Qualquer outro campo de validação (ex.: cpf, cnh, cnpj)
    for (const key of Object.keys(data)) {
        if (key === 'detail' || key === 'non_field_errors') continue;
        const val = data[key];
        if (Array.isArray(val) && val.length) return val[0];
        if (typeof val === 'string') return val;
    }
    return data.detail ?? null;
}

// Normaliza resposta de login/signup/google: access_token ou access, refresh_token ou refresh, user
function normalizarRespostaAuth(resposta) {
    const data = resposta.data ?? resposta;
    const access = data.access_token ?? data.access;
    const refresh = data.refresh_token ?? data.refresh;
    const user = data.user ?? data.usuario;
    return { access, refresh, user };
}

function armazenarTokens(access, refresh, user) {
    if (access) localStorage.setItem('token_acesso', access);
    if (refresh) localStorage.setItem('token_refresh', refresh);
    if (user) localStorage.setItem('usuario', JSON.stringify(user));
}

// ===== Serviços de Autenticação =====
export const ServicoAutenticacao = {
    async login(credenciais) {
        const resposta = await api.post('/api/v1/auth/login/', {
            email: credenciais.email,
            password: credenciais.password,
        });
        const { access, refresh, user } = normalizarRespostaAuth(resposta);
        armazenarTokens(access, refresh, user);
        return { access, refresh, user };
    },

    async signUp(email, password1, password2) {
        const resposta = await api.post('/api/v1/auth/registration/', {
            email,
            password1,
            password2,
        });
        const { access, refresh, user } = normalizarRespostaAuth(resposta);
        armazenarTokens(access, refresh, user);
        return { access, refresh, user };
    },

    async loginWithGoogle(accessToken) {
        const resposta = await api.post('/api/v1/auth/google/', {
            access_token: accessToken,
        });
        const { access, refresh, user } = normalizarRespostaAuth(resposta);
        armazenarTokens(access, refresh, user);
        return { access, refresh, user };
    },

    async refreshTokens() {
        const refresh = localStorage.getItem('token_refresh');
        if (!refresh) throw new Error('Sem refresh token');
        const resposta = await axios.post(`${URL_BASE_API}/api/v1/auth/token/refresh/`, {
            refresh,
        });
        const novoAccess = resposta.data.access ?? resposta.data.access_token;
        if (novoAccess) {
            localStorage.setItem('token_acesso', novoAccess);
            return { access: novoAccess };
        }
        throw new Error('Resposta de refresh inválida');
    },

    async logout() {
        const refresh = localStorage.getItem('token_refresh');
        try {
            await api.post('/api/v1/auth/logout/', refresh ? { refresh } : {});
        } catch {
            // Ignora erro do logout (ex.: rede); limpa tokens mesmo assim
        }
        localStorage.removeItem('token_acesso');
        localStorage.removeItem('token_refresh');
        localStorage.removeItem('usuario');
    },

    async getCurrentUser() {
        const resposta = await api.get('/api/v1/auth/user/');
        const user = resposta.data;
        if (user) localStorage.setItem('usuario', JSON.stringify(user));
        return user;
    },

    obterUsuarioAtual() {
        const usuario = localStorage.getItem('usuario');
        return usuario ? JSON.parse(usuario) : null;
    },

    estaAutenticado() {
        return !!localStorage.getItem('token_acesso');
    },
};

// ===== Serviço de Motoristas =====
export const ServicoMotoristas = {
    /**
     * Lista motoristas (resposta paginada DRF).
     * @param {{ page?: number }} params - Parâmetros de paginação
     * @returns {Promise<{ count: number, next: string|null, previous: string|null, results: Array }>}
     */
    async listar(params = {}) {
        const resposta = await api.get('/api/v1/motoristas/', { params });
        return resposta.data;
    },

    /**
     * Obtém um motorista pelo ID.
     * @param {number} id - ID do motorista
     * @returns {Promise<Object>} Motorista
     */
    async obterPorId(id) {
        const resposta = await api.get(`/api/v1/motoristas/${id}/`);
        return resposta.data;
    },

    /**
     * Cria um novo motorista.
     * @param {Object} payload - { nome, cpf, cnh, celular, ativo? }
     * @returns {Promise<Object>} Motorista criado
     */
    async criar(payload) {
        const resposta = await api.post('/api/v1/motoristas/', payload);
        return resposta.data;
    },

    /**
     * Atualiza um motorista (PUT — envio completo).
     * @param {number} id - ID do motorista
     * @param {Object} payload - Campos a enviar
     * @returns {Promise<Object>} Motorista atualizado
     */
    async atualizar(id, payload) {
        const resposta = await api.put(`/api/v1/motoristas/${id}/`, payload);
        return resposta.data;
    },

    /**
     * Atualização parcial (PATCH).
     * @param {number} id - ID do motorista
     * @param {Object} payload - Apenas campos a alterar
     * @returns {Promise<Object>} Motorista atualizado
     */
    async atualizarParcial(id, payload) {
        const resposta = await api.patch(`/api/v1/motoristas/${id}/`, payload);
        return resposta.data;
    },

    /**
     * Remove um motorista.
     * @param {number} id - ID do motorista
     */
    async excluir(id) {
        await api.delete(`/api/v1/motoristas/${id}/`);
    },
};

// ===== Serviço de Empresas Parceiras =====
export const ServicoEmpresasParceiras = {
    /**
     * Lista empresas parceiras (resposta paginada DRF).
     * @param {{ page?: number }} params - Parâmetros de paginação
     * @returns {Promise<{ count: number, next: string|null, previous: string|null, results: Array }>}
     */
    async listar(params = {}) {
        const resposta = await api.get('/api/v1/empresas-parceiras/', { params });
        return resposta.data;
    },

    /**
     * Obtém uma empresa parceira pelo ID.
     * @param {number} id - ID da empresa
     * @returns {Promise<Object>} EmpresaParceira
     */
    async obterPorId(id) {
        const resposta = await api.get(`/api/v1/empresas-parceiras/${id}/`);
        return resposta.data;
    },

    /**
     * Cria uma nova empresa parceira.
     * @param {Object} payload - { nome, cnpj, contato, email }
     * @returns {Promise<Object>} EmpresaParceira criada
     */
    async criar(payload) {
        const resposta = await api.post('/api/v1/empresas-parceiras/', payload);
        return resposta.data;
    },

    /**
     * Atualiza uma empresa parceira (PUT — envio completo).
     * @param {number} id - ID da empresa
     * @param {Object} payload - Campos a enviar
     * @returns {Promise<Object>} EmpresaParceira atualizada
     */
    async atualizar(id, payload) {
        const resposta = await api.put(`/api/v1/empresas-parceiras/${id}/`, payload);
        return resposta.data;
    },

    /**
     * Atualização parcial (PATCH).
     * @param {number} id - ID da empresa
     * @param {Object} payload - Apenas campos a alterar
     * @returns {Promise<Object>} EmpresaParceira atualizada
     */
    async atualizarParcial(id, payload) {
        const resposta = await api.patch(`/api/v1/empresas-parceiras/${id}/`, payload);
        return resposta.data;
    },

    /**
     * Remove uma empresa parceira.
     * @param {number} id - ID da empresa
     */
    async excluir(id) {
        await api.delete(`/api/v1/empresas-parceiras/${id}/`);
    },
};

// ===== Serviço de Rotas Extras =====
export const ServicoRotasExtras = {
    /**
     * Lista todas as rotas extras.
     * @returns {Promise<Array>} Array de objetos RotaExtra
     */
    async listar() {
        const resposta = await api.get('/api/v1/rotas-extras/');
        return resposta.data;
    },

    /**
     * Obtém uma rota extra pelo ID.
     * @param {number} id - ID da rota extra
     * @returns {Promise<Object>} Objeto RotaExtra
     * @throws {Error} 404 quando a rota não existe
     */
    async obterPorId(id) {
        const resposta = await api.get(`/api/v1/rotas-extras/${id}/`);
        return resposta.data;
    },

    /**
     * Cria uma nova rota extra.
     * @param {import('../types/logistica').RotaExtraCreatePayload} payload - Payload de criação
     * @returns {Promise<import('../types/logistica').RotaExtra>} RotaExtra criada
     * @throws {Error} 400 com erro.response.data contendo erros de validação
     */
    async criar(payload) {
        const resposta = await api.post('/api/v1/rotas-extras/', payload);
        return resposta.data;
    },

    /**
     * Lista empresas parceiras (retorna array para compatibilidade com dropdowns).
     * Delega a ServicoEmpresasParceiras.listar() e retorna results.
     * @returns {Promise<Array>} Array de EmpresaParceira (primeira página)
     */
    async listarEmpresasParceiras() {
        const resposta = await ServicoEmpresasParceiras.listar();
        return resposta ?? [];
    },
};

// ===== Serviço de Rotas Fixas =====
export const ServicoRotasFixas = {
    /**
     * Lista todas as rotas fixas.
     * @returns {Promise<Array>} Array de objetos RotaFixa
     */
    async listar() {
        const resposta = await api.get('/api/v1/rotas-fixas/');
        return resposta.data;
    },

    /**
     * Obtém uma rota fixa pelo ID.
     * @param {number} id - ID da rota fixa
     * @returns {Promise<Object>} Objeto RotaFixa
     * @throws {Error} 404 quando a rota não existe
     */
    async obterPorId(id) {
        const resposta = await api.get(`/api/v1/rotas-fixas/${id}/`);
        return resposta.data;
    },

    /**
     * Cria uma nova rota fixa.
     * @param {import('../types/logistica').RotaFixaCreatePayload} payload - Payload de criação
     * @returns {Promise<import('../types/logistica').RotaFixa>} RotaFixa criada
     * @throws {Error} 400 com erro.response.data contendo erros de validação
     */
    async criar(payload) {
        const resposta = await api.post('/api/v1/rotas-fixas/', payload);
        return resposta.data;
    },

    /**
     * Lista empresas parceiras (retorna array para compatibilidade com dropdowns).
     * @returns {Promise<Array>} Array de EmpresaParceira (primeira página)
     */
    async listarEmpresasParceiras() {
        const resposta = await ServicoEmpresasParceiras.listar();
        return resposta?.results ?? resposta ?? [];
    },

    /**
     * Lista motoristas (retorna array para compatibilidade com dropdowns).
     * @returns {Promise<Array>} Array de Motorista (primeira página)
     */
    async listarMotoristas() {
        const resposta = await ServicoMotoristas.listar();
        return resposta?.results ?? resposta ?? [];
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
