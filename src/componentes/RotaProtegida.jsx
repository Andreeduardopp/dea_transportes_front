import { Navigate } from 'react-router-dom';
import { useAutenticacao } from '../contextos/ContextoAutenticacao';
import { Loader2 } from 'lucide-react';

export default function RotaProtegida({ children }) {
    const { estaAutenticado, carregando } = useAutenticacao();

    if (carregando) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-azul-950">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 size={40} className="text-azul-500 animar-girar" />
                    <p className="text-cinza-400 text-sm">Carregando...</p>
                </div>
            </div>
        );
    }

    if (!estaAutenticado) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
