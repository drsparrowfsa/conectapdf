import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Star } from 'lucide-react';
import { FEATURES, TOOLS } from '../constants';
import ToolCard from '../components/ToolCard';
import Hero from '../components/ui/neural-network-hero';
import Testimonials from '../components/Testimonials';
import Seo from '../components/Seo';

import { useTranslation } from 'react-i18next';

const Home: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col">
      <Seo
        title="ConectaPDF - Ferramentas de PDF e Imagem com IA"
        description="A plataforma definitiva para manipulação inteligente de documentos. Converta PDFs, extraia dados de tabelas e otimize imagens com IA."
      />
      {/* Neural Network Hero Section */}
      <Hero
        title={t('hero.title')}
        description={t('hero.description')}
        badgeText={t('hero.badgeText')}
        badgeLabel={t('hero.badge')}
        ctaButtons={[
          { text: t('hero.ctaTools'), href: "#ferramentas", primary: true },
          { text: t('hero.ctaWork'), href: "#como-funciona" }
        ]}
        microDetails={[
          t('hero.details.local'),
          t('hero.details.security'),
          t('hero.details.ai')
        ]}
        height="min-h-screen"
      />

      <div className="relative z-20 bg-white">
        {/* Features Grid - Smooth transition with negative margin */}
        <section id="como-funciona" className="py-24 bg-white relative z-20 -mt-16 rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.2)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
                {t('features.title')}
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                {t('features.subtitle')}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {['privacy', 'speed', 'ai'].map((key, idx) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="p-10 rounded-3xl bg-slate-50 border border-slate-100 hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-300"
                >
                  <div className="mb-6 inline-block p-4 bg-white rounded-2xl shadow-sm">{FEATURES[idx].icon}</div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">{t(`features.${key}.title`)}</h3>
                  <p className="text-slate-600 leading-relaxed">{t(`features.${key}.desc`)}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Tools Hub Preview */}
        <section id="ferramentas" className="py-32 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
              <div className="max-w-2xl">
                <span className="text-indigo-600 font-bold tracking-widest uppercase text-sm mb-4 block">{t('hubPreview.badge')}</span>
                <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">{t('hubPreview.title')}</h2>
                <p className="text-xl text-slate-600">{t('hubPreview.subtitle')}</p>
              </div>
              <Link to="/ferramentas" className="group bg-indigo-50 text-indigo-700 px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-indigo-600 hover:text-white transition-all duration-300">
                {t('hubPreview.viewAll')} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {TOOLS.slice(0, 4).map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <Testimonials />

        {/* Final Call to Action */}
        <section className="py-32 bg-slate-900 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-500 rounded-full blur-[120px]" />
          </div>
          <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-6xl font-black text-white mb-8 leading-tight">
                {t('finalCta.title')}
              </h2>
              <p className="text-slate-400 text-xl mb-12 max-w-3xl mx-auto leading-relaxed">
                {t('finalCta.subtitle')}
              </p>
              <Link to="/ferramentas" className="inline-flex items-center gap-3 bg-indigo-600 text-white px-12 py-6 rounded-3xl text-xl font-bold hover:bg-indigo-500 hover:-translate-y-1 transition-all shadow-[0_20px_50px_rgba(79,70,229,0.3)]">
                {t('finalCta.button')} <Star size={24} />
              </Link>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;