/* build: v1 */
'use client';
import React, { useMemo, useState, useEffect } from 'react';
import TimeBox from '../components/TimeBox';

const CAMPAIGN = 'rar_earlybird_2025';
const SITE_URL = typeof window !== 'undefined'
  ? window.location.origin
  : (process.env.NEXT_PUBLIC_SITE_URL || 'https://rest-as-resistance.vercel.app');

function withUTM(url: string, source='website', medium='site', content='primary_cta') {
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
function getTimeLeft(d: Date) {
  const t = Math.max(0, d.getTime() - Date.now());
  return {
    days: Math.floor(t / 86400000),
    hours: Math.floor((t / 3600000) % 24),
    minutes: Math.floor((t / 60000) % 60),
    seconds: Math.floor((t / 1000) % 60),
  };
}

export default function Page() {
  // Early‑bird ends Sept 15, 2025 11:59 PM PT (06:59:59 UTC Sept 16)
  const earlyBirdEnd = useMemo(() => new Date('2025-09-16T06:59:59.000Z'), []);
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(earlyBirdEnd));
  useEffect(() => { const id = setInterval(() => setTimeLeft(getTimeLeft(earlyBirdEnd)), 1000); return () => clearInterval(id); }, [earlyBirdEnd]);
  const isEarlyBird = Date.now() < earlyBirdEnd.getTime();

  // Fast‑action bonus (per‑visitor 72h)
  const [fabLeft, setFabLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const key = 'rar_fab_start';
    let start = localStorage.getItem(key);
    if (!start) { start = String(Date.now()); localStorage.setItem(key, start); }
    const end = parseInt(start, 10) + 72 * 60 * 60 * 1000;
    const tick = () => {
      const t = Math.max(0, end - Date.now());
      setFabLeft({
        days: Math.floor(t / 86400000),
        hours: Math.floor((t / 3600000) % 24),
        minutes: Math.floor((t / 60000) % 60),
        seconds: Math.floor((t / 1000) % 60),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Pricing
  const BASE = { t1: 7900, t2: 10500, t3: 12900 };
  const EB = { t1: -300, t2: -400, t3: -500 };
  const prices = {
    t1: BASE.t1 + (isEarlyBird ? EB.t1 : 0),
    t2: BASE.t2 + (isEarlyBird ? EB.t2 : 0),
    t3: BASE.t3 + (isEarlyBird ? EB.t3 : 0),
  };

  const [selectedTier, setSelectedTier] = useState<'t1'|'t2'|'t3'>('t2');
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [form, setForm] = useState({ name: '', email: '', phone: '', notes: '' });

  const ADDONS = [
    { key: 't1_private_room', label: 'Private Room Upgrade (Essential)', price: 1200, tiers: ['t1'] },
    { key: 't2_private_room', label: 'Private Room Upgrade (Private Indulgence)', price: 900, tiers: ['t2'] },
    { key: 't3_culinary', label: 'Luxury Culinary Night (VIP)', price: 800, tiers: ['t3'] },
    { key: 'airfare', label: 'Round‑Trip Airfare (estimate)', price: 1800, tiers: ['t1','t2','t3'] },
    { key: 'post_trip_coaching', label: 'Post‑Trip Integration Coaching (3 sessions)', price: 600, tiers: ['t1','t2','t3'] },
    { key: 'pair_discount', label: 'Bring a Friend / Daughter (pair credit)', price: -300, tiers: ['t1','t2','t3'] },
  ];
  function addOnsForTier(tier: 't1'|'t2'|'t3') { return ADDONS.filter(a => a.tiers.includes(tier)); }
  function addOnTotal(tier: 't1'|'t2'|'t3') {
    return addOnsForTier(tier).filter(a => selectedAddOns.includes(a.key)).reduce((s,a)=>s+a.price,0);
  }

  async function submitForm(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, tier: selectedTier, addOns: selectedAddOns }),
      });
      if (!res.ok) throw new Error('Network');
      alert('Thanks! We received your inquiry and will email you shortly.');
    } catch {
      // fallback mailto WITHOUT backticks
      const subject = encodeURIComponent('RAR Japan Inquiry — ' + selectedTier);
      const body = encodeURIComponent(
        'Name: ' + form.name + '\n' +
        'Email: ' + form.email + '\n' +
        'Phone: ' + form.phone + '\n' +
        'AddOns: ' + selectedAddOns.join(', ') + '\n' +
        'Notes: ' + form.notes
      );
      const email = (process.env.EMAIL_CONTACT || 'info@incluu.us');
      window.location.href = 'mailto:' + email + '?subject=' + subject + '&body=' + body;
    }
  }

  const podiaURL = podiaCheckoutUrl('podia_deposit_button');

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

      {/* Hero */}
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
              <span className="badge"><span className="inline-block h-2 w-2 rounded-full bg-brand-gold" /> White‑glove concierge</span>
              <span className="badge"><span className="inline-block h-2 w-2 rounded-full bg-blue-400" /> Early‑Bird ends Sept 15</span>
            </div>
          </div>
        </div>
      </section>

      {/* Early‑Bird strip */}
      <section className="py-6 border-y border-white/10 bg-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 flex-wrap">
          <div className="text-sm">
            {isEarlyBird ? <span><span className="font-semibold">Early‑Bird Pricing active</span> — prices increase Sept 16.</span>
                          : <span><span className="font-semibold">Early‑Bird ended</span> — current pricing in effect.</span>}
          </div>
          <div className="flex gap-3 text-center">
            <TimeBox label="Days" value={timeLeft.days} />
            <TimeBox label="Hours" value={timeLeft.hours} />
            <TimeBox label="Minutes" value={timeLeft.minutes} />
            <TimeBox label="Seconds" value={timeLeft.seconds} />
          </div>
        </div>
      </section>

      {/* Reserve (shortened) */}
      <section id="reserve" className="py-16 border-t border-white/10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <h2 className="text-3xl font-semibold">Reserve Your Spot</h2>
            <p className="text-white/70 mt-2">Two Kamakura nights are at Sakura‑Sakura — an intimate heritage home with only three rooms reserved entirely for our group.</p>

            <form onSubmit={submitForm} className="space-y-4 mt-6">
              <div>
                <label className="block text-sm text-white/80">Selected Tier</label>
                <select
                  value={selectedTier}
                  onChange={(e) => setSelectedTier(e.target.value as 't1'|'t2'|'t3')}
                  className="mt-1 w-full rounded-xl bg-black/30 border border-white/20 px-4 py-3"
                >
                  <option value="t1">Tier 1 – Essential — ${prices.t1.toLocaleString()}</option>
                  <option value="t2">Tier 2 – Private Indulgence — ${prices.t2.toLocaleString()}</option>
                  <option value="t3">Tier 3 – VIP Sanctuary — ${prices.t3.toLocaleString()}</option>
                </select>
              </div>

              <div className="rounded-2xl border border-white/10 p-4 bg-black/20">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">Estimated Total</div>
                  <div className="text-2xl font-bold">${prices[selectedTier].toLocaleString()}</div>
                </div>
                <div className="text-xs text-white/60 mt-1">Airfare is estimated and finalized upon booking if selected.</div>
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
