import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Mail, Phone, MapPin, MessageCircle } from 'lucide-react';
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
            <p className="text-slate-500 max-w-sm leading-relaxed mb-8">
              {t('footer.desc')}
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-2.5 bg-slate-50 rounded-xl hover:bg-indigo-600 hover:text-white transition-all text-slate-600 shadow-sm border border-slate-100 hover:shadow-lg hover:shadow-indigo-500/20"><Github size={18} /></a>
              <a
                href={`https://wa.me/${t('footer.phone').replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-slate-50 rounded-xl hover:bg-indigo-600 hover:text-white transition-all text-slate-600 shadow-sm border border-slate-100 hover:shadow-lg hover:shadow-indigo-500/20"
              >
                <MessageCircle size={18} />
              </a>
              <a href="#" className="p-2.5 bg-slate-50 rounded-xl hover:bg-indigo-600 hover:text-white transition-all text-slate-600 shadow-sm border border-slate-100 hover:shadow-lg hover:shadow-indigo-500/20"><Linkedin size={18} /></a>
            </div>
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
            <h3 className="text-slate-900 font-bold mb-6">{t('footer.contact')}</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 rounded-lg text-indigo-600 border border-slate-100">
                  <Mail size={16} />
                </div>
                <a href={`mailto:${t('footer.email')}`} className="text-sm hover:text-indigo-600 transition-colors">
                  {t('footer.email')}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 rounded-lg text-indigo-600 border border-slate-100">
                  <Phone size={16} />
                </div>
                <a href={`tel:${t('footer.phone').replace(/[^0-9+]/g, '')}`} className="text-sm hover:text-indigo-600 transition-colors">
                  {t('footer.phone')}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <div className="p-2 bg-slate-50 rounded-lg text-indigo-600 border border-slate-100 mt-0.5">
                  <MapPin size={16} />
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(t('footer.address'))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:text-indigo-600 transition-colors"
                >
                  {t('footer.address')}
                </a>
              </li>
            </ul>
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
