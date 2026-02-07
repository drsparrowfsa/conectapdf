
import React from 'react';
import { Link } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { Tool } from '../types';

interface ToolCardProps {
  tool: Tool;
}

import { useTranslation } from 'react-i18next';

const ToolCard: React.FC<ToolCardProps> = ({ tool }) => {
  const { t } = useTranslation();
  const IconComponent = (LucideIcons as any)[tool.icon] || LucideIcons.HelpCircle;

  return (
    <Link
      to={tool.path}
      className="group bg-white p-8 rounded-[2rem] border border-slate-100/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(79,70,229,0.1)] hover:border-indigo-100 transition-all duration-300 flex flex-col items-start gap-6 hover:-translate-y-2"
    >
      <div className="p-4 bg-indigo-50/80 rounded-2xl group-hover:bg-indigo-600 transition-colors duration-300">
        <IconComponent className="text-indigo-600 w-8 h-8 group-hover:text-white transition-colors duration-300" />
      </div>
      <div>
        <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-2 min-h-[3.5rem] line-clamp-2 flex items-center">
          {t(`tools.${tool.id}.name`, tool.name)}
        </h3>
        <p className="text-slate-500 leading-relaxed line-clamp-2 font-medium">
          {t(`tools.${tool.id}.desc`, tool.description)}
        </p>
      </div>
      <div className="mt-auto pt-4 flex items-center text-sm font-bold text-indigo-600 tracking-wide group-hover:translate-x-2 transition-transform">
        {t('common.openTool')}
        <LucideIcons.ArrowRight className="ml-2 w-4 h-4" />
      </div>
    </Link>
  );
};

export default ToolCard;
