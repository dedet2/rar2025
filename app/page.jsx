'use client';
import { useMemo, useState, useEffect } from 'react';
import TimeBox from '../components/TimeBox';

const CAMPAIGN = 'rar_earlybird_2025';
const SITE_URL = typeof window !== 'undefined'
  ? window.location.origin
  : (process.env.NEXT_PUBLIC_SITE_URL || 'https://rest-as-resistance.vercel.app');

function withUTM(url, source='website', medium='site', content='primary_cta') {
  const u = new URL(url, SITE_URL);
  u.searchParams.set('utm_source', source);
  u.searchParams.set('utm_medium', medium);
  u.searchParams.set('utm_campaign', CAMPAIGN);
  u.searchParams.set('utm_content', content);
  return u.toString();
}

function podiaCheckoutUrl(content='checkout_cta') {
  const base = process.env.NEXT_PUBLIC_PODIA_BASE_URL || '#';
  try {
    const u = new URL(base);
    u.searchParams.set('utm_source', 'website');
    u.searchParams.set('utm_medium', 'site');
    u.searchParams.set('utm_campaign', CAMPAIGN);
    u.searchParams.set('utm_content', content);
    return u.toString();
  } catch { return '#'; }
}

function getTimeLeft(d) {
  const t = Math.max(0, d.getTime() - Date.now());
  return {
    days: Math.floor(t / 86400000),
    hours: Math.floor((t / 3600000) % 24),
    minutes: Math.floor((t / 60000) % 60),
    seconds: Math.floor((t / 1000) % 60),
  };
}

export default function Page() {
  const earlyBirdEnd = useMemo(() => new Date('2025-09-16T06:59:59.000Z'), []);
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(earlyBirdEnd));
  useEffect(() => { const id = setInterval(() => setTimeLeft(getTimeLeft(earlyBirdEnd)), 1000); return () => clearInterval(id); }, [earlyBirdEnd]);
  const isEarlyBird = Date.now() < earlyBirdEnd.getTime();

  const BASE = { t1: 7900, t2: 10500, t3: 12900 };
  const EB = { t1: -300, t2: -400, t3: -500 };
  const prices = {
    t1: BASE.t1 + (isEarlyBird ? EB.t1 : 0),
    t2: BASE.t2 + (isEarlyBird ? EB.t2 : 0),
    t3: BASE.t3 + (isEarlyBird ? EB.t3 : 0),
  };

  const [selectedTier, setSelectedTier] = useState('t2');
  const [form, setForm] = useState({ name: '', email: '' });

  async function submitForm(e) {
    e.preventDefault();
    try {
      const res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, tier: selectedTier }),
      });
      if (!res.ok) throw new Error('Network');
      alert('Thanks! We received your inquiry and will email you shortly.');
    } catch {
      const subject = encodeURIComponent('RAR Japan Inquiry — ' + selectedTier);
      const body = encodeURIComponent('Name: ' + form.name + '\nEmail: ' + form.email);
      const email = (process.env.EMAIL_CONTACT || 'info@incluu.us');
      window.location.href = 'mailto:' + email + '?subject=' + subject + '&body=' + body;
    }
  }

  return (
    <div className="min-h-screen w-full">
      <header className="sticky top-0 z-30 backdrop-blur bg-black/30 border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-brand-purple to-brand-gold" />
            <span className="font-semibold tracking-wide">Rest as Resistance — Japan 2025</span>
          </div>
          <a href={withUTM('#reserve','website','nav','reserve_nav')} className="btn-outline text-sm">Reserve Your Spot</a>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0" aria-hidden>
          <img src="https://images.unsplash.com/photo-1470115636492-6d2b56f9146e?q=80&w=1600&auto=format&fit=crop" alt="Misty forest" className="h-full w-full object-cover opacity-30" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 lg:py-36">
          <div className="max-w-3xl">
            <p className="uppercase tracking-widest text-xs text-white/70 mb-3">Dec 8–17, 2025 • Tokyo • Kamakura • Beppu • Miyajima</p>
            <h1 className="text-4xl md:text-6xl font-semibold leading-[1.1]">Rest as Resistance<span className="block text-white/80">A Luxury Healing Journey in Japan</span></h1>
            <p className="mt-6 text-lg text-white/80">For Black women reclaiming rest as a right. Slow mornings, onsen rituals, forest bathing, and ryokan care—crafted for deep restoration, community, and liberation.</p>
            <div className="mt-6 text-sm text-white/80 space-x-3">
              <span className="badge"><span className="inline-block h-2 w-2 rounded-full bg-emerald-400" /> Only 6 client spots</span>
              <span className="badge"><span className="inline-block h-2 w-2 rounded-full bg-brand-gold" /> White-glove concierge</span>
              <span className="badge"><span className="inline-block h-2 w-2 rounded-full bg-blue-400" /> Early-Bird ends Sept 15</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-6 border-y border-white/10 bg-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 flex-wrap">
          <div className="text-sm">
            {isEarlyBird ? <span><span className="font-semibold">Early-Bird Pricing active</span> — prices increase Sept 16.</span>
                          : <span><span className="font-semibold">Early-Bird ended</span> — current pricing in effect.</span>}
          </div>
          <div className="flex gap-3 text-center">
            <TimeBox label="Days" value={timeLeft.days} />
            <TimeBox label="Hours" value={timeLeft.hours} />
            <TimeBox label="Minutes" value={timeLeft.minutes} />
            <TimeBox label="Seconds" value={timeLeft.seconds} />
          </div>
        </div>
      </section>

      <section id="reserve" className="py-16 border-t border-white/10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <h2 className="text-3xl font-semibold">Reserve Your Spot</h2>
            <form onSubmit={submitForm} className="space-y-4 mt-6">
              <div>
                <label className="block text-sm text-white/80">Selected Tier</label>
                <select value={selectedTier} onChange={(e)=>setSelectedTier(e.target.value)} className="mt-1 w-full rounded-xl bg-black/30 border border-white/20 px-4 py-3">
                  <option value="t1">Tier 1 – Essential — ${prices.t1.toLocaleString()}</option>
                  <option value="t2">Tier 2 – Private Indulgence — ${prices.t2.toLocaleString()}</option>
                  <option value="t3">Tier 3 – VIP Sanctuary — ${prices.t3.toLocaleString()}</option>
                </select>
              </div>
              <div><label className="block text-sm text-white/80">Full Name</label>
                <input required value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} className="mt-1 w-full rounded-xl bg-black/30 border border-white/20 px-4 py-3" />
              </div>
              <div><label className="block text-sm text-white/80">Email</label>
                <input type="email" required value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} className="mt-1 w-full rounded-xl bg-black/30 border border-white/20 px-4 py-3" />
              </div>
              <button type="submit" className="w-full btn-primary">Send Inquiry</button>
              <a href={podiaCheckoutUrl('podia_deposit_button')} target="_blank" rel="noreferrer" className="block text-center rounded-2xl border border-brand-gold text-brand-gold px-4 py-3 font-semibold hover:bg-brand-gold/10 mt-2">
                Or Proceed to Secure Deposit (Podia)
              </a>
            </form>
          </div>
        </div>
      </section>

      <footer className="py-10 border-t border-white/10 text-center text-white/70">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Rest as Resistance • A Dr. Dédé Healing Journey</p>
        </div>
      </footer>
    </div>
  );
}
