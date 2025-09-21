import React from "react";

const SummaryCard = ({ icon, title, value, description }) => {
  return (
    <div className="p-5 rounded-2xl shadow-sm border border-gray-100 bg-white hover:shadow-md transition-transform transform hover:-translate-y-0.5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white text-indigo-600">
            {icon}
          </div>
          <div>
            <div className="text-sm font-medium text-gray-600">{title}</div>
            <div className="mt-1 text-3xl font-extrabold text-gray-900 leading-tight">
              {value}
            </div>
          </div>
        </div>
        <div className="text-sm text-gray-400">{description}</div>
      </div>
    </div>
  );
};

export default SummaryCard;
