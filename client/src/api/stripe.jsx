import axios from "axios";

const API = import.meta.env.VITE_API || "http://localhost:5005/api";

export const payment = async (token) =>
  await axios.post(
    `${API}/user/create-payment-intent`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
