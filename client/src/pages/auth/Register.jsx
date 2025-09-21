import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import zxcvbn from "zxcvbn";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  UserPlus,
  Mail,
  Lock,
  RotateCcwKey,
  KeyRound,
} from "lucide-react";

const registerSchema = z
  .object({
    email: z.string().email({ message: "อีเมลไม่ถูกต้อง!" }),
    password: z
      .string()
      .min(8, { message: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร" })
      .regex(/[A-Z]/, "ต้องมีตัวอักษรพิมพ์ใหญ่")
      .regex(/[a-z]/, "ต้องมีตัวอักษรพิมพ์เล็ก")
      .regex(/[0-9]/, "ต้องมีตัวเลข")
      .regex(/[@$!%*?&]/, "ต้องมีอักขระพิเศษ เช่น @$!%*?&"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "รหัสผ่านไม่ตรงกัน",
    path: ["confirmPassword"],
  });

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [passwordScore, setPasswordScore] = useState(0);
  const [passwordFeedback, setPasswordFeedback] = useState("");
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    try {
      const API = import.meta.env.VITE_API || "http://localhost:5005/api";
      await axios.post(`${API}/register`, data);
      toast.success("สมัครสมาชิกสำเร็จ!");
      navigate("/login");
    } catch (err) {
      const errMsg = err.response?.data?.message || "เกิดข้อผิดพลาด";
      toast.error(errMsg);
    }
  };

  // subscribe to password value in a stable way
  const passwordValue = watch("password");
  useEffect(() => {
    const pwd = passwordValue || "";
    const result = zxcvbn(pwd);
    setPasswordScore(result.score);

    if (!pwd) setPasswordFeedback("");
    else if (result.score <= 1) setPasswordFeedback("รหัสผ่านอ่อนมาก");
    else if (result.score === 2) setPasswordFeedback("รหัสผ่านพอใช้ได้");
    else if (result.score === 3) setPasswordFeedback("รหัสผ่านแข็งแรง");
    else setPasswordFeedback("รหัสผ่านปลอดภัยมาก");
  }, [passwordValue]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="relative w-full max-w-md bg-white/90 shadow-2xl rounded-2xl p-8 backdrop-blur-md border border-indigo-100 animate-fadeIn">
        {/* Floating Icon */}

        <h1 className="text-3xl font-extrabold text-center text-indigo-700 mb-1 mt-6 drop-shadow">
          สร้างบัญชีใหม่
        </h1>
        <p className="text-center text-gray-500 mb-6">
          ยินดีต้อนรับ! กรุณากรอกข้อมูลเพื่อสมัครสมาชิก
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div className="relative group">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400 group-focus-within:text-indigo-600 transition" />
            <input
              {...register("email")}
              placeholder="อีเมล"
              className={`pl-10 pr-4 py-2 w-full border border-indigo-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition ${
                errors.email && "border-red-500"
              }`}
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="relative group">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400 group-focus-within:text-indigo-600 transition" />
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              placeholder="รหัสผ่าน"
              className={`pl-10 pr-10 py-2 w-full border border-indigo-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition ${
                errors.password && "border-red-500"
              }`}
            />
            <div
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-3.5 right-3 text-gray-500 cursor-pointer"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </div>
            {errors.password && (
              <p className="text-sm text-red-500 mt-1">
                {errors.password.message}
              </p>
            )}

            {/* Strength Bar */}
            {watch().password?.length > 0 && (
              <>
                <div className="flex mt-2 space-x-1">
                  {Array.from(Array(5).keys()).map((_, index) => (
                    <div
                      key={index}
                      className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                        passwordScore >= index + 1
                          ? passwordScore < 3
                            ? "bg-red-400"
                            : passwordScore === 3
                            ? "bg-yellow-400"
                            : "bg-green-500"
                          : "bg-gray-200"
                      }`}
                    ></div>
                  ))}
                </div>
                <p
                  className={`text-sm mt-1 ${
                    passwordScore <= 1
                      ? "text-red-500"
                      : passwordScore === 2
                      ? "text-yellow-500"
                      : "text-green-600"
                  }`}
                >
                  {passwordFeedback}
                </p>
              </>
            )}
          </div>

          {/* Confirm Password */}
          <div className="relative group">
            <RotateCcwKey className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400 group-focus-within:text-indigo-600 transition" />
            <input
              {...register("confirmPassword")}
              type="password"
              placeholder="ยืนยันรหัสผ่าน"
              className={`pl-10 pr-4 py-2 w-full border border-indigo-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition ${
                errors.confirmPassword && "border-red-500"
              }`}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-500 mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-2 px-4 bg-gradient-to-r from-indigo-500 to-indigo-700 hover:from-indigo-600 hover:to-indigo-800 text-white font-semibold rounded-lg transition duration-200 shadow-md hover:scale-105 hover:shadow-lg active:scale-95"
          >
            สมัครสมาชิก
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center text-sm text-gray-600 mt-6">
          มีบัญชีอยู่แล้ว?{" "}
          <Link
            to="/login"
            className="text-indigo-600 hover:underline font-medium hover:text-indigo-800 transition"
          >
            เข้าสู่ระบบ
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

export default Register;
