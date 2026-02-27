import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAutenticacao } from '../../contextos/ContextoAutenticacao';
import { Truck, Route, List, LogOut, Menu, X, CalendarDays } from 'lucide-react';
import { useState } from 'react';

export default function LayoutPrincipal() {
    const { usuario, logout } = useAutenticacao();
    const navegar = useNavigate();
    const [menuAberto, setMenuAberto] = useState(false);

    const aoSair = async () => {
        await logout();
        navegar('/login');
    };

    return (
        <div className="min-h-screen flex flex-col bg-azul-950">
            {/* Navbar */}
            <header className="bg-azul-900/80 backdrop-blur-xl border-b border-azul-700/30 sticky top-0 z-50">
                <div className="max-w-[1920px] mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-azul-500 to-azul-400 flex items-center justify-center shadow-lg shadow-azul-500/20">
                                <Truck size={20} className="text-white" />
                            </div>
                            <div className="hidden sm:block">
                                <h1 className="text-base font-bold text-cinza-100 leading-tight">
                                    TransFret
                                </h1>
                                <p className="text-[10px] text-cinza-400 font-medium tracking-wider uppercase">
                                    Sistema de Fretamento
                                </p>
                            </div>
                        </div>

                        {/* Nav Links — Desktop */}
                        <nav className="hidden md:flex items-center gap-1">
                            <NavLink
                                to="/rotas-extras"
                                className={({ isActive }) =>
                                    `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                        ? 'bg-azul-500/15 text-azul-400 shadow-sm'
                                        : 'text-cinza-400 hover:text-cinza-200 hover:bg-azul-800/50'
                                    }`
                                }
                            >
                                <Route size={16} />
                                Cadastrar
                            </NavLink>
                            <NavLink
                                to="/rotas-fixas"
                                className={({ isActive }) =>
                                    `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                        ? 'bg-azul-500/15 text-azul-400 shadow-sm'
                                        : 'text-cinza-400 hover:text-cinza-200 hover:bg-azul-800/50'
                                    }`
                                }
                            >
                                <CalendarDays size={16} />
                                Rotas Fixas
                            </NavLink>
                            <NavLink
                                to="/rotas-extras/lista"
                                className={({ isActive }) =>
                                    `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                        ? 'bg-azul-500/15 text-azul-400 shadow-sm'
                                        : 'text-cinza-400 hover:text-cinza-200 hover:bg-azul-800/50'
                                    }`
                                }
                            >
                                <List size={16} />
                                Listar Rotas
                            </NavLink>
                        </nav>

                        {/* User & Actions */}
                        <div className="flex items-center gap-3">
                            <div className="hidden sm:flex items-center gap-3">
                                <div className="text-right">
                                    <p className="text-sm font-medium text-cinza-200">
                                        {usuario?.nome || 'Usuário'}
                                    </p>
                                    <p className="text-[11px] text-cinza-400">
                                        {usuario?.cargo || 'Colaborador'}
                                    </p>
                                </div>
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-azul-600 to-azul-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                    {usuario?.nome?.charAt(0) || 'U'}
                                </div>
                            </div>

                            <button
                                onClick={aoSair}
                                className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg text-cinza-400 hover:text-erro hover:bg-erro/10 transition-all duration-200 text-sm cursor-pointer"
                                title="Sair"
                            >
                                <LogOut size={16} />
                            </button>

                            {/* Hamburger — Mobile */}
                            <button
                                onClick={() => setMenuAberto(!menuAberto)}
                                className="md:hidden p-2 rounded-lg text-cinza-400 hover:text-cinza-200 hover:bg-azul-800/50 transition-colors cursor-pointer"
                            >
                                {menuAberto ? <X size={20} /> : <Menu size={20} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {menuAberto && (
                    <div className="md:hidden border-t border-azul-700/30 bg-azul-900/95 backdrop-blur-xl animar-fadeIn">
                        <div className="px-4 py-3 space-y-1">
                            <NavLink
                                to="/rotas-extras"
                                onClick={() => setMenuAberto(false)}
                                className={({ isActive }) =>
                                    `flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${isActive
                                        ? 'bg-azul-500/15 text-azul-400'
                                        : 'text-cinza-400 hover:text-cinza-200 hover:bg-azul-800/50'
                                    }`
                                }
                            >
                                <Route size={16} />
                                Cadastrar Rota
                            </NavLink>
                            <NavLink
                                to="/rotas-fixas"
                                onClick={() => setMenuAberto(false)}
                                className={({ isActive }) =>
                                    `flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${isActive
                                        ? 'bg-azul-500/15 text-azul-400'
                                        : 'text-cinza-400 hover:text-cinza-200 hover:bg-azul-800/50'
                                    }`
                                }
                            >
                                <CalendarDays size={16} />
                                Rotas Fixas
                            </NavLink>
                            <NavLink
                                to="/rotas-extras/lista"
                                onClick={() => setMenuAberto(false)}
                                className={({ isActive }) =>
                                    `flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${isActive
                                        ? 'bg-azul-500/15 text-azul-400'
                                        : 'text-cinza-400 hover:text-cinza-200 hover:bg-azul-800/50'
                                    }`
                                }
                            >
                                <List size={16} />
                                Listar Rotas
                            </NavLink>
                            <button
                                onClick={aoSair}
                                className="flex items-center gap-2 w-full px-4 py-3 rounded-lg text-cinza-400 hover:text-erro hover:bg-erro/10 transition-all text-sm cursor-pointer"
                            >
                                <LogOut size={16} />
                                Sair
                            </button>
                        </div>
                    </div>
                )}
            </header>

            {/* Conteúdo */}
            <main className="flex-1 flex">
                <Outlet />
            </main>
        </div>
    );
}
