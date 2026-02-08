import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface BackButtonProps {
    className?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ className = '' }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'ar' || i18n.language === 'he';

    const handleBack = (e: React.MouseEvent) => {
        e.preventDefault();
        if (window.history.state && window.history.state.idx > 0) {
            navigate(-1);
        } else {
            navigate('/ferramentas');
        }
    };

    return (
        <a
            href="/ferramentas"
            onClick={handleBack}
            className={`inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold transition-colors mb-4 group ${isRtl ? 'flex-row-reverse' : ''} ${className}`}
        >
            <ArrowLeft
                size={18}
                className={`${isRtl ? 'rotate-180' : ''} group-hover:-translate-x-1 transition-transform`}
            />
            {t('placeholder.back')}
        </a>
    );
};

export default BackButton;
