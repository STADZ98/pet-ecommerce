import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { SquarePen, Delete, ListPlus } from "lucide-react";

const ManageSubcategoriesModal = ({
  category,
  subcategories,
  onClose,
  onOpenSubSubModal,
  token,
  getSubcategories,
  SUBCATEGORY_API,
  SUBSUB_API,
}) => {
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [counts, setCounts] = useState({});
  const [showModal, setShowModal] = useState(false);

  const modalRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setShowModal(true);
  }, []);

  // Focus input เมื่อเข้า edit mode
  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingId]);

  // โหลดจำนวน sub-subcategories
  useEffect(() => {
    const loadCounts = async () => {
      const results = {};
      const targetSubs = subcategories.filter(
        (s) => s.categoryId === category.id
      );
      for (const sub of targetSubs) {
        try {
          const res = await fetch(`${SUBSUB_API}?subcategoryId=${sub.id}`);
          const data = await res.json();
          results[sub.id] = Array.isArray(data) ? data.length : 0;
        } catch (err) {
          console.error(err);
          results[sub.id] = 0;
        }
      }
      setCounts(results);
    };

    loadCounts();
  }, [category.id, subcategories, SUBSUB_API]);

  // ปิด modal พร้อม animation
  const handleClose = () => {
    setShowModal(false);
    setTimeout(() => {
      onClose();
      setEditingId(null);
      setEditingName("");
    }, 300);
  };

  // กด ESC ปิด modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // กด tab ควบคุมโฟกัสให้อยู่ใน modal (Focus trap เบื้องต้น)
  useEffect(() => {
    const focusableElementsString =
      "a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, *[tabindex], *[contenteditable]";
    const modalNode = modalRef.current;
    if (!modalNode) return;

    const focusableElements = modalNode.querySelectorAll(
      focusableElementsString
    );
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    const handleTab = (e) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    };

    modalNode.addEventListener("keydown", handleTab);
    return () => modalNode.removeEventListener("keydown", handleTab);
  }, [showModal]);

  const handleEdit = (sub) => {
    setEditingId(sub.id);
    setEditingName(sub.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  const saveEdit = async (subId) => {
    if (!editingName.trim()) {
      return toast.warning("กรุณากรอกชื่อใหม่");
    }
    try {
      const res = await fetch(`${SUBCATEGORY_API}/${subId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: editingName }),
      });

      if (!res.ok) throw new Error("แก้ไขไม่สำเร็จ");

      toast.success("แก้ไขหมวดหมู่ย่อยสำเร็จ!");
      cancelEdit();
      getSubcategories(token);
    } catch (err) {
      toast.error(err.message || "เกิดข้อผิดพลาด");
    }
  };

  const handleDelete = async (subId) => {
    if (!window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบ?")) return;
    try {
      const res = await fetch(`${SUBCATEGORY_API}/${subId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("ลบไม่สำเร็จ");

      toast.success("ลบสำเร็จ");
      getSubcategories(token);
    } catch (err) {
      toast.error(err.message || "เกิดข้อผิดพลาด");
    }
  };

  const filteredSubs = subcategories.filter(
    (s) => s.categoryId === category.id
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      tabIndex={-1}
      className={`fixed inset-0 flex items-center justify-center z-[1100] bg-black bg-opacity-40 transition-opacity duration-300 ${
        showModal ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={handleClose}
    >
      <div
        ref={modalRef}
        className={`bg-white rounded-2xl shadow-lg p-6 w-full max-w-xl relative transform transition-transform duration-300 ${
          showModal ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-4 text-2xl text-gray-500 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          aria-label="ปิด modal"
        >
          &times;
        </button>

        {/* Title */}
        <h2 id="modal-title" className="text-xl font-bold text-center mb-4">
          หมวดหมู่ย่อยใน "{category.name}"
        </h2>

        {/* No subcategories */}
        {filteredSubs.length === 0 ? (
          <p className="text-center text-gray-400 italic">
            ยังไม่มีหมวดหมู่ย่อย
          </p>
        ) : (
          <ul className="space-y-3">
            {filteredSubs.map((sub) => (
              <li
                key={sub.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg"
              >
                {editingId === sub.id ? (
                  <div className="flex flex-col sm:flex-row flex-grow gap-2 w-full">
                    <input
                      ref={inputRef}
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="flex-1 border border-gray-300 rounded px-3 py-1"
                      aria-label={`แก้ไขชื่อหมวดหมู่ย่อย ${sub.name}`}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveEdit(sub.id)}
                        className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        บันทึก
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="bg-gray-500 text-white px-4 py-1 rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400"
                      >
                        ยกเลิก
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row flex-grow justify-between items-start sm:items-center gap-2 w-full">
                    <div>
                      <div className="font-medium">{sub.name}</div>
                      <div className="text-xs text-gray-500">
                        หมวดย่อยระดับ 2: {counts[sub.id] || 0}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2 sm:mt-0">
                      <button
                        onClick={() => handleEdit(sub)}
                        className="bg-orange-500 text-white p-2 rounded hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400"
                        title="แก้ไข"
                      >
                        <SquarePen size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(sub.id)}
                        className="bg-red-500 text-white p-2 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                        title="ลบ"
                      >
                        <Delete size={16} />
                      </button>
                      <button
                        onClick={() => onOpenSubSubModal(sub.id)}
                        className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        title="เพิ่ม/ดูระดับ 2"
                      >
                        <ListPlus size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ManageSubcategoriesModal;
