import React from "react";
import { X, Ban, ChevronRight, ChevronLeft } from "lucide-react";

const ReturnProductModal = ({
  isOpen,
  closeModal,
  order,
  handleReturnSubmit,
  selectedReturnProducts,
  setSelectedReturnProducts,
  returnReason,
  setReturnReason,
  customReason,
  setCustomReason,
  returnLoading,
  step,
  setStep,
}) => {
  if (!order) return null;

  const handleCheckboxChange = (productId) => {
    setSelectedReturnProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const isNextStepDisabled = step === 1 && selectedReturnProducts.length === 0;
  const isSubmitDisabled =
    step === 2 &&
    (!returnReason || (returnReason === "อื่น ๆ" && !customReason));

  return (
    <div open={isOpen} onClose={closeModal} className="relative z-[1001]">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        aria-hidden="true"
      />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-3xl max-h-[95vh] overflow-y-auto rounded-[32px] bg-white p-0 shadow-3xl border border-gray-200 animate-fade-in">
          <div className="sticky top-0 z-10 flex justify-between items-center px-10 py-8 border-b bg-gradient-to-r from-red-50 to-white rounded-t-[32px]">
            <div className="flex items-center gap-4">
              <Ban className="text-red-500" size={36} />
              <div className="text-2xl font-bold text-gray-900">
                คืนสินค้า/คืนเงิน
              </div>
            </div>
            <button
              onClick={closeModal}
              className="p-2 rounded-full text-gray-400 hover:bg-red-100 hover:text-red-600 transition-colors"
            >
              <X size={30} />
            </button>
          </div>

          <div className="p-10 space-y-6">
            <div className="flex items-center justify-center gap-2 mb-8">
              <span
                className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                  step >= 1
                    ? "bg-red-500 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                1
              </span>
              <div
                className={`h-1 w-24 rounded-full ${
                  step > 1 ? "bg-red-500" : "bg-gray-200"
                }`}
              />
              <span
                className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                  step >= 2
                    ? "bg-red-500 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                2
              </span>
            </div>

            {step === 1 && (
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  เลือกสินค้าที่ต้องการคืน
                </h3>
                <div className="space-y-4 mt-6">
                  {order.products.map((p) => {
                    const prodId = p.product._id || p.product.id;
                    const isSelected = selectedReturnProducts.includes(prodId);
                    return (
                      <label
                        key={prodId}
                        className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer ${
                          isSelected
                            ? "bg-red-50 border-red-200 shadow-md"
                            : "bg-white border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleCheckboxChange(prodId)}
                          className="h-6 w-6 rounded text-red-600 focus:ring-red-500"
                        />
                        <img
                          src={
                            (p.variant &&
                              ((p.variant.images && p.variant.images[0]?.url) ||
                                (p.variant.images && p.variant.images[0]) ||
                                p.variant.image)) ||
                            (p.product &&
                              ((p.product.images && p.product.images[0]?.url) ||
                                (p.product.images && p.product.images[0]) ||
                                p.product.image)) ||
                            ""
                          }
                          alt={p.variant?.title || p.product.title}
                          className="w-16 h-16 object-cover rounded-md"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">
                            {p.product.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            จำนวน: {p.count}
                          </p>
                        </div>
                        <p className="font-bold text-lg text-red-600">
                          {(p.count * (p.product.price || 0)).toLocaleString()}{" "}
                          ฿
                        </p>
                      </label>
                    );
                  })}
                </div>
                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => setStep(2)}
                    disabled={isNextStepDisabled}
                    className={`px-6 py-3 rounded-full font-bold ${
                      isNextStepDisabled
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-red-500 text-white hover:bg-red-600 shadow-md"
                    }`}
                  >
                    ดำเนินการต่อ{" "}
                    <ChevronRight size={20} className="inline-block ml-1" />
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  ระบุเหตุผลการคืนสินค้า
                </h3>
                <div className="space-y-4 mt-4">
                  {[
                    "สินค้าชำรุด/เสียหาย",
                    "สินค้าไม่ตรงตามคำสั่งซื้อ",
                    "เปลี่ยนใจ",
                    "อื่น ๆ",
                  ].map((reason) => (
                    <label
                      key={reason}
                      className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer ${
                        returnReason === reason
                          ? "bg-red-50 border-red-200 shadow-md"
                          : "bg-white border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="returnReason"
                        checked={returnReason === reason}
                        onChange={() => {
                          setReturnReason(reason);
                          if (reason !== "อื่น ๆ") setCustomReason("");
                        }}
                        className="h-5 w-5 rounded-full text-red-600 focus:ring-red-500"
                      />
                      <span className="font-medium text-gray-800">
                        {reason}
                      </span>
                    </label>
                  ))}
                  {returnReason === "อื่น ๆ" && (
                    <textarea
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      placeholder="โปรดระบุเหตุผลเพิ่มเติม..."
                      className="w-full border rounded-lg p-4 resize-none min-h-[100px] focus:ring-2 focus:ring-red-500 transition-colors"
                    />
                  )}
                </div>
                <div className="flex justify-between mt-6">
                  <button
                    onClick={() => setStep(1)}
                    className="px-6 py-3 rounded-full font-bold transition-colors text-gray-600 hover:text-gray-900 flex items-center gap-1"
                  >
                    <ChevronLeft size={20} /> ย้อนกลับ
                  </button>
                  <button
                    onClick={handleReturnSubmit}
                    disabled={isSubmitDisabled || returnLoading}
                    className={`px-6 py-3 rounded-full font-bold ${
                      isSubmitDisabled || returnLoading
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-red-500 text-white hover:bg-red-600 shadow-md"
                    }`}
                  >
                    {returnLoading ? "กำลังส่งคำขอ..." : "ยืนยันการคืนสินค้า"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnProductModal;
