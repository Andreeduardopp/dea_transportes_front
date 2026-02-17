import axios from 'axios';

/**
 * Serviço de roteamento para obter trajetos reais de estradas
 * Usa OSRM (Open Source Routing Machine) - gratuito e sem necessidade de API key
 */
export const ServicoRotas = {
    /**
     * Obtém a rota real seguindo estradas entre múltiplos pontos
     * @param {Array} pontos - Array de objetos {latitude, longitude}
     * @returns {Promise<Array>} Array de coordenadas [lat, lng] seguindo as estradas
     */
    async obterRota(pontos) {
        if (!pontos || pontos.length < 2) {
            return pontos.map((p) => [p.latitude, p.longitude]);
        }

        try {
            // OSRM Route Service - gratuito e sem API key
            // Formato: /route/v1/{profile}/{coordinates}?overview=full&geometries=geojson
            const coordenadas = pontos
                .map((p) => `${p.longitude},${p.latitude}`)
                .join(';');

            const url = `https://router.project-osrm.org/route/v1/driving/${coordenadas}?overview=full&geometries=geojson&alternatives=false`;

            const resposta = await axios.get(url, {
                timeout: 10000, // 10 segundos de timeout
            });

            if (resposta.data.code === 'Ok' && resposta.data.routes?.length > 0) {
                // Extrai as coordenadas da rota (GeoJSON format: [lng, lat])
                const geometria = resposta.data.routes[0].geometry;
                // Converte de [lng, lat] para [lat, lng] para Leaflet
                return geometria.coordinates.map((coord) => [coord[1], coord[0]]);
            }

            // Fallback: retorna linha reta se a rota falhar
            return pontos.map((p) => [p.latitude, p.longitude]);
        } catch (erro) {
            console.warn('Erro ao obter rota do OSRM, usando linha reta:', erro.message);
            // Fallback: retorna linha reta em caso de erro
            return pontos.map((p) => [p.latitude, p.longitude]);
        }
    },

    /**
     * Obtém múltiplas rotas segmentadas entre pontos consecutivos
     * Útil para rotas com múltiplas paradas
     * @param {Array} pontos - Array de objetos {latitude, longitude}
     * @returns {Promise<Array>} Array de arrays de coordenadas, uma rota por segmento
     */
    async obterRotasSegmentadas(pontos) {
        if (!pontos || pontos.length < 2) {
            return [];
        }

        const rotas = [];

        // Para cada par de pontos consecutivos, obtém uma rota
        for (let i = 0; i < pontos.length - 1; i++) {
            const segmento = [pontos[i], pontos[i + 1]];
            const rota = await this.obterRota(segmento);
            rotas.push(rota);
        }

        return rotas;
    },
};
