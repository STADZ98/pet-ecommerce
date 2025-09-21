// App.jsx
// Component หลักของแอปนี้ ทำหน้าที่เป็น root ของทุก route และแสดง ToastContainer สำหรับแจ้งเตือน
import React from "react";
import AppRoutes from "./routes/AppRoutes";
import { ToastContainer } from "react-toastify";
// ฟังก์ชั่น App: render ToastContainer และ AppRoutes
const App = () => {
  return (
    <>
      <ToastContainer />
      <AppRoutes />
    </>
  );
};

export default App;
