import React, { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, RefreshCw, Upload, X } from 'lucide-react';
import AdminNavbar from '../../components/admin/AdminNavbar';
import { useAuth } from '../../context/AuthContext';
import {
  getAdminSettings,
  updateAdminSettings,
  getAdminUsdKesRates,
  uploadFile,
} from '../../api/services';
import { VALUATION_UNITS, CURRENCY_OPTIONS } from '../../utils/valuation';

const WRITE_ROLES = ['SUPER_ADMIN', 'ADMIN'];

// Shape used only to keep every input CONTROLLED. The saved payload is always the
// full state object (README §8.4: PUT replaces the whole document), so anything the
// GET returned that has no input here still round-trips untouched.
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
  yearEstablished: '',
  chairmanName: '',
  chairmanImage: '',
  chairmanMessage: '',
  usdToLocalCurrencyRateId: '',
  hero: { headline: '', subheadline: '', rotatingTags: [], ctaLabel: '' },
  companyStats: { totalPortfolio: '', sectorsCount: 0, continentsCount: 0, countriesCount: 0, employeesLabel: '', portfolioCompaniesCount: 0 },
  contact: { officeAddress: '', phones: [], email: '', businessHours: '' },
  socialLinks: [],
  footerQuickLinks: [],
};

// Merges the API document over the controlled-input defaults without dropping any
// field the server sent (unknown keys stay on the object and go back on save).
const hydrate = (d) => ({
  ...emptySettings,
  ...d,
  yearEstablished: d?.yearEstablished ?? '',
  chairmanName: d?.chairmanName ?? '',
  chairmanImage: d?.chairmanImage ?? '',
  chairmanMessage: d?.chairmanMessage ?? '',
  usdToLocalCurrencyRateId: d?.usdToLocalCurrencyRateId ?? '',
  globalInvestmentValuation: {
    ...emptySettings.globalInvestmentValuation,
    ...d?.globalInvestmentValuation,
    asAtDate: d?.globalInvestmentValuation?.asAtDate ?? '',
  },
  hero: { ...emptySettings.hero, ...d?.hero, rotatingTags: Array.isArray(d?.hero?.rotatingTags) ? d.hero.rotatingTags : [] },
  companyStats: { ...emptySettings.companyStats, ...d?.companyStats },
  contact: { ...emptySettings.contact, ...d?.contact, phones: Array.isArray(d?.contact?.phones) ? d.contact.phones : [] },
  socialLinks: Array.isArray(d?.socialLinks) ? d.socialLinks : [],
  footerQuickLinks: Array.isArray(d?.footerQuickLinks) ? d.footerQuickLinks : [],
});

const inputClass =
  'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2540] disabled:bg-gray-100 disabled:text-gray-500';

const Field = ({ label, value, onChange, type = 'text', disabled, help, ...rest }) => (
  <div>
    <label className="block mb-1.5 text-sm font-medium text-gray-700">{label}</label>
    {type === 'textarea' ? (
      <textarea
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        rows={4}
        className={inputClass}
        {...rest}
      />
    ) : (
      <input
        type={type}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={inputClass}
        {...rest}
      />
    )}
    {help && <p className="mt-1 text-xs text-gray-400">{help}</p>}
  </div>
);

const SelectField = ({ label, value, onChange, options, disabled, help, placeholder }) => (
  <div>
    <label className="block mb-1.5 text-sm font-medium text-gray-700">{label}</label>
    <select value={value ?? ''} onChange={(e) => onChange(e.target.value)} disabled={disabled} className={inputClass}>
      {placeholder !== undefined && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
    {help && <p className="mt-1 text-xs text-gray-400">{help}</p>}
  </div>
);

// Upload field: POST /api/admin/uploads, then keep the returned `url` as the value.
const UploadField = ({ label, value, onChange, folder, disabled }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const envelope = await uploadFile({ file, folder });
      if (envelope?.success === false) {
        setUploadError(envelope?.message || 'Upload failed.');
        return;
      }
      const url = envelope?.data?.url;
      if (!url) {
        setUploadError('Upload succeeded but no URL was returned.');
        return;
      }
      onChange(url);
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="block mb-1.5 text-sm font-medium text-gray-700">{label}</label>
      {value ? (
        <div className="flex items-center gap-3 p-3 mb-2 border border-gray-200 rounded-lg bg-gray-50">
          <img src={value} alt="" className="object-cover w-12 h-12 rounded-lg bg-gray-200" />
          <span className="flex-1 text-xs text-gray-500 break-all">{value}</span>
          {!disabled && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="p-1.5 text-gray-400 rounded-lg hover:text-red-600 hover:bg-red-50"
              title="Remove image"
            >
              <X size={16} />
            </button>
          )}
        </div>
      ) : null}
      {!disabled && (
        <label className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#0A2540] hover:bg-[#003852] rounded-lg cursor-pointer transition-colors">
          <Upload size={16} />
          {uploading ? 'Uploading…' : value ? 'Replace image' : 'Upload image'}
          <input type="file" accept="image/*" onChange={handleFile} disabled={uploading} className="hidden" />
        </label>
      )}
      <p className="mt-1 text-xs text-gray-400">JPG or PNG, up to 5 MB.</p>
      {uploadError && <p className="mt-1 text-xs text-red-600">{uploadError}</p>}
    </div>
  );
};

const SectionCard = ({ title, note, children }) => (
  <div className="p-6 bg-white border border-gray-200 shadow-lg rounded-xl">
    <h3 className="text-lg font-bold text-gray-900">{title}</h3>
    {note && <p className="mt-1 mb-4 text-sm text-gray-500">{note}</p>}
    <div className={`space-y-4 ${note ? '' : 'mt-5'}`}>{children}</div>
  </div>
);

// Reusable editor for arrays of { label, url } — used by socialLinks and footerQuickLinks
const LinkListEditor = ({ items, onChange, disabled }) => {
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
              disabled={disabled}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2540] disabled:bg-gray-100 disabled:text-gray-500"
            />
            <input
              type="text"
              placeholder="URL (e.g. https://www.instagram.com/nfholding)"
              value={item.url ?? ''}
              onChange={(e) => updateItem(index, 'url', e.target.value)}
              disabled={disabled}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2540] disabled:bg-gray-100 disabled:text-gray-500"
            />
          </div>
          {!disabled && (
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="px-2 py-2 text-sm font-semibold text-red-600 hover:text-red-800"
            >
              Remove
            </button>
          )}
        </div>
      ))}

      {!disabled && (
        <button type="button" onClick={addItem} className="text-sm font-semibold text-[#0A2540] hover:text-[#003852]">
          + Add link
        </button>
      )}
    </div>
  );
};

// The backend accepts more currencies/units than the two option lists offer
// (EUR/XAF/RWF, TRILLIONS). Keep whatever is stored selectable so a save never
// silently rewrites it.
const withCurrent = (options, value) =>
  value && !options.some((o) => o.value === value) ? [{ value, label: value }, ...options] : options;

const toNumberOrOmit = (value) => {
  if (value === '' || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
};

const AdminSettings = () => {
  const { userRole } = useAuth();
  const canWrite = WRITE_ROLES.includes(userRole);

  const [form, setForm] = useState(emptySettings);
  const [loading, setLoading] = useState(true);
  // Non-null means the GET failed: saving is DISABLED, because a PUT from a blank
  // form would replace the real document with empty values.
  const [loadError, setLoadError] = useState(null);
  const [rates, setRates] = useState([]);
  const [ratesError, setRatesError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [fieldErrors, setFieldErrors] = useState([]);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const envelope = await getAdminSettings();
      if (envelope?.success === false || !envelope?.data) {
        setLoadError(envelope?.message || 'Could not load the current settings.');
        return;
      }
      setForm(hydrate(envelope.data));
    } catch (err) {
      console.error(err);
      setLoadError(err.response?.data?.message || 'Could not load the current settings.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRates = useCallback(async () => {
    setRatesError(null);
    try {
      const envelope = await getAdminUsdKesRates();
      if (envelope?.success === false) {
        setRatesError(envelope?.message || 'Could not load USD/KES rates.');
        return;
      }
      setRates(Array.isArray(envelope?.data) ? envelope.data : []);
    } catch (err) {
      console.error(err);
      setRatesError(err.response?.data?.message || 'Could not load USD/KES rates.');
    }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);
  useEffect(() => { fetchRates(); }, [fetchRates]);

  const updateTop = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));
  const updateNested = (section, name, value) =>
    setForm((prev) => ({ ...prev, [section]: { ...prev[section], [name]: value } }));

  const handleTagsChange = (value) => updateNested('hero', 'rotatingTags', value.split(',').map((t) => t.trim()).filter(Boolean));
  const handlePhonesChange = (value) => updateNested('contact', 'phones', value.split(',').map((t) => t.trim()).filter(Boolean));

  const rateOptions = rates.map((r) => ({
    value: r.id,
    label: `${r.month}/${r.year} — KES ${r.kesValue}${r.currentDefault ? ' (current default)' : ''}`,
  }));
  // Keep the stored selection selectable even when the rates call failed or the row
  // is missing from the list, so a save never silently clears it.
  const selectedRateMissing =
    form.usdToLocalCurrencyRateId && !rateOptions.some((o) => o.value === form.usdToLocalCurrencyRateId);
  if (selectedRateMissing) {
    rateOptions.unshift({ value: form.usdToLocalCurrencyRateId, label: `Currently selected rate (${form.usdToLocalCurrencyRateId})` });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canWrite || loadError) return;
    setSaving(true);
    setMessage(null);
    setFieldErrors([]);
    try {
      // displayText is server-derived (README §9) — strip it, keep everything else.
      const { displayText, ...valuation } = form.globalInvestmentValuation ?? {};
      const stats = form.companyStats ?? {};

      // The ENTIRE state object goes back: PUT replaces the whole document.
      const payload = {
        ...form,
        yearsOfInvesting: toNumberOrOmit(form.yearsOfInvesting) ?? 0,
        yearEstablished: toNumberOrOmit(form.yearEstablished),
        usdToLocalCurrencyRateId: form.usdToLocalCurrencyRateId || null,
        globalInvestmentValuation: {
          ...valuation,
          amount: toNumberOrOmit(valuation.amount) ?? 0,
          allocationPercent: toNumberOrOmit(valuation.allocationPercent) ?? 0,
          asAtDate: valuation.asAtDate || null,
        },
        companyStats: {
          ...stats,
          sectorsCount: toNumberOrOmit(stats.sectorsCount) ?? 0,
          continentsCount: toNumberOrOmit(stats.continentsCount) ?? 0,
          countriesCount: toNumberOrOmit(stats.countriesCount) ?? 0,
          portfolioCompaniesCount: toNumberOrOmit(stats.portfolioCompaniesCount) ?? 0,
        },
      };

      const envelope = await updateAdminSettings(payload);
      if (envelope?.success === false) {
        setMessage({ type: 'error', text: envelope?.message || 'Could not save settings.' });
        setFieldErrors(envelope?.errors ?? []);
        return;
      }
      if (envelope?.data) setForm(hydrate(envelope.data));
      setMessage({ type: 'success', text: envelope?.message || 'Settings saved successfully.' });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Could not save settings.' });
      setFieldErrors(err.response?.data?.errors ?? []);
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

  const disabled = !canWrite;

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <div className="grid w-full grid-cols-12 mx-auto max-w-screen-3xl">
        <div className="hidden col-span-1 lg:block" />
        <div className="col-span-12 lg:col-span-10">
          <div className="px-4 pt-10 pb-8 sm:px-6 lg:px-0">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Site Settings</h1>
            <p className="mt-2 text-gray-500">Homepage hero, chairman block, stats, contact details, and navigation links.</p>
          </div>

          {loadError ? (
            <div className="px-4 pb-16 sm:px-6 lg:px-0">
              <div className="p-6 bg-white border border-red-200 shadow-lg rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={20} className="mt-0.5 text-red-600 shrink-0" />
                  <div>
                    <h3 className="font-bold text-gray-900">The current settings could not be loaded</h3>
                    <p className="mt-1 text-sm text-red-600">{loadError}</p>
                    <p className="mt-3 text-sm text-gray-500">
                      Saving is disabled until they load: a save replaces the whole settings document, so submitting a
                      blank form would erase the live values. Reload and try again.
                    </p>
                    <button
                      type="button"
                      onClick={fetchSettings}
                      className="inline-flex items-center gap-2 px-4 py-2 mt-4 text-sm font-semibold text-white bg-[#0A2540] hover:bg-[#003852] rounded-lg transition-colors"
                    >
                      <RefreshCw size={16} />
                      Reload settings
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="px-4 pb-16 space-y-6 sm:px-6 lg:px-0">
              {disabled && (
                <div className="p-4 text-sm text-gray-600 bg-white border border-gray-200 rounded-xl">
                  You have read-only access to site settings. Only a super admin or admin can change them.
                </div>
              )}

              <SectionCard title="Hero Section">
                <Field label="Headline" value={form.hero.headline} onChange={(v) => updateNested('hero', 'headline', v)} disabled={disabled} />
                <Field label="Subheadline" value={form.hero.subheadline} onChange={(v) => updateNested('hero', 'subheadline', v)} disabled={disabled} />
                <Field label="Sector Tags (comma-separated)" value={form.hero.rotatingTags?.join(', ')} onChange={handleTagsChange} disabled={disabled} />
                <Field label="Button Label" value={form.hero.ctaLabel} onChange={(v) => updateNested('hero', 'ctaLabel', v)} disabled={disabled} />
              </SectionCard>

              <SectionCard title="About the Company">
                <Field
                  label="Year Established"
                  type="number"
                  min="1800"
                  max="2500"
                  value={form.yearEstablished}
                  onChange={(v) => updateTop('yearEstablished', v)}
                  disabled={disabled}
                  help="Drives the “total years” figure on the public site. Leave blank to hide it."
                />
              </SectionCard>

              <SectionCard title="Chairman">
                <Field label="Chairman Name" value={form.chairmanName} onChange={(v) => updateTop('chairmanName', v)} disabled={disabled} />
                <Field label="Chairman Message" type="textarea" value={form.chairmanMessage} onChange={(v) => updateTop('chairmanMessage', v)} disabled={disabled} />
                <UploadField label="Chairman Photo" value={form.chairmanImage} onChange={(v) => updateTop('chairmanImage', v)} folder="chairman" disabled={disabled} />
              </SectionCard>

              <SectionCard
                title="Company Stats"
                note="Reference figures only — the public site computes its own counts. Only Total Portfolio, continents and the employees label are authoritative."
              >
                <Field label="Total Portfolio (e.g. $6.0 B)" value={form.companyStats.totalPortfolio} onChange={(v) => updateNested('companyStats', 'totalPortfolio', v)} disabled={disabled} />
                <Field label="Clusters Count" type="number" value={form.companyStats.sectorsCount} onChange={(v) => updateNested('companyStats', 'sectorsCount', v)} disabled={disabled} />
                <Field label="Continents Count" type="number" value={form.companyStats.continentsCount} onChange={(v) => updateNested('companyStats', 'continentsCount', v)} disabled={disabled} />
                <Field label="Countries Count" type="number" value={form.companyStats.countriesCount} onChange={(v) => updateNested('companyStats', 'countriesCount', v)} disabled={disabled} />
                <Field label="Employees Label (e.g. 20k+)" value={form.companyStats.employeesLabel} onChange={(v) => updateNested('companyStats', 'employeesLabel', v)} disabled={disabled} />
                <Field label="Portfolio Companies Count" type="number" value={form.companyStats.portfolioCompaniesCount} onChange={(v) => updateNested('companyStats', 'portfolioCompaniesCount', v)} disabled={disabled} />
              </SectionCard>

              <SectionCard title="Global Investment Valuation">
                <SelectField
                  label="Currency"
                  value={form.globalInvestmentValuation.currency}
                  onChange={(v) => updateNested('globalInvestmentValuation', 'currency', v)}
                  options={withCurrent(CURRENCY_OPTIONS.map((c) => ({ value: c.value, label: c.label })), form.globalInvestmentValuation.currency)}
                  disabled={disabled}
                />
                <Field label="Amount" type="number" step="0.01" value={form.globalInvestmentValuation.amount} onChange={(v) => updateNested('globalInvestmentValuation', 'amount', v)} disabled={disabled} />
                <SelectField
                  label="Unit"
                  value={form.globalInvestmentValuation.unit}
                  onChange={(v) => updateNested('globalInvestmentValuation', 'unit', v)}
                  options={withCurrent(VALUATION_UNITS.map((u) => ({ value: u.value, label: u.label })), form.globalInvestmentValuation.unit)}
                  disabled={disabled}
                />
                <Field label="As At Date" type="date" value={form.globalInvestmentValuation.asAtDate} onChange={(v) => updateNested('globalInvestmentValuation', 'asAtDate', v)} disabled={disabled} />
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-gray-700">Display Text</label>
                  <p className="px-3 py-2 text-gray-700 border border-gray-200 rounded-lg bg-gray-50">
                    {form.globalInvestmentValuation.displayText || '—'}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">Formatted by the server from the values above — not editable.</p>
                </div>
              </SectionCard>

              <SectionCard title="Currency Conversion">
                <SelectField
                  label="USD → local currency rate"
                  value={form.usdToLocalCurrencyRateId}
                  onChange={(v) => updateTop('usdToLocalCurrencyRateId', v)}
                  options={rateOptions}
                  placeholder="Use current default rate"
                  disabled={disabled}
                  help="Pins conversions to one USD/KES period. Leave on “Use current default rate” to follow whichever rate is flagged as default."
                />
                {ratesError && <p className="text-xs text-red-600">{ratesError}</p>}
              </SectionCard>

              <SectionCard title="Contact Details">
                <Field label="Office Address" type="textarea" value={form.contact.officeAddress} onChange={(v) => updateNested('contact', 'officeAddress', v)} disabled={disabled} />
                <Field label="Phone Numbers (comma-separated)" value={form.contact.phones?.join(', ')} onChange={handlePhonesChange} disabled={disabled} />
                <Field label="Email" value={form.contact.email} onChange={(v) => updateNested('contact', 'email', v)} disabled={disabled} />
                <Field label="Business Hours" value={form.contact.businessHours} onChange={(v) => updateNested('contact', 'businessHours', v)} disabled={disabled} />
              </SectionCard>

              <SectionCard title="Social Links">
                <LinkListEditor items={form.socialLinks} onChange={(next) => updateTop('socialLinks', next)} disabled={disabled} />
              </SectionCard>

              <SectionCard title="Footer Quick Links">
                <LinkListEditor items={form.footerQuickLinks} onChange={(next) => updateTop('footerQuickLinks', next)} disabled={disabled} />
              </SectionCard>

              <SectionCard title="Page Introductions">
                <Field label="Dashboard Title" value={form.dashboardTitle} onChange={(v) => updateTop('dashboardTitle', v)} disabled={disabled} required />
                <Field label="Dashboard Subtitle" value={form.dashboardSubtitle} onChange={(v) => updateTop('dashboardSubtitle', v)} disabled={disabled} required />
                <Field label="Portfolio Intro Text" type="textarea" value={form.portfolioIntroText} onChange={(v) => updateTop('portfolioIntroText', v)} disabled={disabled} required />
                <Field label="Net Assets Intro Text" type="textarea" value={form.netAssetsIntroText} onChange={(v) => updateTop('netAssetsIntroText', v)} disabled={disabled} required />
                <Field label="Countries Intro Text" type="textarea" value={form.countriesIntroText} onChange={(v) => updateTop('countriesIntroText', v)} disabled={disabled} required />
                <Field label="Years of Investing" type="number" value={form.yearsOfInvesting} onChange={(v) => updateTop('yearsOfInvesting', v)} disabled={disabled} />
              </SectionCard>

              {fieldErrors.length > 0 && (
                <ul className="p-4 text-sm text-red-600 border border-red-200 rounded-xl bg-red-50">
                  {fieldErrors.map((fe, i) => (
                    <li key={`${fe.field}-${i}`}>
                      <span className="font-semibold">{fe.field}</span>: {fe.message}
                    </li>
                  ))}
                </ul>
              )}

              {message && (
                <p className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{message.text}</p>
              )}

              {canWrite && (
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#0A2540] hover:bg-[#003852] text-white font-semibold px-6 py-3 rounded-lg transition-colors disabled:opacity-60"
                >
                  {saving ? 'Saving…' : 'Save All Settings'}
                </button>
              )}
            </form>
          )}
        </div>
        <div className="hidden col-span-1 lg:block" />
      </div>
    </div>
  );
};

export default AdminSettings;
