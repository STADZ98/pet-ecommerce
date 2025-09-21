import axios from "axios";

const API = import.meta.env.VITE_API || "http://localhost:5005/api";

export const createBrand = async (token, form) => {
  return axios.post(`${API}/brand`, form, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const listBrand = async (token) => {
  return axios.get(`${API}/brand`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
};

export const removeBrand = async (token, id) => {
  return axios.delete(`${API}/brand/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateBrand = async (token, id, data) => {
  return axios.put(`${API}/brand/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
