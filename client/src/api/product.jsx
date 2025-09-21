import axios from "axios";

const API = import.meta.env.VITE_API || "http://localhost:5005/api";

export const createProduct = async (token, form) => {
  return axios.post(`${API}/product`, form, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
export const listProduct = async (count = 20) => {
  return axios.get(`${API}/products/${count}`);
};
export const readProduct = async (token, id) => {
  return axios.get(`${API}/product/` + id, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
export const deleteProduct = async (token, id) => {
  return axios.delete(`${API}/product/` + id, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
export const updateProduct = async (token, id, form) => {
  return axios.put(`${API}/product/` + id, form, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
export const deleteVariant = async (token, id) => {
  return axios.delete(`${API}/variant/` + id, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
export const uploadFiles = async (token, form) => {
  return axios.post(
    `${API}/images`,
    {
      image: form,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
export const removeFiles = async (token, public_id) => {
  return axios.post(
    `${API}/removeimages`,
    {
      public_id,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
export const searchFilters = async (arg) => {
  return axios.post(`${API}/search/filters`, arg);
};

export const listProductBy = async (token, sort, order, limit) => {
  return axios.post(
    `${API}/productby`,
    { sort, order, limit },
    token
      ? {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      : undefined
  );
};

export const listProductByBrand = async (brandName) => {
  return axios.get(`/api/products?brand=${encodeURIComponent(brandName)}`);
};
