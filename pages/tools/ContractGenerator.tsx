import React, { useState } from 'react';
import Seo from '../../components/Seo';
import { toast } from 'sonner';
import {
    FileSignature,
    Wand2,
    Loader2,
    AlertCircle,
    CheckCircle,
    FileDown,
    Copy,
    Info,
    User,
    BadgeDollarSign,
    StickyNote,
    Handshake,
    Briefcase,
    Home,
    DollarSign,
    Users,
    Lock,
    Save,
    Edit3,
    FileText,
    Globe,
    Scale,
    ShieldCheck,
    Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import BackButton from '../../components/BackButton';
import { useTranslation } from 'react-i18next';
import { geminiService } from '../../services/geminiService';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx';

const ContractGenerator: React.FC = () => {
    const { t, i18n } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        jurisdiction: 'BR',
        party1: '',
        party1Doc: '',
        party2: '',
        party2Doc: '',
        object: '',
        value: '',
        duration: '',
        specialClauses: ''
    });

    const isRtl = i18n.language === 'ar' || i18n.language === 'he';

    const contractTypes = [
        { id: 'service', icon: <Handshake size={24} />, label: t('contractGenerator.types.service') },
        { id: 'employment', icon: <Briefcase size={24} />, label: t('contractGenerator.types.employment') },
        { id: 'rent', icon: <Home size={24} />, label: t('contractGenerator.types.rent') },
        { id: 'sale', icon: <DollarSign size={24} />, label: t('contractGenerator.types.sale') },
        { id: 'partnership', icon: <Users size={24} />, label: t('contractGenerator.types.partnership') },
        { id: 'nda', icon: <Lock size={24} />, label: t('contractGenerator.types.nda') },
    ];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleGenerate = async () => {
        if (!selectedType) {
            setError(i18n.language === 'pt' ? 'Por favor, selecione um tipo de contrato.' : 'Please select a contract type.');
            return;
        }
        if (!formData.party1 || !formData.party1Doc || !formData.party2 || !formData.party2Doc || !formData.object) {
            setError(i18n.language === 'pt' ? 'Por favor, preencha todos os campos obrigatórios.' : 'Please fill in all required fields.');
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const contract = await geminiService.generateContract({
                ...formData,
                type: selectedType
            }, i18n.language);
            setResult(contract);
        } catch (err: any) {
            console.error('Contract generation error:', err);
            toast.error(err.message || 'Erro ao gerar contrato.');
        } finally {
            setLoading(false);
        }
    };

    const downloadAsPDF = () => {
        if (!result) return;

        try {
            const doc = new jsPDF();
            doc.setFont('times', 'normal');
            doc.setFontSize(11);

            const cleanText = result.replace(/[#*`]/g, '');
            const lines = doc.splitTextToSize(cleanText, 170);

            let y = 20;
            lines.forEach((line: string) => {
                if (y > 280) {
                    doc.addPage();
                    y = 20;
                }
                doc.text(line, 20, y);
                y += 6;
            });

            doc.save('contrato.pdf');
        } catch (e) {
            console.error("PDF generation failed", e);
        }
    };

    const downloadAsDocx = async () => {
        if (!result) return;

        try {
            const doc = new Document({
                sections: [{
                    properties: {},
                    children: result.split('\n').map(line =>
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: line.replace(/[#*`]/g, ''),
                                    font: "Times New Roman",
                                    size: 24, // 12pt
                                })
                            ],
                            spacing: { after: 200 },
                            alignment: isRtl ? AlignmentType.RIGHT : AlignmentType.LEFT,
                        })
                    ),
                }],
            });

            const blob = await Packer.toBlob(doc);
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'contrato.docx';
            link.click();
            URL.revokeObjectURL(url);
        } catch (e) {
            console.error("DOCX generation failed", e);
        }
    };

    const copyToClipboard = () => {
        if (result) {
            navigator.clipboard.writeText(result);
        }
    };

    return (
        <div className={`min-h-screen bg-slate-50 pt-16 pb-16 px-4 ${isRtl ? 'font-hebrew' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
            <Seo
                title={`${t('contractGenerator.title')} - ConectaPDF`}
                description={t('contractGenerator.subtitle')}
                url="https://conectapdf.com/contract-generator"
            />
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <BackButton />
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-indigo-100 rounded-2xl text-indigo-600">
                            <FileSignature size={32} />
                        </div>
                        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">{t('contractGenerator.title')}</h1>
                    </div>
                    <p className={`text-slate-600 text-lg ${isRtl ? 'mr-[72px]' : 'ml-[72px]'}`}>
                        {t('contractGenerator.subtitle')}
                    </p>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100">
                    {!result ? (
                        <div className="space-y-8">
                            {/* Jurisdiction and Type Selection */}
                            <div className="space-y-6">
                                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row items-center gap-6">
                                    <div className="flex items-center gap-3 text-slate-700 font-bold min-w-[180px]">
                                        <Globe className="text-indigo-500" />
                                        {t('contractGenerator.jurisdiction')}
                                    </div>
                                    <select
                                        id="jurisdiction"
                                        value={formData.jurisdiction}
                                        onChange={handleInputChange}
                                        className="w-full sm:w-64 p-3 bg-white border-2 border-slate-200 rounded-xl focus:border-indigo-500 outline-none transition-all font-bold text-slate-700"
                                    >
                                        <option value="BR">Brasil</option>
                                        <option value="US">United States</option>
                                        <option value="PT">Portugal</option>
                                        <option value="ES">España</option>
                                    </select>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-slate-700">{t('contractGenerator.contractType')}</h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                                        {contractTypes.map((type) => (
                                            <button
                                                key={type.id}
                                                onClick={() => setSelectedType(type.id)}
                                                className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2
                                                    ${selectedType === type.id
                                                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm'
                                                        : 'bg-white border-slate-100 text-slate-500 hover:border-indigo-200 hover:bg-slate-50'}`}
                                            >
                                                {type.icon}
                                                <span className="text-xs font-bold uppercase tracking-wider">{type.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Main Form */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label htmlFor="party1" className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                        <User size={16} className="text-indigo-500" />
                                        {t('contractGenerator.labels.party1')} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="party1"
                                        type="text"
                                        value={formData.party1}
                                        onChange={handleInputChange}
                                        placeholder={t('contractGenerator.labels.placeholder')}
                                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all font-medium"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="party1Doc" className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                        <FileText size={16} className="text-indigo-500" />
                                        {t('contractGenerator.labels.party1Doc')} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="party1Doc"
                                        type="text"
                                        value={formData.party1Doc}
                                        onChange={handleInputChange}
                                        placeholder={t('contractGenerator.labels.docPlaceholder')}
                                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all font-medium"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="party2" className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                        <User size={16} className="text-indigo-500" />
                                        {t('contractGenerator.labels.party2')} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="party2"
                                        type="text"
                                        value={formData.party2}
                                        onChange={handleInputChange}
                                        placeholder={t('contractGenerator.labels.placeholder')}
                                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all font-medium"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="party2Doc" className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                        <FileText size={16} className="text-indigo-500" />
                                        {t('contractGenerator.labels.party2Doc')} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="party2Doc"
                                        type="text"
                                        value={formData.party2Doc}
                                        onChange={handleInputChange}
                                        placeholder={t('contractGenerator.labels.docPlaceholder')}
                                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="object" className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                    <StickyNote size={16} className="text-indigo-500" />
                                    {t('contractGenerator.labels.object')} <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="object"
                                    rows={3}
                                    value={formData.object}
                                    onChange={handleInputChange}
                                    placeholder={t('contractGenerator.labels.objectPlaceholder')}
                                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all font-medium resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label htmlFor="value" className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                        <BadgeDollarSign size={16} className="text-indigo-500" />
                                        {t('contractGenerator.labels.value')}
                                    </label>
                                    <input
                                        id="value"
                                        type="text"
                                        value={formData.value}
                                        onChange={handleInputChange}
                                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all font-medium"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="duration" className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                        <Loader2 size={16} className="text-indigo-500" />
                                        {t('contractGenerator.labels.duration')}
                                    </label>
                                    <input
                                        id="duration"
                                        type="text"
                                        value={formData.duration}
                                        onChange={handleInputChange}
                                        placeholder={t('contractGenerator.labels.durationPlaceholder')}
                                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="specialClauses" className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                    <Info size={16} className="text-indigo-500" />
                                    {t('contractGenerator.labels.specialClauses')}
                                </label>
                                <textarea
                                    id="specialClauses"
                                    rows={2}
                                    value={formData.specialClauses}
                                    onChange={handleInputChange}
                                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all font-medium resize-none"
                                />
                            </div>

                            <button
                                onClick={handleGenerate}
                                disabled={loading}
                                className={`w-full h-16 rounded-2xl flex items-center justify-center gap-3 font-bold text-lg transition-all shadow-md
                  ${loading
                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                        : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:-translate-y-1 shadow-indigo-100'}`}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin" />
                                        {t('contractGenerator.processing')}
                                    </>
                                ) : (
                                    <>
                                        <Wand2 size={24} /> {t('contractGenerator.generate')}
                                    </>
                                )}
                            </button>

                            <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl text-amber-700 text-sm flex gap-3">
                                <Info size={18} className="shrink-0 mt-0.5" />
                                {t('contractGenerator.disclaimer')}
                            </div>
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
                                <div className="flex items-center gap-3 text-indigo-600">
                                    <CheckCircle size={24} />
                                    <h2 className="text-2xl font-bold text-slate-900">{t('contractGenerator.success')}</h2>
                                </div>
                                <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                                    <button
                                        onClick={() => setIsEditing(!isEditing)}
                                        className={`flex-1 sm:flex-none p-3 rounded-xl transition-all flex items-center justify-center gap-2 font-bold
                                            ${isEditing ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                    >
                                        {isEditing ? <Save size={18} /> : <Edit3 size={18} />}
                                        {isEditing ? t('contractGenerator.save') : t('contractGenerator.edit')}
                                    </button>
                                    <button
                                        onClick={copyToClipboard}
                                        className="flex-1 sm:flex-none p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 font-bold"
                                    >
                                        <Copy size={18} /> {t('contractGenerator.copy')}
                                    </button>
                                    <button
                                        onClick={downloadAsDocx}
                                        className="flex-1 sm:flex-none p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-bold shadow-md shadow-blue-100"
                                    >
                                        <FileText size={18} /> {t('contractGenerator.downloadDocx')}
                                    </button>
                                    <button
                                        onClick={downloadAsPDF}
                                        className="flex-1 sm:flex-none p-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2 font-bold shadow-md shadow-red-100"
                                    >
                                        <FileDown size={18} /> {t('contractGenerator.downloadPdf')}
                                    </button>
                                </div>
                            </div>

                            <div className={`bg-slate-50 p-8 rounded-3xl border-2 transition-all relative group
                                ${isEditing ? 'border-indigo-500 ring-4 ring-indigo-50 bg-white' : 'border-slate-100'}`}>
                                {isEditing ? (
                                    <textarea
                                        value={result}
                                        onChange={(e) => setResult(e.target.value)}
                                        className="w-full min-h-[500px] p-0 bg-transparent border-none outline-none font-serif text-lg leading-relaxed text-slate-700 resize-none"
                                        autoFocus
                                    />
                                ) : (
                                    <div
                                        className={`prose prose-slate max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap font-serif text-lg ${isRtl ? 'text-right' : 'text-left'}`}
                                        dir={isRtl ? 'rtl' : 'ltr'}
                                    >
                                        {result}
                                    </div>
                                )}
                            </div>

                            <div className="mt-8 pt-8 border-t border-slate-100">
                                <button
                                    onClick={() => {
                                        setResult(null);
                                        setIsEditing(false);
                                    }}
                                    className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-colors"
                                >
                                    {t('ocr.another')}
                                </button>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 font-medium flex gap-3 items-start">
                            <AlertCircle className="shrink-0 mt-0.5" />
                            {error}
                        </div>
                    )}
                </div>


                {/* Feature Cards Grid */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md group">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <Scale size={24} />
                        </div>
                        <h3 className="font-bold text-slate-900 mb-2">{t('contractGenerator.features.validity.title')}</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            {t('contractGenerator.features.validity.desc')}
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md group">
                        <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                            <ShieldCheck size={24} />
                        </div>
                        <h3 className="font-bold text-slate-900 mb-2">{t('contractGenerator.features.security.title')}</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            {t('contractGenerator.features.security.desc')}
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md group">
                        <div className="w-12 h-12 bg-pink-50 text-pink-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-pink-600 group-hover:text-white transition-colors">
                            <Zap size={24} />
                        </div>
                        <h3 className="font-bold text-slate-900 mb-2">{t('contractGenerator.features.speed.title')}</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            {t('contractGenerator.features.speed.desc')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContractGenerator;
