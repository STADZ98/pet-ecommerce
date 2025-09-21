import React, { useRef } from "react";
import { numberFormat } from "../utils/number";

const OrderDetailModal = ({ selectedOrder, setSelectedOrder, statusMap }) => {
  const printRef = useRef();

  const handlePrint = () => {
    const printContent = printRef.current;
    const WindowPrt = window.open("", "", "width=900,height=650");
    WindowPrt.document.write(`
      <html>
        <head>
          <title>ใบคำสั่งซื้อ</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 24px; color: #333; }
            h3 { font-size: 22px; margin-bottom: 16px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
            img { max-width: 60px; max-height: 60px; object-fit: cover; border-radius: 8px; }
            .status { padding: 6px 12px; border-radius: 12px; font-size: 12px; display: inline-flex; align-items: center; gap: 6px; }
          </style>
        </head>
        <body>
          ${printContent?.innerHTML}
        </body>
      </html>
    `);
    WindowPrt.document.close();
    WindowPrt.focus();
    WindowPrt.print();
    WindowPrt.close();
  };

  if (!selectedOrder) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in px-4">
      <div
        ref={printRef}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl p-8 relative overflow-auto max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-detail-title"
      >
        {/* Close Button */}
        <button
          className="absolute top-5 right-5 text-gray-400 hover:text-red-600 transition text-3xl font-extrabold"
          onClick={() => setSelectedOrder(null)}
          title="ปิด"
          aria-label="Close modal"
        >
          &times;
        </button>

        {/* Title */}
        <h3
          id="order-detail-title"
          className="text-3xl font-extrabold mb-8 text-gray-900 flex items-center gap-3"
        >
          รายละเอียดคำสั่งซื้อ
        </h3>

        {/* Buyer Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700 text-base mb-8">
          <div>
            <span className="font-semibold text-gray-900">ผู้สั่งซื้อ:</span>{" "}
            {selectedOrder.orderedBy?.email ||
              selectedOrder.email ||
              selectedOrder.orderedBy?.name ||
              "ไม่ระบุ"}
          </div>
          <div>
            <span className="font-semibold text-gray-900">วันที่:</span>{" "}
            {new Date(selectedOrder.createdAt).toLocaleString("th-TH", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })}
          </div>
          <div>
            <span className="font-semibold text-gray-900">สถานะ:</span>{" "}
            <span
              className={`inline-flex items-center px-4 py-1 rounded-full text-sm font-semibold shadow gap-2 ${
                statusMap[selectedOrder.orderStatus]?.color ||
                "bg-gray-100 text-gray-700"
              }`}
            >
              {statusMap[selectedOrder.orderStatus]?.icon}
              {statusMap[selectedOrder.orderStatus]?.label ||
                selectedOrder.orderStatus}
            </span>
          </div>
          <div>
            <span className="font-semibold text-gray-900">ยอดรวม:</span>{" "}
            <span className="inline-block text-gray-900 font-extrabold text-lg bg-gray-100 px-4 py-1 rounded-lg shadow-sm">
              {numberFormat(selectedOrder.cartTotal)}{" "}
              <span className="text-sm text-gray-500">บาท</span>
            </span>
          </div>
        </div>

        {/* Product Table */}
        <section className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
          <table className="min-w-full bg-white text-gray-800 text-sm">
            <thead className="bg-gray-50 uppercase tracking-wider text-xs font-semibold">
              <tr>
                <th className="px-4 py-3 text-center">ลำดับ</th>
                <th className="px-4 py-3 text-center">รูป</th>
                <th className="px-4 py-3 text-left">ชื่อสินค้า</th>
                <th className="px-4 py-3 text-left">หมวดหมู่</th>
                <th className="px-4 py-3 text-center">จำนวน</th>
                <th className="px-4 py-3 text-right">ราคา/หน่วย</th>
              </tr>
            </thead>
            <tbody>
              {selectedOrder.products?.map((p, idx) => {
                if (!p.product) return null;

                let imgSrc = "https://placehold.co/60x60?text=No+Image";
                if (
                  Array.isArray(p.product.images) &&
                  p.product.images.length > 0
                ) {
                  const img = p.product.images[0];
                  if (typeof img === "string") {
                    imgSrc = img;
                  } else if (img && typeof img === "object" && img.url) {
                    imgSrc = img.url;
                  }
                }

                return (
                  <tr
                    key={idx}
                    className="hover:bg-gray-50 transition-all duration-200"
                  >
                    <td className="px-4 py-3 text-center font-semibold">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <img
                        src={imgSrc}
                        alt={p.product.title}
                        className="w-16 h-16 object-cover rounded-xl border border-gray-200 mx-auto shadow-sm"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900">
                        {p.product.title}
                      </div>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {p.product.description || "ไม่มีรายละเอียด"}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {typeof p.product.category === "string"
                        ? p.product.category
                        : p.product.category?.name || "ไม่ระบุ"}
                    </td>
                    <td className="px-4 py-3 text-center font-medium">
                      {p.count} {p.product.unit}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {numberFormat(p.product.price)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        {/* Print Button */}
        <div className="flex justify-end mt-8 print:hidden">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-white rounded-lg shadow-md transition"
            type="button"
          >
            พิมพ์ใบคำสั่งซื้อ
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 17h2a2 2 0 002-2v-5a2 2 0 00-2-2h-2M7 17H5a2 2 0 01-2-2v-5a2 2 0 012-2h2m10-2v4H7v-4m10 8v4H7v-4m10-4H7"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
