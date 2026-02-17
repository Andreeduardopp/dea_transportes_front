/**
 * Formata o payload de uma rota extra para o formato esperado pela API.
 *
 * @param {Object} dadosFormulario - Dados do formulário lateral
 * @param {Array} paradas - Array de paradas do mapa
 * @returns {Object} Payload formatado para a API
 */
export function formatarPayloadRota(dadosFormulario, paradas) {
    return {
        empresa_parceira: parseInt(dadosFormulario.empresaParceira, 10),
        data_hora: new Date(
            `${dadosFormulario.data}T${dadosFormulario.hora}`
        ).toISOString(),
        quantidade_passageiros: parseInt(dadosFormulario.quantidadePassageiros, 10),
        paradas: paradas.map((parada, indice) => {
            let tipo = 'parada';
            if (indice === 0) tipo = 'origem';
            if (indice === paradas.length - 1 && paradas.length > 1) tipo = 'destino';

            return {
                ordem: indice + 1,
                tipo,
                latitude: parada.latitude,
                longitude: parada.longitude,
                endereco: parada.endereco || '',
            };
        }),
    };
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
