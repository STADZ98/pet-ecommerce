import axios from "axios";

const API = import.meta.env.VITE_API || "http://localhost:5005/api";

export const createCategory = async (token, form) => {
  return axios.post(`${API}/category`, form, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json", // ✅ เพิ่มบรรทัดนี้
    },
  });
};

export const listCategory = async () => {
  return axios.get(`${API}/category`);
};

export const removeCategory = async (token, id) => {
  return axios.delete(`${API}/category/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
export const updateCategory = async (token, id, data) => {
  return axios.put(`${API}/category/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
