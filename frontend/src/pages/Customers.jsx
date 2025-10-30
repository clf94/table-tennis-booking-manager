import React from 'react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import client from '../api/client';
import { Plus, Edit, Trash2, Search } from 'lucide-react';

export default function Customers() {
  const { t } = useTranslation();
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    is_abo_holder: false,
    abo_start: '',
    abo_end: ''
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    const filtered = customers.filter(c =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contact?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCustomers(filtered);
  }, [searchTerm, customers]);

  const fetchCustomers = async () => {
    try {
      const response = await client.get('/customers');
      setCustomers(response.data);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (selectedCustomer) {
        await client.put(`/customers/${selectedCustomer.id}`, formData);
      } else {
        await client.post('/customers', formData);
      }
      
      setShowModal(false);
      fetchCustomers();
      resetForm();
    } catch (error) {
      alert('Failed to save customer');
    }
  };

  const handleEdit = (customer) => {
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name,
      contact: customer.contact || '',
      is_abo_holder: customer.is_abo_holder,
      abo_start: customer.abo_start || '',
      abo_end: customer.abo_end || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this customer?')) return;
    
    try {
      await client.delete(`/customers/${id}`);
      fetchCustomers();
    } catch (error) {
      alert('Failed to delete customer');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      contact: '',
      is_abo_holder: false,
      abo_start: '',
      abo_end: ''
    });
    setSelectedCustomer(null);
  };

return (
  <div className="px-4 sm:px-6 lg:px-8 py-4">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{t('customers')}</h1>
      <button
        onClick={() => { resetForm(); setShowModal(true); }}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm sm:text-base"
      >
        <Plus className="w-5 h-5" />
        {t('create')}
      </button>
    </div>

    {/* Search */}
    <div className="mb-4 sm:mb-6">
      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder={t('search')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg"
        />
      </div>
    </div>

    {/* Table */}
    <div className="bg-white rounded-lg shadow overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase">{t('name')}</th>
            <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase">{t('contact')}</th>
            <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase">{t('aboHolder')}</th>
            <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase">{t('aboStart')}</th>
            <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase">{t('aboEnd')}</th>
            <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase">{t('actions')}</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredCustomers.map((customer) => (
            <tr key={customer.id} className="hover:bg-gray-50">
              <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-sm sm:text-base">{customer.name}</td>
              <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-sm sm:text-base">{customer.contact || '-'}</td>
              <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
                <span className={`px-2 py-1 text-xs sm:text-sm rounded ${
                  customer.is_abo_holder ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {customer.is_abo_holder ? 'Yes' : 'No'}
                </span>
              </td>
              <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-sm sm:text-base">{customer.abo_start || '-'}</td>
              <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-sm sm:text-base">{customer.abo_end || '-'}</td>
              <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(customer)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(customer.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Modal */}
    {showModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">
            {selectedCustomer ? t('edit') : t('create')} {t('customer')}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-sm sm:text-base font-medium mb-1">{t('name')}</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg text-sm sm:text-base"
                required
              />
            </div>

            <div>
              <label className="block text-sm sm:text-base font-medium mb-1">{t('contact')}</label>
              <input
                type="text"
                value={formData.contact}
                onChange={(e) => setFormData({...formData, contact: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg text-sm sm:text-base"
              />
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_abo_holder}
                  onChange={(e) => setFormData({...formData, is_abo_holder: e.target.checked})}
                  className="w-4 h-4"
                />
                <span className="text-sm sm:text-base font-medium">{t('aboHolder')}</span>
              </label>
            </div>

            {formData.is_abo_holder && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                <div>
                  <label className="block text-sm sm:text-base font-medium mb-1">{t('aboStart')}</label>
                  <input
                    type="date"
                    value={formData.abo_start}
                    onChange={(e) => setFormData({...formData, abo_start: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm sm:text-base font-medium mb-1">{t('aboEnd')}</label>
                  <input
                    type="date"
                    value={formData.abo_end}
                    onChange={(e) => setFormData({...formData, abo_end: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm sm:text-base"
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 mt-2">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-sm sm:text-base"
              >
                {t('save')}
              </button>
              <button
                type="button"
                onClick={() => { setShowModal(false); resetForm(); }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 text-sm sm:text-base"
              >
                {t('cancel')}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
  </div>
);

}