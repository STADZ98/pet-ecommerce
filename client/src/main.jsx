// main.jsx
// Entry point ของ React app นี้ ทำหน้าที่ mount component หลัก (App) ไปยัง root element ใน DOM
// ใช้ StrictMode เพื่อช่วยตรวจสอบปัญหาใน development
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// สร้าง root และ render <App />
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
