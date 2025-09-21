import React from "react";

const ChartCard = ({ title, children, className = "" }) => (
  <div
    className={`bg-white rounded-2xl shadow-sm p-5 border border-gray-100 ${className}`}
  >
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-bold text-gray-800">{title}</h3>
      <div className="text-xs text-gray-400">อัปเดตล่าสุด</div>
    </div>
    <div className="w-full h-full min-h-[220px]">{children}</div>
  </div>
);

export default ChartCard;
