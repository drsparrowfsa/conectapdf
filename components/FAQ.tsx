import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, MessageCircle, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const FAQItem: React.FC<{ question: string; answer: string; isOpen: boolean; onClick: () => void }> = ({
    question,
    answer,
    isOpen,
    onClick
}) => {
    return (
        <motion.div
            layout
            className={`mb-4 rounded-3xl transition-all duration-300 border ${isOpen
                ? 'bg-white border-indigo-200 shadow-xl shadow-indigo-500/5'
                : 'bg-slate-50/50 border-slate-100 hover:border-slate-200 hover:bg-white'
                }`}
        >
            <button
                onClick={onClick}
                className="w-full px-8 py-6 flex items-center justify-between text-left group"
            >
                <span className={`text-lg font-bold transition-colors duration-300 ${isOpen ? 'text-indigo-600' : 'text-slate-800'
                    }`}>
                    {question}
                </span>
                <motion.div
                    animate={{
                        rotate: isOpen ? 180 : 0,
                        backgroundColor: isOpen ? '#EEF2FF' : 'transparent',
                        color: isOpen ? '#4F46E5' : '#94A3B8'
                    }}
                    className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300"
                >
                    <ChevronDown size={20} strokeWidth={2.5} />
                </motion.div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                        className="overflow-hidden"
                    >
                        <div className="px-8 pb-8 pt-2">
                            <div className="h-px w-full bg-slate-100 mb-6" />
                            <p className="text-slate-600 leading-relaxed text-lg">
                                {answer}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const FAQ: React.FC = () => {
    const { t } = useTranslation();
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const faqItems = t('faq.items', { returnObjects: true }) as Array<{ question: string; answer: string }>;
    if (!Array.isArray(faqItems)) return null;

    const stats = [
        { icon: <ShieldCheck className="text-emerald-500" />, text: t('faq.stats.secure') },
        { icon: <Sparkles className="text-indigo-500" />, text: t('faq.stats.ai') }
    ];

    return (
        <section id="faq" className="py-32 bg-white relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-40">
                <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-100 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-100 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">

                    {/* Left Column: Heading & Stats */}
                    <div className="lg:col-span-5 sticky lg:top-32">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 font-bold text-sm mb-6">
                                <HelpCircle size={18} />
                                {t('faq.badge')}
                            </span>
                            <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-8 leading-[1.1] tracking-tight">
                                {t('faq.title')}
                            </h2>
                            <p className="text-xl text-slate-600 mb-10 leading-relaxed">
                                {t('faq.subtitle')}
                            </p>

                            <div className="flex flex-wrap gap-4 mb-12">
                                {stats.map((stat, i) => (
                                    <div key={i} className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-4 py-2 rounded-2xl">
                                        {stat.icon}
                                        <span className="font-bold text-slate-700 text-sm whitespace-nowrap">{stat.text}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="p-8 rounded-[2rem] bg-slate-900 text-white relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                                    <MessageCircle size={80} />
                                </div>
                                <h4 className="text-2xl font-bold mb-4 relative z-10">{t('faq.moreQuestions')}</h4>
                                <p className="text-slate-400 mb-6 relative z-10 text-lg">
                                    {t('faq.moreQuestionsDesc')}
                                </p>
                                <a
                                    href="mailto:info@conectapdf.com"
                                    className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-2xl font-bold transition-all relative z-10"
                                >
                                    {t('faq.contactUs')}
                                </a>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column: Accordion */}
                    <div className="lg:col-span-7">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="bg-slate-50/30 p-4 rounded-[3rem] border border-slate-100"
                        >
                            {faqItems.map((item, index) => (
                                <FAQItem
                                    key={index}
                                    question={item.question}
                                    answer={item.answer}
                                    isOpen={openIndex === index}
                                    onClick={() => setOpenIndex(index)}
                                />
                            ))}
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FAQ;
