import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProvedorAutenticacao } from './contextos/ContextoAutenticacao';
import RotaProtegida from './componentes/RotaProtegida';
import LayoutPrincipal from './componentes/layout/LayoutPrincipal';
import PaginaLogin from './paginas/PaginaLogin';
import PaginaRotasExtras from './paginas/PaginaRotasExtras';

export default function App() {
  return (
    <ProvedorAutenticacao>
      <BrowserRouter>
        <Routes>
          {/* Rota pública */}
          <Route path="/login" element={<PaginaLogin />} />

          {/* Rotas protegidas */}
          <Route
            element={
              <RotaProtegida>
                <LayoutPrincipal />
              </RotaProtegida>
            }
          >
            <Route path="/rotas-extras" element={<PaginaRotasExtras />} />
          </Route>

          {/* Redirect padrão */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ProvedorAutenticacao>
  );
}
