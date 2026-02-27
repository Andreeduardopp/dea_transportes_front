/**
 * TypeScript models for the logística API (RotaExtra, RotaFixa).
 * Backend: Django REST Framework — responses use snake_case, dates in ISO 8601.
 */

// =============================================================================
// Shared Types
// =============================================================================

/** Coordinates: latitude (-90 to 90), longitude (-180 to 180) */
export interface LatLng {
    latitude: number;
    longitude: number;
}

/** Parada as returned by the API (inside rota_paradas[].parada) */
export interface Parada {
    id: number;
    endereco: string;
    referencia: string | null;
    localizacao: LatLng | null;
}

/** RotaParada as returned in rota_paradas on RotaExtra and RotaFixa */
export interface RotaParada {
    id: number;
    parada: Parada;
    ordem: number;
    versao: number;
}

/** Parada input for create/update — first = origem, last = destino */
export interface ParadaInput {
    endereco: string;
    referencia?: string | null;
    localizacao?: LatLng | null;
    ordem: number; // min 1
}

// =============================================================================
// RotaExtra
// =============================================================================

export type RotaExtraStatus =
    | 'pendente'
    | 'confirmada'
    | 'em_curso'
    | 'finalizada'
    | 'cancelada';

/** RotaExtra as returned by the API (read) */
export interface RotaExtra {
    id: number;
    origem_nome: string;
    destino_nome: string;
    origem_localizacao: LatLng | null;
    destino_localizacao: LatLng | null;
    empresa: number; // FK to EmpresaParceira
    veiculo: number | null; // FK to Veiculo
    motorista: number | null; // FK to Motorista
    data_hora_execucao: string; // ISO 8601 datetime
    quantidade_passageiros: number;
    status: RotaExtraStatus;
    origem_whatsapp: boolean;
    rota_paradas: RotaParada[];
    criado_em: string; // ISO 8601 datetime
    atualizado_em: string; // ISO 8601 datetime
}

/** Payload for POST /rotas-extras/ (create) */
export interface RotaExtraCreatePayload {
    origem_nome: string;
    destino_nome: string;
    empresa: number;
    veiculo?: number | null;
    motorista?: number | null;
    data_hora_execucao: string; // ISO 8601
    quantidade_passageiros: number;
    status?: RotaExtraStatus; // default: 'pendente'
    origem_whatsapp?: boolean; // default: false
    paradas: ParadaInput[]; // required; at least one
}

/** Payload for PUT/PATCH /rotas-extras/{id}/ — all fields optional for PATCH */
export type RotaExtraUpdatePayload = Partial<RotaExtraCreatePayload>;

// =============================================================================
// RotaFixa
// =============================================================================

export type RotaFixaDiasDaSemana =
    | 'SEG_SEX'
    | 'SEG_SAB'
    | 'TODO_DIA'
    | 'FIM_SEMANA';

/** RotaFixa as returned by the API (read) */
export interface RotaFixa {
    id: number;
    origem_nome: string;
    destino_nome: string;
    origem_localizacao: LatLng | null;
    destino_localizacao: LatLng | null;
    empresa: number;
    veiculo: number | null;
    motorista: number | null;
    horario_partida: string; // "HH:MM:SS" or "HH:MM"
    dias_da_semana: RotaFixaDiasDaSemana;
    rota_paradas: RotaParada[];
    criado_em: string;
    atualizado_em: string;
}

/** Payload for POST /rotas-fixas/ (create) */
export interface RotaFixaCreatePayload {
    origem_nome: string;
    destino_nome: string;
    empresa: number;
    veiculo?: number | null;
    motorista?: number | null;
    horario_partida: string; // "HH:MM" or "HH:MM:SS"
    dias_da_semana: RotaFixaDiasDaSemana;
    paradas: ParadaInput[];
}

/** Payload for PUT/PATCH /rotas-fixas/{id}/ — all fields optional for PATCH */
export type RotaFixaUpdatePayload = Partial<RotaFixaCreatePayload>;

// =============================================================================
// Paginated response (DRF default)
// =============================================================================

export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

// =============================================================================
// Motorista
// =============================================================================

/** Motorista as returned by the API (read) */
export interface Motorista {
    id: number;
    nome: string;
    cpf: string;
    cnh: string;
    celular: string;
    ativo: boolean;
    criado_em: string; // ISO 8601 datetime
    atualizado_em: string; // ISO 8601 datetime
}

/** Payload for POST /motoristas/ (create) */
export interface MotoristaCreatePayload {
    nome: string;
    cpf: string;
    cnh: string;
    celular: string;
    ativo?: boolean; // default true
}

/** Payload for PUT/PATCH /motoristas/{id}/ — all fields optional for PATCH */
export type MotoristaUpdatePayload = Partial<MotoristaCreatePayload>;

// =============================================================================
// EmpresaParceira
// =============================================================================

/** EmpresaParceira as returned by the API (read) */
export interface EmpresaParceira {
    id: number;
    nome: string;
    cnpj: string;
    contato: string;
    email: string;
    criado_em: string; // ISO 8601 datetime
    atualizado_em: string; // ISO 8601 datetime
}

/** Payload for POST /empresas-parceiras/ (create) */
export interface EmpresaParceiraCreatePayload {
    nome: string;
    cnpj: string;
    contato: string;
    email: string;
}

/** Payload for PUT/PATCH /empresas-parceiras/{id}/ — all fields optional for PATCH */
export type EmpresaParceiraUpdatePayload = Partial<EmpresaParceiraCreatePayload>;
