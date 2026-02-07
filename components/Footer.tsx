import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="relative z-20 bg-white text-slate-600 py-16 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <img
                src="/assets/logos/logo.png"
                alt="ConectaPDF Logo"
                className="h-10 w-auto object-contain"
              />
            </div>
            <p className="text-slate-500 max-w-sm leading-relaxed">
              {t('footer.desc')}
            </p>
          </div>
          <div>
            <h3 className="text-slate-900 font-bold mb-6">{t('footer.links')}</h3>
            <ul className="space-y-3">
              <li><a href="#" className="hover:text-indigo-600 transition-colors text-sm font-medium">{t('footer.home')}</a></li>
              <li><Link to="/ferramentas" className="hover:text-indigo-600 transition-colors text-sm font-medium">{t('footer.allTools')}</Link></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors text-sm font-medium">{t('footer.about')}</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors text-sm font-medium">{t('footer.contact')}</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-slate-900 font-bold mb-6">{t('footer.social')}</h3>
            <div className="flex gap-4">
              <a href="#" className="p-2.5 bg-slate-50 rounded-xl hover:bg-indigo-600 hover:text-white transition-all text-slate-600 shadow-sm border border-slate-100 hover:shadow-lg hover:shadow-indigo-500/20"><Github size={20} /></a>
              <a href="#" className="p-2.5 bg-slate-50 rounded-xl hover:bg-indigo-600 hover:text-white transition-all text-slate-600 shadow-sm border border-slate-100 hover:shadow-lg hover:shadow-indigo-500/20"><Twitter size={20} /></a>
              <a href="#" className="p-2.5 bg-slate-50 rounded-xl hover:bg-indigo-600 transition-all text-slate-600 shadow-sm border border-slate-100 hover:shadow-lg hover:shadow-indigo-500/20"><Linkedin size={20} /></a>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-100 mt-16 pt-8 text-center text-xs text-slate-400 tracking-widest uppercase font-semibold">
          {t('footer.copyright', { year: new Date().getFullYear() })}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
