import React, { useState, useEffect, createContext, useContext } from 'react';
import { ChevronDown } from 'lucide-react';

const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'USD' },
  { code: 'EUR', symbol: '€', label: 'EUR' },
  { code: 'GBP', symbol: '£', label: 'GBP' },
  { code: 'JPY', symbol: '¥', label: 'JPY' },
  { code: 'AED', symbol: 'د.إ', label: 'AED' },
];

export const CurrencyContext = createContext({
  currency: 'USD',
  symbol: '$',
  rate: 1,
  convert: (usd) => usd,
  format: (usd) => `$${usd.toFixed(2)}`,
  setCurrency: () => {},
});

export function CurrencyProvider({ children }) {
  const [currency, setCurrencyState] = useState(() => localStorage.getItem('wg_currency') || 'USD');
  const [rates, setRates] = useState({ USD: 1 });

  useEffect(() => {
    fetch('https://api.exchangerate-api.com/v4/latest/USD')
      .then(r => r.json())
      .then(d => setRates(d.rates || { USD: 1 }))
      .catch(() => {});
  }, []);

  const setCurrency = (code) => {
    setCurrencyState(code);
    localStorage.setItem('wg_currency', code);
  };

  const rate = rates[currency] || 1;
  const symbol = CURRENCIES.find(c => c.code === currency)?.symbol || '$';

  const convert = (usdAmount) => usdAmount * rate;
  const format = (usdAmount) => {
    const converted = usdAmount * rate;
    if (currency === 'JPY') return `${symbol}${Math.round(converted).toLocaleString()}`;
    return `${symbol}${converted.toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, symbol, rate, convert, format, setCurrency, currencies: CURRENCIES }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}

export default function CurrencySelector({ compact = false }) {
  const { currency, setCurrency, currencies } = useCurrency();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 cursor-hover meta-text text-[10px] px-3 py-1.5 transition-all"
        style={{
          border: '1px solid rgba(0,245,255,0.2)',
          color: 'var(--neon-cyan)',
          background: 'rgba(0,245,255,0.04)',
        }}
      >
        {currency}
        <ChevronDown size={10} style={{ opacity: 0.6 }} />
      </button>
      {open && (
        <div
          className="absolute right-0 top-full mt-1 z-50 min-w-[80px]"
          style={{ background: 'var(--metal-mid)', border: '1px solid rgba(0,245,255,0.2)', boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}
        >
          {currencies.map(c => (
            <button
              key={c.code}
              onClick={() => { setCurrency(c.code); setOpen(false); }}
              className="w-full text-left px-4 py-2.5 meta-text text-[10px] cursor-hover transition-colors"
              style={{
                color: c.code === currency ? 'var(--neon-cyan)' : 'rgba(245,245,247,0.6)',
                background: c.code === currency ? 'rgba(0,245,255,0.07)' : 'transparent',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,245,255,0.06)'}
              onMouseLeave={e => e.currentTarget.style.background = c.code === currency ? 'rgba(0,245,255,0.07)' : 'transparent'}
            >
              {c.code} {c.symbol}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}