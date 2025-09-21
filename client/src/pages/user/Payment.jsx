import React, { useState, useEffect, useMemo } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { payment } from "../../api/stripe";
import useEcomeStore from "../../store/ecom-store";
import CheckoutForm from "../../components/CheckoutForm";
import { useNavigate } from "react-router-dom";

const stripePromise = loadStripe(
  "pk_test_51RUkFLP3zujqKqm3nHWNfgqT8PuanPtBGiiQ1YXNSWo9R5KEqDOkebTykq0L9XWURORrtEqNHgSKCEJrAVOfYMFL00Tf4HQhfB"
);

const Payment = () => {
  const token = useEcomeStore((s) => s.token);
  const [clientSecret, setClientSecret] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPaymentIntent = async () => {
      try {
        setLoading(true);
        const res = await payment(token);
        setClientSecret(res.data.clientSecret);
      } catch (err) {
        console.error("Payment intent error:", err);
        setError("เกิดข้อผิดพลาดในการโหลดฟอร์มการชำระเงิน");
      } finally {
        setLoading(false);
      }
    };
    // if no token, redirect to login
    if (!token) {
      setLoading(false);
      setError("กรุณาเข้าสู่ระบบเพื่อดำเนินการชำระเงิน");
      return navigate("/login");
    }

    fetchPaymentIntent();
  }, [token, navigate]);

  const options = useMemo(() => {
    const appearance = { theme: "stripe" };
    return { clientSecret, appearance };
  }, [clientSecret]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 p-4">
      {loading && !error && (
        <div className="flex flex-col items-center space-y-2">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-500"></div>
          <p className="text-gray-600">กำลังโหลดฟอร์มการชำระเงิน...</p>
        </div>
      )}

      {error && <p className="text-red-500 font-medium">{error}</p>}

      {clientSecret && !error && (
        // key forces Elements to remount when clientSecret changes which avoids
        // the "options.clientSecret is not a mutable property" warning
        <Elements key={clientSecret} stripe={stripePromise} options={options}>
          <CheckoutForm clientSecret={clientSecret} />
        </Elements>
      )}
    </div>
  );
};

export default Payment;
