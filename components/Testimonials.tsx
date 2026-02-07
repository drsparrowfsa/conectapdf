import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Testimonials: React.FC = () => {
    const { t } = useTranslation();

    // Get the list of testimonials from translations
    // i18next returns an array if we use returnObjects: true
    const testimonials = t('testimonials.list', { returnObjects: true }) as Array<{
        name: string;
        role: string;
        company: string;
        quote: string;
        date: string;
    }>;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: "easeOut"
            }
        }
    };

    return (
        <section className="py-24 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: -20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight"
                    >
                        {t('testimonials.title')}
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto"
                    >
                        {t('testimonials.subtitle')}
                    </motion.p>
                </div>

                {/* Business Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-20 max-w-5xl mx-auto">
                    {['users', 'pdfs', 'rating'].map((key, idx) => (
                        <motion.div
                            key={key}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-slate-50 border border-slate-200 rounded-3xl p-8 text-center hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300"
                        >
                            <div className="text-4xl md:text-5xl font-black text-indigo-600 mb-2">
                                {t(`testimonials.stats.${key}.value`)}
                            </div>
                            <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                                {t(`testimonials.stats.${key}.label`)}
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-8"
                >
                    {Array.isArray(testimonials) && testimonials.map((testimonial, index) => (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                            className="relative group h-full"
                        >
                            <div className="h-full bg-slate-50 rounded-[2.5rem] p-10 border border-slate-100 hover:bg-white hover:border-indigo-100 transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2 flex flex-col">
                                <div className="flex items-center gap-5 mb-8">
                                    <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-300">
                                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-slate-900 leading-tight mb-1">{testimonial.name}</h4>
                                        <p className="text-sm text-indigo-600 font-bold">{testimonial.role}</p>
                                        <p className="text-xs text-slate-400 font-semibold mt-0.5 uppercase tracking-wide">{testimonial.company}</p>
                                    </div>
                                </div>

                                <div className="flex gap-1 mb-6">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={18} className="fill-amber-400 text-amber-400" />
                                    ))}
                                </div>

                                <div className="relative flex-grow">
                                    <Quote className="absolute -top-4 -left-2 text-indigo-100 h-12 w-12 -z-10 opacity-50" />
                                    <p className="text-lg text-slate-600 leading-relaxed font-medium relative z-0">
                                        "{testimonial.quote}"
                                    </p>
                                </div>

                                <div className="mt-8 pt-6 border-t border-slate-200/60 flex justify-between items-center bg-transparent">
                                    <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">Verified User</span>
                                    <span className="text-xs font-semibold text-slate-400">{testimonial.date}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default Testimonials;
