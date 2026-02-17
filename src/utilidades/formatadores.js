/**
 * Formata o payload de uma rota extra para o formato esperado pela API.
 *
 * @param {Object} dadosFormulario - Dados do formulário (empresaParceira, data, hora, quantidadePassageiros)
 * @param {Array<{endereco?: string, referencia?: string|null, latitude?: number, longitude?: number}>} paradas - Paradas do mapa
 * @returns {import('../types/logistica').RotaExtraCreatePayload} Payload para POST /rotas-extras/
 */
export function formatarPayloadRota(dadosFormulario, paradas) {
    const primeiraParada = paradas[0];
    const ultimaParada = paradas[paradas.length - 1];

    return {
        origem_nome: (primeiraParada?.endereco || '').substring(0, 255),
        destino_nome: (ultimaParada?.endereco || '').substring(0, 255),
        empresa: parseInt(dadosFormulario.empresaParceira, 10),
        data_hora_execucao: new Date(
            `${dadosFormulario.data}T${dadosFormulario.hora}`
        ).toISOString(),
        quantidade_passageiros: parseInt(dadosFormulario.quantidadePassageiros, 10),
        status: 'pendente',
        origem_whatsapp: false,
        paradas: paradas.map((parada, indice) => ({
            endereco: (parada.endereco || '').substring(0, 255),
            referencia: parada.referencia || null,
            localizacao:
                parada.latitude != null && parada.longitude != null
                    ? { latitude: parada.latitude, longitude: parada.longitude }
                    : null,
            ordem: indice + 1,
        })),
    };
}

/**
 * Formata data/hora ISO 8601 para exibição (ex: "01/03/2026 08:00").
 * @param {string} isoString - Data/hora em ISO 8601
 * @returns {string} Data formatada
 */
export function formatarDataHora(isoString) {
    if (!isoString) return '—';
    try {
        const data = new Date(isoString);
        return data.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return '—';
    }
}

/**
 * Formata coordenadas para exibição.
 */
export function formatarCoordenadas(latitude, longitude) {
    return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
}

/**
 * Encurta um endereço longo para exibição em espaços reduzidos.
 */
export function encurtarEndereco(endereco, tamanhoMaximo = 60) {
    if (!endereco) return 'Endereço não disponível';
    if (endereco.length <= tamanhoMaximo) return endereco;
    return endereco.substring(0, tamanhoMaximo) + '...';
}

/**
 * Retorna o rótulo do tipo de parada.
 */
export function obterRotuloParada(indice, totalParadas) {
    if (indice === 0) return 'Origem';
    if (indice === totalParadas - 1 && totalParadas > 1) return 'Destino';
    return `Parada ${indice}`;
}

/**
 * Valida os dados do formulário antes de submeter.
 */
export function validarFormularioRota(dados, paradas) {
    const erros = {};

    if (!dados.empresaParceira) {
        erros.empresaParceira = 'Selecione uma empresa parceira.';
    }

    if (!dados.data) {
        erros.data = 'Informe a data.';
    }

    if (!dados.hora) {
        erros.hora = 'Informe o horário.';
    }

    if (!dados.quantidadePassageiros || parseInt(dados.quantidadePassageiros, 10) < 1) {
        erros.quantidadePassageiros = 'Informe ao menos 1 passageiro.';
    }

    if (paradas.length < 2) {
        erros.paradas = 'Defina ao menos o ponto de origem e o destino no mapa.';
    }

    return {
        valido: Object.keys(erros).length === 0,
        erros,
    };
}
