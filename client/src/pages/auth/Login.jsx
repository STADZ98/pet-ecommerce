import React, { useState } from "react";
import { toast } from "react-toastify";
import useEcomStore from "../../store/ecom-store";
import { useNavigate, Link } from "react-router-dom";
import { FiMail, FiLock } from "react-icons/fi";

const Login = () => {
  const navigate = useNavigate();
  const actionLogin = useEcomStore((state) => state.actionLogin);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleOnChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await actionLogin(form);
      const role = res.data.payload.role;
      roleRedirect(role);
      // toast.success("ยินดีต้อนรับเข้าสู่ระบบ!");
    } catch (err) {
      const errMsg =
        err.response?.data?.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ";
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const roleRedirect = (role) => {
    if (role === "admin") {
      navigate("/admin", { replace: true });
    } else {
      navigate("/", { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md animate-fadeIn">
        <h1 className="text-3xl font-extrabold text-center text-blue-700 mb-2 mt-6 drop-shadow">
          เข้าสู่ระบบ
        </h1>
        <p className="text-center text-gray-500 mb-6">ยินดีต้อนรับกลับมา 👋</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <div className="relative group">
            <FiMail
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400 group-focus-within:text-blue-600 transition pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleOnChange}
              required
              autoFocus
              placeholder="อีเมล"
              className="pl-12 pr-4 py-2 w-full border border-blue-200 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition"
            />
          </div>

          {/* Password Field */}
          <div className="relative group">
            <FiLock
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400 group-focus-within:text-blue-600 transition pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleOnChange}
              required
              placeholder="รหัสผ่าน"
              className="pl-12 pr-4 py-2 w-full border border-blue-200 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition"
            />
          </div>

          {/* Forgot link */}
          <div className="text-right text-sm">
            <a
              href="#"
              className="text-blue-500 hover:underline hover:text-blue-700 transition"
            >
              ลืมรหัสผ่าน?
            </a>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-md font-semibold shadow-md transition-all duration-200 active:scale-95 ${
              loading
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:scale-105 hover:shadow-lg"
            }`}
          >
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm mt-6 text-gray-600">
          ยังไม่มีบัญชี?{" "}
          <Link
            to="/register"
            className="text-blue-600 hover:underline hover:text-blue-800 transition"
          >
            สมัครสมาชิก
          </Link>
        </p>
      </div>

      {/* Animation keyframes */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(30px);}
            to { opacity: 1; transform: translateY(0);}
          }
          .animate-fadeIn { animation: fadeIn 0.7s cubic-bezier(.4,2,.6,1) }
          @keyframes bounce-slow {
            0%, 100% { transform: translateY(0);}
            50% { transform: translateY(-10px);}
          }
          .animate-bounce-slow { animation: bounce-slow 2.5s infinite; }
        `}
      </style>
    </div>
  );
};

export default Login;
