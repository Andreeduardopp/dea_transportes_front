import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { encurtarEndereco, obterRotuloParada } from '../../utilidades/formatadores';

// ===== Ícone de marcador numerado =====
function criarIconeMarcador(numero, totalParadas) {
    let classeExtra = '';
    if (numero === 1) classeExtra = 'origem';
    else if (numero === totalParadas && totalParadas > 1) classeExtra = 'destino';

    return L.divIcon({
        className: '',
        html: `<div class="marcador-numerado ${classeExtra}">${numero}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -20],
    });
}

// ===== Sub-componente: captura cliques no mapa =====
function CapturadorDeCliques({ aoClicar }) {
    useMapEvents({
        click(evento) {
            aoClicar(evento.latlng);
        },
    });
    return null;
}

// ===== Sub-componente: centraliza o mapa em um ponto =====
function CentralizadorMapa({ centro }) {
    const mapa = useMap();

    useEffect(() => {
        if (centro) {
            mapa.flyTo(centro, 15, { duration: 1 });
        }
    }, [centro, mapa]);

    return null;
}

// ===== Componente principal do mapa =====
export default function MapaInterativo({
    paradas = [],
    aoClicarMapa,
    aoRemoverParada,
    centroFoco = null,
}) {
    const referenciaPolyline = useRef(null);
    const posicaoInicial = [-23.5505, -46.6333]; // São Paulo

    const pontosPolyline = paradas.map((p) => [p.latitude, p.longitude]);

    return (
        <div className="w-full h-full relative">
            <MapContainer
                center={posicaoInicial}
                zoom={12}
                className="w-full h-full rounded-xl"
                style={{ minHeight: '100%' }}
                zoomControl={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                <CapturadorDeCliques aoClicar={aoClicarMapa} />
                <CentralizadorMapa centro={centroFoco} />

                {/* Marcadores */}
                {paradas.map((parada, indice) => (
                    <Marker
                        key={parada.id}
                        position={[parada.latitude, parada.longitude]}
                        icon={criarIconeMarcador(indice + 1, paradas.length)}
                    >
                        <Popup>
                            <div className="text-sm min-w-[180px]">
                                <p className="font-bold text-azul-900 mb-1">
                                    {obterRotuloParada(indice, paradas.length)}
                                </p>
                                <p className="text-gray-600 text-xs mb-2">
                                    {encurtarEndereco(parada.endereco, 80)}
                                </p>
                                <button
                                    onClick={() => aoRemoverParada(parada.id)}
                                    className="text-xs text-red-500 hover:text-red-700 font-medium cursor-pointer"
                                >
                                    ✕ Remover parada
                                </button>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {/* Polyline conectando os pontos */}
                {pontosPolyline.length >= 2 && (
                    <Polyline
                        ref={referenciaPolyline}
                        positions={pontosPolyline}
                        pathOptions={{
                            color: '#3B82F6',
                            weight: 4,
                            opacity: 0.8,
                            dashArray: '10, 6',
                            lineCap: 'round',
                        }}
                    />
                )}
            </MapContainer>

            {/* Instrução sobreposta */}
            {paradas.length === 0 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none">
                    <div className="bg-azul-800/90 backdrop-blur-sm border border-azul-700/40 rounded-xl px-5 py-3 shadow-2xl">
                        <p className="text-cinza-300 text-sm font-medium text-center">
                            🗺️ Clique no mapa para definir o <span className="text-sucesso font-bold">ponto de origem</span>
                        </p>
                    </div>
                </div>
            )}

            {paradas.length === 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none">
                    <div className="bg-azul-800/90 backdrop-blur-sm border border-azul-700/40 rounded-xl px-5 py-3 shadow-2xl">
                        <p className="text-cinza-300 text-sm font-medium text-center">
                            📍 Agora clique para definir o <span className="text-erro font-bold">destino</span> ou paradas intermediárias
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
