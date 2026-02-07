import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Construction } from 'lucide-react';
import { TOOLS } from '../constants';
import { useTranslation } from 'react-i18next';

const ToolPlaceholder: React.FC = () => {
    const { t } = useTranslation();
    const { pathname } = useLocation();
    const tool = TOOLS.find(t => t.path === pathname);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
            <div className="bg-white p-10 rounded-3xl shadow-xl max-w-lg w-full border border-slate-100">
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Construction className="w-10 h-10 text-indigo-600" />
                </div>

                <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
                    {tool ? t(`tools.${tool.id}.name`) : t('placeholder.title')}
                </h1>

                <p className="text-slate-500 mb-8">
                    {t('placeholder.desc', { tool: tool ? t(`tools.${tool.id}.name`) : '' })}
                </p>

                <Link
                    to="/ferramentas"
                    className="inline-flex items-center gap-2 text-indigo-600 font-bold hover:text-indigo-700 transition-colors bg-indigo-50 px-6 py-3 rounded-xl hover:bg-indigo-100"
                >
                    <ArrowLeft size={18} />
                    {t('placeholder.back')}
                </Link>
            </div>
        </div>
    );
};

export default ToolPlaceholder;
