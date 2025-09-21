import React from "react";
import { Tag, Image } from "lucide-react";
import { numberFormat } from "../../../utils/number";

export default function ProductDetailModal({ viewProduct, setViewProduct }) {
  if (!viewProduct) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Tag className="w-5 h-5 text-indigo-500" /> รายละเอียดสินค้า
          </h2>
          <button
            onClick={() => setViewProduct(null)}
            className="text-gray-500 hover:text-red-500 text-2xl font-bold transition-transform duration-200 hover:rotate-90"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto bg-white">
          <div className="flex flex-col items-center text-center">
            {viewProduct.variant?.image ||
            viewProduct.variant?.images?.[0]?.url ||
            viewProduct.images?.[0]?.url ||
            viewProduct.images?.[0] ||
            viewProduct.image ||
            viewProduct.imageUrl ? (
              <img
                src={
                  viewProduct.variant?.image ||
                  (viewProduct.variant?.images &&
                    (viewProduct.variant.images[0]?.url ||
                      viewProduct.variant.images[0])) ||
                  (viewProduct.images &&
                    (viewProduct.images[0]?.url || viewProduct.images[0])) ||
                  viewProduct.image ||
                  viewProduct.imageUrl
                }
                alt={viewProduct.title || viewProduct.variant?.title}
                className="w-40 h-40 object-contain rounded-md border border-gray-200 shadow mb-3"
              />
            ) : (
              <div className="w-40 h-40 bg-gray-100 rounded-md flex items-center justify-center text-gray-300 border border-gray-200 shadow mb-3">
                <Image className="w-10 h-10" />
              </div>
            )}
            <h3 className="text-lg font-bold text-gray-800">
              {viewProduct.title}
            </h3>
            <p className="text-green-600 font-medium text-base mt-1">
              <span className="text-lg font-semibold">ราคา: </span>
              {numberFormat(viewProduct.price)} บาท
            </p>
          </div>

          <div className="space-y-3 text-sm text-gray-700">
            <div>
              <span className="font-medium text-gray-600">คำอธิบาย: </span>
              <span>{viewProduct.description || "ไม่มีคำอธิบาย"}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">หมวดหมู่: </span>
              <span>{viewProduct.category?.name || "-"}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">รหัสสินค้า: </span>
              <span>{viewProduct.id || "-"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
