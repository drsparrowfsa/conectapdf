import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    if (location.pathname === '/') {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/');
      // Wait for navigation to complete before scrolling
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link to="/" className="flex items-center gap-2 group transition-opacity hover:opacity-90">
            <img
              src="/assets/logos/logo.png"
              alt="ConectaPDF Logo"
              className="h-10 w-auto object-contain"
            />
          </Link>
          <div className="flex items-center gap-2 sm:gap-6">
            <div className="hidden md:flex items-center gap-6">
              <a
                href="#como-funciona"
                onClick={(e) => handleAnchorClick(e, 'como-funciona')}
                className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
              >
                {t('navbar.howItWorks')}
              </a>
              <a
                href="#secao-ferramentas"
                onClick={(e) => handleAnchorClick(e, 'secao-ferramentas')}
                className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
              >
                {t('navbar.tools')}
              </a>
            </div>

            <LanguageSwitcher />

            <Link to="/ferramentas" className="hidden sm:flex bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95">
              {t('navbar.openHub')}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
