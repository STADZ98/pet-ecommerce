import React from "react";
import { X, Package, ImageIcon } from "lucide-react";
import { numberFormat } from "../../utils/number";

const ProductDetailModal = ({ selectedProduct, setSelectedProduct }) => {
  if (!selectedProduct) return null;

  const { image, title, price = 0, count = 0, sku } = selectedProduct;

  const copySKU = async () => {
    try {
      await navigator.clipboard.writeText(sku || "");
    } catch {
      // ignore
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl relative overflow-hidden border border-gray-100">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <Package size={18} className="text-indigo-600" />
            <div>
              <div className="text-lg font-semibold text-gray-900">
                รายละเอียดสินค้า
              </div>
              <div className="text-xs text-gray-500">
                ข้อมูลสินค้าและสรุปยอด
              </div>
            </div>
          </div>
          <div>
            <button
              onClick={() => setSelectedProduct(null)}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 flex items-center justify-center">
            <div className="w-48 h-48 rounded-xl bg-gray-50 border overflow-hidden flex items-center justify-center">
              {image ? (
                <img
                  src={image}
                  alt={title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://placehold.co/192x192?text=No+Image";
                  }}
                />
              ) : (
                <ImageIcon size={48} className="text-gray-300" />
              )}
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="flex items-start justify-between">
              <h3 className="text-2xl font-bold text-gray-900 line-clamp-2">
                {title}
              </h3>
              <div className="text-sm text-gray-500">
                SKU:{" "}
                <span className="font-mono text-gray-700">{sku || "-"}</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3 bg-gray-50 border rounded-lg">
                <div className="text-xs text-gray-500">จำนวนขาย</div>
                <div className="text-lg font-bold text-gray-900">
                  {numberFormat(count)} ชิ้น
                </div>
              </div>
              <div className="p-3 bg-gray-50 border rounded-lg">
                <div className="text-xs text-gray-500">ราคาต่อชิ้น</div>
                <div className="text-lg font-bold text-gray-900">
                  {numberFormat(price)} บาท
                </div>
              </div>
              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg">
                <div className="text-xs text-indigo-700">ราคารวม</div>
                <div className="text-lg font-extrabold text-indigo-800">
                  {numberFormat(price * count)} บาท
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={copySKU}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                คัดลอก SKU
              </button>
              <button
                onClick={() => setSelectedProduct(null)}
                className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
