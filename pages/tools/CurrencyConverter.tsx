import React, { useState, useEffect } from 'react';
import { RefreshCw, ArrowRightLeft, TrendingUp, ArrowLeft, ChevronDown, Coins, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const currencies = [
  // ... (keep the same currencies array)
  { code: 'USD', name: 'Dólar Americano', flag: '🇺🇸' },
  { code: 'BRL', name: 'Real Brasileiro', flag: '🇧🇷' },
  { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', name: 'Libra Esterlina', flag: '🇬🇧' },
  { code: 'JPY', name: 'Iene Japonês', flag: '🇯🇵' },
  { code: 'AUD', name: 'Dólar Australiano', flag: '🇦🇺' },
  { code: 'CAD', name: 'Dólar Canadense', flag: '🇨🇦' },
  { code: 'CHF', name: 'Franco Suíço', flag: '🇨🇭' },
  { code: 'CNY', name: 'Yuan Chinês', flag: '🇨🇳' },
  { code: 'AED', name: 'Dirham dos Emirados Árabes', flag: '🇦🇪' },
  { code: 'BGN', name: 'Lev Búlgaro', flag: '🇧🇬' },
  { code: 'CZK', name: 'Coroa Checa', flag: '🇨🇿' },
  { code: 'DKK', name: 'Coroa Dinamarquesa', flag: '🇩🇰' },
  { code: 'HKD', name: 'Dólar de Hong Kong', flag: '🇭🇰' },
  { code: 'HRK', name: 'Kuna Croata', flag: '🇭🇷' },
  { code: 'HUF', name: 'Forint Húngaro', flag: '🇭🇺' },
  { code: 'IDR', name: 'Rupia Indonésia', flag: '🇮🇩' },
  { code: 'ILS', name: 'Novo Shekel Israelense', flag: '🇮🇱' },
  { code: 'INR', name: 'Rúpia Indiana', flag: '🇮🇳' },
  { code: 'ISK', name: 'Coroa Islandesa', flag: '🇮🇸' },
  { code: 'KRW', name: 'Won Sul-Coreano', flag: '🇰🇷' },
  { code: 'MXN', name: 'Peso Mexicano', flag: '🇲🇽' },
  { code: 'MYR', name: 'Ringgit Malaio', flag: '🇲🇾' },
  { code: 'NOK', name: 'Coroa Norueguesa', flag: '🇳🇴' },
  { code: 'NZD', name: 'Dólar Neozelandês', flag: '🇳🇿' },
  { code: 'PHP', name: 'Peso Filipino', flag: '🇵🇭' },
  { code: 'PLN', name: 'Zloty Polonês', flag: '🇵🇱' },
  { code: 'RON', name: 'Leu Romeno', flag: '🇷🇴' },
  { code: 'RUB', name: 'Rublo Russo', flag: '🇷🇺' },
  { code: 'SEK', name: 'Coroa Sueca', flag: '🇸🇪' },
  { code: 'SGD', name: 'Dólar de Cingapura', flag: '🇸🇬' },
  { code: 'THB', name: 'Baht Tailandês', flag: '🇹🇭' },
  { code: 'TRY', name: 'Lira Turca', flag: '🇹🇷' },
].sort((a, b) => a.name.localeCompare(b.name));

const CurrencyConverter: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar' || i18n.language === 'he';
  const [amount, setAmount] = useState<number>(1);
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('BRL');
  const [rate, setRate] = useState<number | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const fetchRate = async () => {
    setLoading(true);
    try {
      const response = await fetch(`https://open.er-api.com/v6/latest/${from}`);
      const data = await response.json();
      if (data && data.rates && data.rates[to]) {
        setRate(data.rates[to]);

        // Format update time
        const date = new Date(data.time_last_update_unix * 1000);
        setLastUpdate(date.toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' }));
      }
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRate();
  }, [from, to]);

  const swapCurrencies = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  return (
    <div className={`min-h-screen bg-slate-50 pt-16 pb-16 px-4 ${isRtl ? 'font-hebrew' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/ferramentas"
            className={`inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold transition-colors mb-4 group ${isRtl ? 'flex-row-reverse' : ''}`}
          >
            <ArrowLeft size={18} className={`${isRtl ? 'rotate-180' : ''} group-hover:-translate-x-1 transition-transform`} />
            {t('placeholder.back')}
          </Link>
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-indigo-100 rounded-2xl text-indigo-600 shadow-sm">
              <RefreshCw size={32} />
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">{t('currency.title')}</h1>
          </div>
          <p className={`text-slate-600 text-lg ${isRtl ? 'mr-[72px]' : 'ml-[72px]'}`}>
            {t('currency.subtitle')}
          </p>
        </div>

        <div className="bg-white p-6 md:p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-end">
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">{t('currency.amount')}</label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full h-16 px-6 rounded-2xl border-2 border-slate-100 text-2xl font-bold focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all"
                  placeholder="0.00"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-lg">
                  {from}
                </div>
              </div>
            </div>

            <div className="flex justify-center pb-1">
              <button
                onClick={swapCurrencies}
                className="h-14 w-14 bg-slate-50 rounded-2xl flex items-center justify-center border-2 border-slate-100 hover:border-indigo-200 hover:bg-white hover:shadow-lg hover:shadow-indigo-100 hover:-rotate-180 transition-all duration-500 group"
              >
                <ArrowRightLeft className="text-indigo-600 w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">{t('currency.from')}</label>
                <div className="relative group/select">
                  <select
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className="w-full h-16 pl-4 pr-10 rounded-2xl border-2 border-slate-100 font-bold text-slate-700 bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none appearance-none transition-all cursor-pointer"
                  >
                    {currencies.map(c => (
                      <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/select:text-indigo-500 pointer-events-none transition-colors" size={20} />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">{t('currency.to')}</label>
                <div className="relative group/select">
                  <select
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="w-full h-16 pl-4 pr-10 rounded-2xl border-2 border-slate-100 font-bold text-slate-700 bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none appearance-none transition-all cursor-pointer"
                  >
                    {currencies.map(c => (
                      <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/select:text-indigo-500 pointer-events-none transition-colors" size={20} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 p-10 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[32px] text-white text-center relative overflow-hidden shadow-2xl shadow-indigo-200">
            <TrendingUp className="absolute top-0 right-0 opacity-10 w-64 h-64 -mr-16 -mt-16" />
            <p className="text-indigo-100 text-lg font-medium mb-3 opacity-90">{t('currency.result', { amount, from })}</p>
            {loading ? (
              <div className="h-16 flex items-center justify-center">
                <Loader2 className="animate-spin w-12 h-12 text-white/50" />
              </div>
            ) : (
              <div className="space-y-1">
                <h2 className="text-5xl md:text-6xl font-black tracking-tighter animate-in fade-in zoom-in duration-500">
                  {(amount * (rate || 0)).toLocaleString(i18n.language === 'pt' ? 'pt-BR' : i18n.language, {
                    style: 'currency',
                    currency: to,
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </h2>
                <div className="pt-4 flex items-center justify-center gap-2 text-indigo-100/70 text-sm font-bold bg-white/10 w-fit mx-auto px-4 py-1.5 rounded-full">
                  1 {from} = {rate?.toFixed(4)} {to}
                </div>
              </div>
            )}
            <p className="mt-6 text-indigo-200/60 text-xs font-bold uppercase tracking-widest">
              {t('currency.update')} • {lastUpdate || '--:--'}
            </p>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto pb-12">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md group">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <TrendingUp size={24} />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">{t('currency.features.rates.title')}</h3>
            <p className="text-slate-500 text-sm leading-relaxed font-medium">{t('currency.features.rates.desc')}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md group">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Coins size={24} />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">{t('currency.features.global.title')}</h3>
            <p className="text-slate-500 text-sm leading-relaxed font-medium">{t('currency.features.global.desc')}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md group">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Zap size={24} />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">{t('currency.features.speed.title')}</h3>
            <p className="text-slate-500 text-sm leading-relaxed font-medium">{t('currency.features.speed.desc')}</p>
          </div>
        </div>

        <div className="mt-8 bg-slate-100/50 p-6 rounded-2xl border border-slate-200 text-center text-slate-500 text-sm leading-relaxed">
          <AlertCircle className="inline-block mr-2 mb-0.5" size={16} />
          {t('currency.note')}
        </div>
      </div>
    </div>
  );
};

const Loader2 = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
);

const AlertCircle = ({ className, size }: { className?: string, size?: number }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
);

export default CurrencyConverter;
