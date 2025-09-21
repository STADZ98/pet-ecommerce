import axios from "axios";

const API = import.meta.env.VITE_API || "http://localhost:5005/api";

export const getOrdersAdmin = async (token) => {
  return axios.get(`${API}/admin/orders`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
export const changeOrderStatus = async (token, orderId, orderStatus) => {
  // Backend expects Thai status labels; accept either enum or Thai label here
  const statusLabelMap = {
    NOT_PROCESSED: "รอดำเนินการ",
    PROCESSING: "กำลังดำเนินการ",
    DELIVERED: "จัดส่งสำเร็จ",
    CANCELLED: "ยกเลิก",
    SHIPPED: "จัดส่งแล้ว",
  };

  const payloadStatus =
    statusLabelMap[orderStatus] ||
    (typeof orderStatus === "string" ? orderStatus.trim() : orderStatus);
  const parsedId = Number(orderId);
  const payloadOrderId = Number.isNaN(parsedId) ? orderId : parsedId;

  return axios.put(
    `${API}/admin/order-status`,
    {
      orderId: payloadOrderId,
      orderStatus: payloadStatus,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
export const getListAllUsers = async (token) => {
  return axios.get(`${API}/users`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
export const changeUserStatus = async (token, value) => {
  return axios.post(`${API}/change-status`, value, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
export const changeUserRole = async (token, value) => {
  return axios.post(`${API}/change-role`, value, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
export const getSalesSummary = async (token) => {
  return axios.get(`${API}/admin/sales-summary`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
export const getTopProducts = async (token) => {
  return axios.get(`${API}/admin/top-products`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
export const deleteUser = async (token, userId) => {
  return axios.delete(`${API}/admin/user/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
export const updateUserEmail = (token, userId, data) =>
  axios.patch(`${API}/admin/user/${userId}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
export const getAdminProfile = async (token) => {
  return axios.get(`${API}/admin/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
export const deleteOrder = (token, orderId) => {
  return axios.delete(`${API}/admin/order/${orderId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Update shipping info (carrier + tracking) for an order
export const updateOrderShipping = (token, orderId, data) => {
  const parsedId = Number(orderId);
  const payloadOrderId = Number.isNaN(parsedId) ? orderId : parsedId;
  return axios.put(
    `${API}/admin/order-shipping`,
    { orderId: payloadOrderId, ...data },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const generateAdminTracking = (token, payload) => {
  return axios.post(`${API}/admin/generate-tracking`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ดึงสถานะพัสดุจาก backend (ที่เชื่อมกับ API ของแต่ละเจ้า)
export const getOrderTrackingStatus = (token, trackingNumber, carrier) => {
  return axios.get(`${API}/admin/order-tracking`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { trackingNumber, carrier }, // carrier เช่น "THP", "FLASH", "JNT"
  });
};
