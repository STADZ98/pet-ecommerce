import axios from "axios";

const API = import.meta.env.VITE_API || "http://localhost:5005/api";

export const createUserCart = async (token, cart) => {
  return axios.post(`${API}/user/cart`, cart, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
export const listUserCart = async (token) => {
  return axios.get(`${API}/user/cart`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
// รองรับ array addresses
export const saveAddress = async (token, addresses) => {
  return axios.put(
    `${API}/user/address`,
    { addresses },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
export const saveOrder = async (token, payload) => {
  return axios.post(`${API}/user/order`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
export const getOrders = async (token) => {
  return axios.get(
    `${API}/user/order`,

    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
export const getUserAddress = async (token) => {
  return await axios.get(`${API}/user/address`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
export const emptyCart = async (token) => {
  return axios.delete(`${API}/user/cart`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
export const cancelOrder = async (token, orderId) => {
  return axios.patch(
    `${API}/user/order/${orderId}/cancel`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
export const updateUserInfo = (token, userId, data) => {
  return axios.patch(`${API}/admin/user/${userId}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
export const uploadProfilePicture = (token, imageBase64, userId) => {
  const payload = { image: imageBase64 };
  if (userId) payload.userId = userId;
  return axios.post(`${API}/user/profile-picture`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
