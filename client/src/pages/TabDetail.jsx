import React, { useState } from "react";

const TabDetail = ({ product }) => {
  const [tab, setTab] = useState(0); // 0: รายละเอียดสินค้า, 1: ข้อมูลเพิ่มเติม

  // ตัวอย่างข้อมูลเพิ่มเติม (ควร map กับ product จริง)
  const infoList = product.infoList || [];

  return (
    <div className="">
      <div className="flex gap-2 border-b mb-4">
        <button
          className={`px-4 py-2 font-medium rounded-t-md transition border-b-2 ${
            tab === 0
              ? "border-yellow-400 text-yellow-600 bg-yellow-50"
              : "border-transparent text-gray-500 hover:text-yellow-600"
          }`}
          onClick={() => setTab(0)}
        >
          รายละเอียดสินค้า
        </button>
        <button
          className={`px-4 py-2 font-medium rounded-t-md transition border-b-2 ${
            tab === 1
              ? "border-yellow-400 text-yellow-600 bg-yellow-50"
              : "border-transparent text-gray-500 hover:text-yellow-600"
          }`}
          onClick={() => setTab(1)}
        >
          ข้อมูลเพิ่มเติม
        </button>
      </div>
      <div className="bg-gray-50 rounded-xl p-6 min-h-[120px] text-gray-700 text-sm">
        {tab === 0 ? (
          product.detail ? (
            <ul className="list-disc pl-6 space-y-1">
              {product.detail
                .split("\n")
                .map((line, i) => (line ? <li key={i}>{line}</li> : null))}
            </ul>
          ) : (
            <span>ไม่มีรายละเอียดสินค้า</span>
          )
        ) : product.description ? (
          <div className="whitespace-pre-line">{product.description}</div>
        ) : (
          <span>ไม่มีข้อมูลเพิ่มเติม</span>
        )}
      </div>
    </div>
  );
};

export default TabDetail;
