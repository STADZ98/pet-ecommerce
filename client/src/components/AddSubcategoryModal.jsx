import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

const AddSubcategoryModal = ({
  categoryId,
  onClose,
  token,
  getSubcategories,
  SUBCATEGORY_API,
}) => {
  const [newSubcategoryName, setNewSubcategoryName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // เปิด modal พร้อม animation
  useEffect(() => {
    setShowModal(true);
  }, []);

  // ปิด modal พร้อม animation
  const handleClose = () => {
    setShowModal(false);
    setTimeout(() => onClose(), 300); // รอ animation จบก่อนปิดจริง
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newSubcategoryName.trim()) {
      return toast.warning("กรุณากรอกชื่อหมวดหมู่ย่อย");
    }
    if (!categoryId) {
      return toast.error("ไม่พบหมวดหมู่หลัก");
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(SUBCATEGORY_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newSubcategoryName.trim(),
          categoryId,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "เกิดข้อผิดพลาด");
      }

      toast.success("เพิ่มหมวดหมู่ย่อยสำเร็จ!");
      setNewSubcategoryName("");
      getSubcategories(token);
      handleClose();
    } catch (err) {
      console.error("เพิ่ม subcategory ล้มเหลว:", err);
      toast.error(`เพิ่มไม่สำเร็จ: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      tabIndex={-1}
      className={`fixed inset-0 flex items-center justify-center z-[1000] bg-black bg-opacity-40 transition-opacity duration-300 ${
        showModal ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={handleClose}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md relative transform transition-transform duration-300 ${
          showModal ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-2 right-4 text-3xl text-gray-400 hover:text-gray-700 focus:outline-none"
          aria-label="ปิด modal"
        >
          &times;
        </button>
        <h2
          id="modal-title"
          className="text-xl font-bold text-center mb-4 text-gray-800"
        >
          เพิ่มหมวดหมู่ย่อย
        </h2>
        <form onSubmit={handleAdd} className="space-y-4">
          <input
            value={newSubcategoryName}
            onChange={(e) => setNewSubcategoryName(e.target.value)}
            type="text"
            placeholder="ชื่อหมวดหมู่ย่อย..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
            aria-required="true"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-2 rounded-lg font-semibold text-white text-lg ${
              isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  ></path>
                </svg>
                กำลังเพิ่ม...
              </span>
            ) : (
              "เพิ่ม"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddSubcategoryModal;
