import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ProvedorAutenticacao } from './contextos/ContextoAutenticacao';
import RotaProtegida from './componentes/RotaProtegida';
import LayoutPrincipal from './componentes/layout/LayoutPrincipal';
import PaginaLogin from './paginas/PaginaLogin';
import PaginaCadastro from './paginas/PaginaCadastro';
import PaginaRotasExtras from './paginas/PaginaRotasExtras';
import PaginaListaRotasExtras from './paginas/PaginaListaRotasExtras';
import PaginaRotasFixas from './paginas/PaginaRotasFixas';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export default function App() {
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <ProvedorAutenticacao>
        <BrowserRouter>
        <Routes>
          {/* Rotas públicas */}
          <Route path="/login" element={<PaginaLogin />} />
          <Route path="/cadastro" element={<PaginaCadastro />} />

          {/* Rotas protegidas */}
          <Route
            element={
              <RotaProtegida>
                <LayoutPrincipal />
              </RotaProtegida>
            }
          >
            <Route path="/rotas-extras" element={<PaginaRotasExtras />} />
            <Route path="/rotas-extras/lista" element={<PaginaListaRotasExtras />} />
            <Route path="/rotas-fixas" element={<PaginaRotasFixas />} />
          </Route>

          {/* Redirect padrão */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        </BrowserRouter>
      </ProvedorAutenticacao>
    </GoogleOAuthProvider>
  );
}
