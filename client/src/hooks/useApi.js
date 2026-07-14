const API_BASE = import.meta.env.VITE_API_URL || 'https://crm-garagem.onrender.com';

export default function useApi() {
  async function request(endpoint, options = {}) {
    const token = localStorage.getItem('crm_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || `Erro ${res.status}`);
    }

    return data;
  }

  // Auth
  const login = (username, password) =>
    request('/api/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

  const logout = () =>
    request('/api/logout', { method: 'POST' });

  const getProfile = () =>
    request('/api/me');

  // Leads
  const getLeads = (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/api/leads${query ? `?${query}` : ''}`);
  };

  const getLead = (id) => request(`/api/leads/${id}`);

  const createLead = (data) =>
    request('/api/leads', {
      method: 'POST',
      body: JSON.stringify(data),
    });

  const updateLead = (id, data) =>
    request(`/api/leads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });

  const deleteLead = (id) =>
    request(`/api/leads/${id}`, { method: 'DELETE' });

  const getPipelineSummary = () =>
    request('/api/leads/pipeline/summary');

  // Estoque
  const getEstoque = () =>
    request('/api/estoque/all');

  const createProduct = (data) =>
    request('/api/estoque', {
      method: 'POST',
      body: JSON.stringify(data),
    });

  const updateProduct = (id, data) =>
    request(`/api/estoque/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });

  const deleteProduct = (id) =>
    request(`/api/estoque/${id}`, { method: 'DELETE' });

  // OS
  const getOs = (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/api/os${query ? `?${query}` : ''}`);
  };

  const getOsById = (id) => request(`/api/os/${id}`);

  const createOs = (data) =>
    request('/api/os', {
      method: 'POST',
      body: JSON.stringify(data),
    });

  const updateOs = (id, data) =>
    request(`/api/os/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });

  const deleteOs = (id) =>
    request(`/api/os/${id}`, { method: 'DELETE' });

  const getOsStats = () =>
    request('/api/os/stats');

  // Users
  const getUsers = (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/api/users${query ? `?${query}` : ''}`);
  };

  const updateUser = (id, data) =>
    request(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });

  const deleteUser = (id) =>
    request(`/api/users/${id}`, { method: 'DELETE' });

  return {
    login, logout, getProfile,
    getLeads, getLead, createLead, updateLead, deleteLead, getPipelineSummary,
    getEstoque, createProduct, updateProduct, deleteProduct,
    getOs, getOsById, createOs, updateOs, deleteOs, getOsStats,
    getUsers, updateUser, deleteUser,
  };
}
