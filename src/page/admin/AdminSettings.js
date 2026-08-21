import React, { useState, useEffect } from 'react';
import AdminNavbar from '../../components/admin/AdminNavbar';
import { getAdminSettings, updateAdminSettings } from '../../api/services';

const emptySettings = {
  dashboardTitle: '',
  dashboardSubtitle: '',
  portfolioIntroText: '',
  netAssetsIntroText: '',
  countriesIntroText: '',
  globalInvestmentValuation: {
    currency: 'USD',
    amount: 0,
    unit: 'MILLIONS',
    allocationPercent: 0,
    asAtDate: '',
    displayText: '',
  },
  yearsOfInvesting: 0,
  hero: { headline: '', subheadline: '', rotatingTags: [], ctaLabel: '' },
  companyStats: { aum: '', sectorsCount: 0, continentsCount: 0, countriesCount: 0, employeesLabel: '', portfolioCompaniesCount: 0 },
  contact: { officeAddress: '', phones: [], email: '', businessHours: '' },
  socialLinks: [],
  footerQuickLinks: [],
};

const Field = ({ label, value, onChange, type = 'text' }) => (
  <div>
    <label className="block mb-1.5 text-sm font-medium text-gray-700">{label}</label>
    {type === 'textarea' ? (
      <textarea value={value ?? ''} onChange={(e) => onChange(e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2540]" />
    ) : (
      <input type={type} value={value ?? ''} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2540]" />
    )}
  </div>
);

const SectionCard = ({ title, children }) => (
  <div className="p-6 bg-white border border-gray-200 shadow-lg rounded-xl">
    <h3 className="mb-5 text-lg font-bold text-gray-900">{title}</h3>
    <div className="space-y-4">{children}</div>
  </div>
);

// Reusable editor for arrays of { label, url } — used by socialLinks and footerQuickLinks
const LinkListEditor = ({ items, onChange }) => {
  const updateItem = (index, field, value) => {
    const next = items.slice();
    next[index] = { ...next[index], [field]: value };
    onChange(next);
  };

  const addItem = () => onChange([...items, { label: '', url: '' }]);
  const removeItem = (index) => onChange(items.filter((_, i) => i !== index));

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={index} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
          <div className="flex-1 space-y-2">
            <input
              type="text"
              placeholder="Label (e.g. Instagram, About Us)"
              value={item.label ?? ''}
              onChange={(e) => updateItem(index, 'label', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2540]"
            />
            <input
              type="text"
              placeholder="URL (e.g. https://www.instagram.com/nfholding)"
              value={item.url ?? ''}
              onChange={(e) => updateItem(index, 'url', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2540]"
            />
          </div>
          <button
            type="button"
            onClick={() => removeItem(index)}
            className="px-2 py-2 text-sm font-semibold text-red-600 hover:text-red-800"
          >
            Remove
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addItem}
        className="text-sm font-semibold text-[#0A2540] hover:text-[#003852]"
      >
        + Add link
      </button>
    </div>
  );
};

const AdminSettings = () => {
  const [form, setForm] = useState(emptySettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchSettings = async () => {
      try {
        const res = await getAdminSettings();
        if (isMounted && res?.data) {
          const d = res.data;
          setForm({
            ...emptySettings,
            ...d,
            globalInvestmentValuation: { ...emptySettings.globalInvestmentValuation, ...d.globalInvestmentValuation },
            hero: { ...emptySettings.hero, ...d.hero },
            companyStats: { ...emptySettings.companyStats, ...d.companyStats },
            contact: { ...emptySettings.contact, ...d.contact },
            socialLinks: Array.isArray(d.socialLinks) ? d.socialLinks : [],
            footerQuickLinks: Array.isArray(d.footerQuickLinks) ? d.footerQuickLinks : [],
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchSettings();
    return () => { isMounted = false; };
  }, []);

  const updateTop = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));
  const updateNested = (section, name, value) => setForm((prev) => ({ ...prev, [section]: { ...prev[section], [name]: value } }));

  const handleTagsChange = (value) => updateNested('hero', 'rotatingTags', value.split(',').map((t) => t.trim()).filter(Boolean));
  const handlePhonesChange = (value) => updateNested('contact', 'phones', value.split(',').map((t) => t.trim()).filter(Boolean));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const payload = {
        ...form,
        yearsOfInvesting: Number(form.yearsOfInvesting) || 0,
        globalInvestmentValuation: {
          ...form.globalInvestmentValuation,
          amount: Number(form.globalInvestmentValuation.amount) || 0,
          allocationPercent: Number(form.globalInvestmentValuation.allocationPercent) || 0,
        },
      };
      await updateAdminSettings(payload);
      setMessage({ type: 'success', text: 'Settings saved successfully.' });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Could not save settings.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNavbar />
        <div className="py-24 text-center text-gray-400">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
        <div className="hidden col-span-1 lg:block" />
        <div className="col-span-12 lg:col-span-10">
          <div className="px-4 pt-10 pb-8 sm:px-6 lg:px-0">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Site Settings</h1>
            <p className="mt-2 text-gray-500">Homepage hero, stats, contact details, and navigation links.</p>
          </div>

          <form onSubmit={handleSubmit} className="px-4 pb-16 space-y-6 sm:px-6 lg:px-0">

            <SectionCard title="Hero Section">
              <Field label="Headline" value={form.hero.headline} onChange={(v) => updateNested('hero', 'headline', v)} />
              <Field label="Subheadline" value={form.hero.subheadline} onChange={(v) => updateNested('hero', 'subheadline', v)} />
              <Field label="Sector Tags (comma-separated)" value={form.hero.rotatingTags?.join(', ')} onChange={handleTagsChange} />
              <Field label="Button Label" value={form.hero.ctaLabel} onChange={(v) => updateNested('hero', 'ctaLabel', v)} />
            </SectionCard>

            <SectionCard title="Company Stats">
              <Field label="AUM (e.g. 6.0 B)" value={form.companyStats.aum} onChange={(v) => updateNested('companyStats', 'aum', v)} />
              <Field label="Clusters Count" type="number" value={form.companyStats.sectorsCount} onChange={(v) => updateNested('companyStats', 'sectorsCount', Number(v))} />
              <Field label="Continents Count" type="number" value={form.companyStats.continentsCount} onChange={(v) => updateNested('companyStats', 'continentsCount', Number(v))} />
              <Field label="Countries Count" type="number" value={form.companyStats.countriesCount} onChange={(v) => updateNested('companyStats', 'countriesCount', Number(v))} />
              <Field label="Employees Label (e.g. 20k)" value={form.companyStats.employeesLabel} onChange={(v) => updateNested('companyStats', 'employeesLabel', v)} />
              <Field label="Portfolio Companies Count" type="number" value={form.companyStats.portfolioCompaniesCount} onChange={(v) => updateNested('companyStats', 'portfolioCompaniesCount', Number(v))} />
            </SectionCard>

            <SectionCard title="Global Investment Valuation">
              <Field label="Currency (e.g. USD)" value={form.globalInvestmentValuation.currency} onChange={(v) => updateNested('globalInvestmentValuation', 'currency', v)} />
              <Field label="Amount" type="number" value={form.globalInvestmentValuation.amount} onChange={(v) => updateNested('globalInvestmentValuation', 'amount', v)} />
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700">Unit</label>
                <select
                  value={form.globalInvestmentValuation.unit}
                  onChange={(e) => updateNested('globalInvestmentValuation', 'unit', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2540]"
                >
                  <option value="THOUSANDS">Thousands</option>
                  <option value="MILLIONS">Millions</option>
                  <option value="BILLIONS">Billions</option>
                </select>
              </div>
              <Field label="Allocation Percent" type="number" value={form.globalInvestmentValuation.allocationPercent} onChange={(v) => updateNested('globalInvestmentValuation', 'allocationPercent', v)} />
              <Field label="As At Date" type="date" value={form.globalInvestmentValuation.asAtDate} onChange={(v) => updateNested('globalInvestmentValuation', 'asAtDate', v)} />
              <Field label="Display Text (e.g. $1000 M)" value={form.globalInvestmentValuation.displayText} onChange={(v) => updateNested('globalInvestmentValuation', 'displayText', v)} />
            </SectionCard>

            <SectionCard title="Contact Details">
              <Field label="Office Address" type="textarea" value={form.contact.officeAddress} onChange={(v) => updateNested('contact', 'officeAddress', v)} />
              <Field label="Phone Numbers (comma-separated)" value={form.contact.phones?.join(', ')} onChange={handlePhonesChange} />
              <Field label="Email" value={form.contact.email} onChange={(v) => updateNested('contact', 'email', v)} />
              <Field label="Business Hours" value={form.contact.businessHours} onChange={(v) => updateNested('contact', 'businessHours', v)} />
            </SectionCard>

            <SectionCard title="Social Links">
              <LinkListEditor items={form.socialLinks} onChange={(next) => updateTop('socialLinks', next)} />
            </SectionCard>

            <SectionCard title="Footer Quick Links">
              <LinkListEditor items={form.footerQuickLinks} onChange={(next) => updateTop('footerQuickLinks', next)} />
            </SectionCard>

            <SectionCard title="Page Introductions">
              <Field label="Dashboard Title" value={form.dashboardTitle} onChange={(v) => updateTop('dashboardTitle', v)} />
              <Field label="Dashboard Subtitle" value={form.dashboardSubtitle} onChange={(v) => updateTop('dashboardSubtitle', v)} />
              <Field label="Portfolio Intro Text" type="textarea" value={form.portfolioIntroText} onChange={(v) => updateTop('portfolioIntroText', v)} />
              <Field label="Net Assets Intro Text" type="textarea" value={form.netAssetsIntroText} onChange={(v) => updateTop('netAssetsIntroText', v)} />
              <Field label="Countries Intro Text" type="textarea" value={form.countriesIntroText} onChange={(v) => updateTop('countriesIntroText', v)} />
              <Field label="Years of Investing" type="number" value={form.yearsOfInvesting} onChange={(v) => updateTop('yearsOfInvesting', v)} />
            </SectionCard>

            {message && (
              <p className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{message.text}</p>
            )}

            <button type="submit" disabled={saving} className="bg-[#0A2540] hover:bg-[#003852] text-white font-semibold px-6 py-3 rounded-lg transition-colors disabled:opacity-60">
              {saving ? 'Saving…' : 'Save All Settings'}
            </button>
          </form>
        </div>
        <div className="hidden col-span-1 lg:block" />
      </div>
    </div>
  );
};

export default AdminSettings;