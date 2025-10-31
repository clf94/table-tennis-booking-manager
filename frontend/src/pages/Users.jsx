import React from 'react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import client from '../api/client';
import { Plus, Edit, Trash2, UserPlus } from 'lucide-react';

export default function Users() {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'trainer',
    trainer_id: ''
  });

  useEffect(() => {
    fetchUsers();
    fetchTrainers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await client.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchTrainers = async () => {
    try {
      const response = await client.get('/trainers');
      setTrainers(response.data);
    } catch (error) {
      console.error('Failed to fetch trainers:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const data = {
        ...formData,
        trainer_id: formData.role === 'trainer' && formData.trainer_id ? parseInt(formData.trainer_id) : null
      };

      if (selectedUser) {
        await client.put(`/users/${selectedUser.id}`, data);
      } else {
        await client.post('/users', data);
      }
      
      setShowModal(false);
      fetchUsers();
      resetForm();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to save user');
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      password: '',
      role: user.role,
      trainer_id: user.trainer_id || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this user?')) return;
    
    try {
      await client.delete(`/users/${id}`);
      fetchUsers();
    } catch (error) {
      alert('Failed to delete user');
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      role: 'trainer',
      trainer_id: ''
    });
    setSelectedUser(null);
  };

  const getTrainerName = (trainerId) => {
    const trainer = trainers.find(t => t.id === trainerId);
    return trainer ? trainer.name : '-';
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">{t('user_management')}</h1>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
        >
          <UserPlus className="w-5 h-5" />
          {t('c')}
        </button>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {users.map((user) => (
          <div key={user.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-gray-800">{user.username}</h3>
                <span className={`inline-block px-2 py-1 text-xs rounded mt-1 ${
                  user.role === 'admin' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {user.role}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(user)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Edit className="w-5 h-5" />
                </button>
                {user.role !== 'admin' && (
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
            {user.trainer_id && (
              <p className="text-sm text-gray-600">
                Trainer: {getTrainerName(user.trainer_id)}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('username')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('role')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('linked_trainer')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('actions')}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium">{user.username}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded ${
                    user.role === 'admin' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.trainer_id ? getTrainerName(user.trainer_id) : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(user)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    {user.role !== 'admin' && (
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
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
          <div className="bg-white rounded-lg p-4 lg:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl lg:text-2xl font-bold mb-4">
              {selectedUser ? 'Edit User' : 'Create User'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg text-sm lg:text-base"
                  required
                  disabled={selectedUser?.role === 'admin'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Password {selectedUser && '(leave blank to keep current)'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg text-sm lg:text-base"
                  required={!selectedUser}
                  minLength="6"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value, trainer_id: ''})}
                  className="w-full px-3 py-2 border rounded-lg text-sm lg:text-base"
                  required
                  disabled={selectedUser?.role === 'admin'}
                >
                  <option value="admin">Admin</option>
                  <option value="trainer">Trainer</option>
                </select>
              </div>

              {formData.role === 'trainer' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Link to Trainer Profile</label>
                  <select
                    value={formData.trainer_id}
                    onChange={(e) => setFormData({...formData, trainer_id: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm lg:text-base"
                  >
                    <option value="">Select Trainer (Optional)</option>
                    {trainers.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Link this user to a trainer profile to see their billing reports
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-sm lg:text-base"
                >
                  {selectedUser ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 text-sm lg:text-base"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}