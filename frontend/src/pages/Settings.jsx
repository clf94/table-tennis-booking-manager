import React from 'react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import client from '../api/client';

export default function Settings() {
  const { t } = useTranslation();
  const [settings, setSettings] = useState(null);
  const [pricingMatrix, setPricingMatrix] = useState({});
  const [monthlyRate, setMonthlyRate] = useState(50);
  const [language, setLanguage] = useState('en');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await client.get('/settings');
      setSettings(response.data);
      setPricingMatrix(response.data.pricing_matrix);
      setMonthlyRate(response.data.monthly_rate);
      setLanguage(response.data.language);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await client.put('/settings', {
        pricing_matrix: pricingMatrix,
        monthly_rate: monthlyRate,
        language: language
      });
      alert('Settings saved successfully!');
      fetchSettings();
    } catch (error) {
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updatePrice = (key, value) => {
    setPricingMatrix({
      ...pricingMatrix,
      [key]: parseFloat(value) || 0
    });
  };

  const priceFields = [
    { key: '30_no_trainer_no_abo', label: '30 min, No Trainer, No ABO' },
    { key: '30_no_trainer_abo', label: '30 min, No Trainer, With ABO' },
    { key: '30_trainer_no_abo', label: '30 min, With Trainer, No ABO' },
    { key: '30_trainer_abo', label: '30 min, With Trainer, With ABO' },
    { key: '60_no_trainer_no_abo', label: '60 min, No Trainer, No ABO' },
    { key: '60_no_trainer_abo', label: '60 min, No Trainer, With ABO' },
    { key: '60_trainer_no_abo', label: '60 min, With Trainer, No ABO' },
    { key: '60_trainer_abo', label: '60 min, With Trainer, With ABO' },
  ];

  if (!settings) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">{t('settings')}</h1>

      <div className="space-y-6">
        {/* Pricing Matrix */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">{t('pricingMatrix')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {priceFields.map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {field.label}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={pricingMatrix[field.key] || 0}
                    onChange={(e) => updatePrice(field.key, e.target.value)}
                    className="w-full pl-8 pr-4 py-2 border rounded-lg"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Rate */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">{t('monthlyRate')}</h2>
          <div className="max-w-xs">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ABO Monthly Subscription Rate
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                step="0.01"
                value={monthlyRate}
                onChange={(e) => setMonthlyRate(parseFloat(e.target.value) || 0)}
                className="w-full pl-8 pr-4 py-2 border rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Language */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">{t('language')}</h2>
          <div className="max-w-xs">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="en">English</option>
              <option value="de">Deutsch</option>
              <option value="ru">Русский</option>
              <option value="es">Español</option>
            </select>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {saving ? 'Saving...' : t('save')}
          </button>
        </div>
      </div>
    </div>
  );
}