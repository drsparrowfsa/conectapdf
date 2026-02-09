
import React from 'react';
import { Search } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { TOOLS } from '../constants';
import { ToolCategory } from '../types';
import ToolCard from '../components/ToolCard';
import { motion } from 'framer-motion';
import Seo from '../components/Seo';

import { useTranslation } from 'react-i18next';

const Hub: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const searchQuery = searchParams.get('search') || '';
  const categoryParam = searchParams.get('category');

  // Find the matching enum value for the category param, defaulting to ALL
  const selectedCategory = Object.values(ToolCategory).find(c => c === categoryParam) || ToolCategory.ALL;

  const categories = Object.values(ToolCategory);

  // Mapping ToolCategory enum values to translation keys
  const categoryKeys: Record<string, string> = {
    [ToolCategory.ALL]: 'all',
    [ToolCategory.PDF]: 'pdf',
    [ToolCategory.AI]: 'ai',
    [ToolCategory.CONVERTER]: 'converter'
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchParams(prev => {
      if (value) prev.set('search', value);
      else prev.delete('search');
      return prev;
    }, { replace: true });
  };

  const handleCategoryChange = (category: ToolCategory) => {
    setSearchParams(prev => {
      if (category === ToolCategory.ALL) prev.delete('category');
      else prev.set('category', category);
      return prev;
    });
  };

  const filteredTools = TOOLS.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === ToolCategory.ALL || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4">
      <Seo
        title={t('hub.seoTitle', 'Ferramentas PDF Gratuitas - ConectaPDF')}
        description={t('hub.seoDescription', 'Converta, edite e gerencie seus PDFs online gratuitamente. Ferramentas fáceis de usar para unir, dividir, comprimir e converter PDFs.')}
        url="https://conectapdf.com/tools"
      />
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4">{t('hub.title')}</h1>
          <p className="text-lg text-slate-600">{t('hub.subtitle')}</p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 mb-12 flex flex-col lg:flex-row gap-6 items-center justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder={t('hub.search')}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
              >
                {t(`hub.categories.${categoryKeys[cat] || 'all'}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Tools Grid */}
        {filteredTools.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredTools.map((tool, idx) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <ToolCard tool={tool} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl border border-slate-200">
            <Search className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900">{t('hub.noResults')}</h3>
            <p className="text-slate-500 mt-2">{t('hub.tryAgain')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Hub;
