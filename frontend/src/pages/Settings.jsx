import React from 'react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import client from '../api/client';
import { Plus, Edit, Trash2, X } from 'lucide-react';

export default function Settings() {
  const { t } = useTranslation();
  const [settings, setSettings] = useState(null);
  const [pricingMatrix, setPricingMatrix] = useState({});
  const [monthlyRate, setMonthlyRate] = useState(50);
  const [language, setLanguage] = useState('en');
  const [tables, setTables] = useState([]);
  const [tableName, setTableName] = useState('');
  const [saving, setSaving] = useState(false);
  
  // Missing state variables for table modal
  const [showTableModal, setShowTableModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [tableToDelete, setTableToDelete] = useState(null);

  useEffect(() => {
    fetchSettings();
    fetchTables();
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

  const fetchTables = async () => {
    try {
      const response = await client.get('/tables');
      setTables(response.data);
    } catch (error) {
      console.error('Failed to fetch tables:', error);
    }
  };
  
  const handleEditTable = (table) => {
    setSelectedTable(table);
    setTableName(table.name);
    setShowTableModal(true);
  };

  const handleDeleteTable = async (id) => {
    setTableToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDeleteTable = async () => {
    try {
      await client.delete(`/tables/${tableToDelete}`);
      fetchTables();
      setShowDeleteModal(false);
      setTableToDelete(null);
    } catch (error) {
      alert(t('deleteTableError'));
    }
  };
  
  const handleTableSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedTable) {
        await client.put(`/tables/${selectedTable.id}`, { name: tableName });
      } else {
        await client.post('/tables', { name: tableName });
      }
      setShowTableModal(false);
      setTableName('');
      setSelectedTable(null);
      fetchTables();
    } catch (error) {
      alert('Failed to save table');
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
    { key: '30_no_trainer_no_abo', label: 'thirty_no_trainer_no_abo' },
    { key: '30_no_trainer_abo', label: 'thirty_no_trainer_abo' },
    { key: '30_trainer_no_abo', label: 'thirty_trainer_no_abo' },
    { key: '30_trainer_abo', label: 'thirty_trainer_abo' },
    { key: '60_no_trainer_no_abo', label: 'sixty_no_trainer_no_abo' },
    { key: '60_no_trainer_abo', label: 'sixty_no_trainer_abo' },
    { key: '60_trainer_no_abo', label: 'sixty_trainer_no_abo' },
    { key: '60_trainer_abo', label: 'sixty_trainer_abo' },
  ];

  if (!settings) {
    return <div className="px-4 py-8 text-center">Loading...</div>;
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 sm:mb-8">{t('settings')}</h1>

      <div className="space-y-6">
        {/* Table Management */}
        <div className="bg-white rounded-lg shadow p-4 lg:p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg lg:text-xl font-bold">{t('tableManagement')}</h2>
            <button
              onClick={() => { setSelectedTable(null); setTableName(''); setShowTableModal(true); }}
              className="flex items-center gap-2 px-3 lg:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm lg:text-base"
            >
              <Plus className="w-4 h-4" />
              {t('addTable')}
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
            {tables.map((table) => (
              <div key={table.id} className="flex items-center justify-between p-3 lg:p-4 border rounded-lg">
                <span className="font-medium text-sm lg:text-base">{table.name}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditTable(table)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit className="w-4 h-4 lg:w-5 lg:h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteTable(table.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4 lg:w-5 lg:h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Matrix */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold mb-4">{t('pricingMatrix')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {priceFields.map((field) => (
              <div key={field.key}>
                <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                  {t(field.label)}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">€</span>
                  <input
                    type="number"
                    step="0.01"
                    value={pricingMatrix[field.key] || 0}
                    onChange={(e) => updatePrice(field.key, e.target.value)}
                    className="w-full pl-8 pr-4 py-2 border rounded-lg text-sm sm:text-base"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Rate */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold mb-4">{t('monthlyRate')}</h2>
          <div className="max-w-xs">
            <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
              {t('abo')} 
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">€</span>
              <input
                type="number"
                step="0.01"
                value={monthlyRate}
                onChange={(e) => setMonthlyRate(parseFloat(e.target.value) || 0)}
                className="w-full pl-8 pr-4 py-2 border rounded-lg text-sm sm:text-base"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 text-sm sm:text-base"
          >
            {saving ? 'Saving...' : t('save')}
          </button>
        </div>
      </div>

      {/* Table Modal */}
      {showTableModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                {selectedTable ? t('editTable') : t('addNewTable')}
              </h3>
              <button
                onClick={() => {
                  setShowTableModal(false);
                  setTableName('');
                  setSelectedTable(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('tableName')}
              </label>
              <input
                type="text"
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleTableSubmit(e);
                  }
                }}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder={t('tableNamePlaceholder')}
              />
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowTableModal(false);
                  setTableName('');
                  setSelectedTable(null);
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={handleTableSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                disabled={!tableName.trim()}
              >
                {selectedTable ? t('update') : t('create')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-start mb-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mr-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {t('deleteTable')}
                </h3>
                <p className="text-gray-600">
                  {t('deleteTableConfirm')}
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 justify-end mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setTableToDelete(null);
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={confirmDeleteTable}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                {t('delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}