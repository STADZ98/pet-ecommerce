import React, { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-toastify";
import { SquarePen, Delete, List } from "lucide-react";

const ManageSubSubcategoriesModal = ({
  subcategoryId,
  onClose,
  token,
  SUBSUB_API,
  onOpenSubSubSubModal,
}) => {
  const [newSubSubcategoryName, setNewSubSubcategoryName] = useState("");
  const [isSubSubcatAdding, setIsSubSubcatAdding] = useState(false);
  const [subSubcategories, setSubSubcategories] = useState([]);
  const [editingSubSubcategoryId, setEditingSubSubcategoryId] = useState(null);
  const [editingSubSubcategoryName, setEditingSubSubcategoryName] =
    useState("");
  const [showModal, setShowModal] = useState(false);

  const modalRef = useRef(null);
  const inputRef = useRef(null);

  const [categoryName, setCategoryName] = useState("");
  const fetchSubSubcategories = useCallback(async () => {
    if (!subcategoryId) {
      setSubSubcategories([]);
      setCategoryName("");
      return;
    }
    try {
      const res = await fetch(`${SUBSUB_API}?subcategoryId=${subcategoryId}`);
      if (res.ok) {
        const data = await res.json();
        setSubSubcategories(Array.isArray(data) ? data : []);
        // ดึงชื่อ category จาก subsubcategory (ถ้ามีข้อมูล)
        if (
          Array.isArray(data) &&
          data.length > 0 &&
          data[0].subcategory &&
          data[0].subcategory.category
        ) {
          setCategoryName(data[0].subcategory.category.name);
        } else {
          setCategoryName("");
        }
      } else {
        setSubSubcategories([]);
        setCategoryName("");
        toast.error("ไม่สามารถโหลดหมวดหมู่ย่อยระดับ 2 ได้");
      }
    } catch (err) {
      console.error("Error fetching sub-subcategories:", err);
      setSubSubcategories([]);
      setCategoryName("");
      toast.error("เกิดข้อผิดพลาดในการโหลดหมวดหมู่ย่อยระดับ 2");
    }
  }, [subcategoryId, SUBSUB_API]);

  useEffect(() => {
    fetchSubSubcategories();
    setShowModal(true);
  }, [fetchSubSubcategories]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (editingSubSubcategoryId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingSubSubcategoryId]);

  // Close modal with ESC and handle Enter/ESC in edit input
  useEffect(() => {
    const onKeyDown = (e) => {
      if (editingSubSubcategoryId) {
        if (e.key === "Enter") {
          // Find the editing item
          const ss = subSubcategories.find(
            (s) => s.id === editingSubSubcategoryId
          );
          if (ss) handleSaveSubSubcategoryEdit(ss);
        }
        if (e.key === "Escape") {
          handleCancelSubSubcategoryEdit();
        }
      } else if (e.key === "Escape") {
        handleClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [editingSubSubcategoryId, subSubcategories]);

  // Handle close with animation
  const handleClose = () => {
    setShowModal(false);
    setTimeout(() => {
      onClose();
      setEditingSubSubcategoryId(null);
      setEditingSubSubcategoryName("");
    }, 300); // Match animation duration
  };

  // Prevent modal content click closing modal
  const onModalClick = (e) => e.stopPropagation();

  // (ส่วน handleAddSubSubcategory, handleEditSubSubcategory, save, delete เหมือนเดิม)

  // เพิ่มการ ref ที่ input ใน edit mode
  const handleEditSubSubcategory = (ss) => {
    setEditingSubSubcategoryId(ss.id);
    setEditingSubSubcategoryName(ss.name);
  };

  const handleCancelSubSubcategoryEdit = () => {
    setEditingSubSubcategoryId(null);
    setEditingSubSubcategoryName("");
  };

  const handleSaveSubSubcategoryEdit = async (ss) => {
    if (!editingSubSubcategoryName.trim()) {
      return toast.warning("กรุณากรอกชื่อใหม่");
    }
    try {
      const response = await fetch(`${SUBSUB_API}/${ss.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editingSubSubcategoryName,
          subcategoryId: ss.subcategoryId, // ✅ ส่ง subcategoryId ไปด้วย
        }),
      });
      if (!response.ok) {
        let errorData = {};
        try {
          errorData = await response.json();
        } catch {}
        throw new Error(errorData.message || "Failed to update subsubcategory");
      }
      toast.success("อัปเดตชื่อหมวดหมู่ย่อยระดับ 2 สำเร็จ!");
      setEditingSubSubcategoryId(null);
      setEditingSubSubcategoryName("");
      fetchSubSubcategories();
    } catch (err) {
      toast.error(`อัปเดตหมวดหมู่ย่อยระดับ 2 ไม่สำเร็จ: ${err.message}`);
    }
  };

  const handleRemoveSubSubcategory = async (ss) => {
    if (!window.confirm("คุณต้องการลบหมวดหมู่ย่อยระดับ 2 นี้ใช่หรือไม่?"))
      return;
    // Debug: log id and URL
    console.log(
      "Trying to delete subsubcategory id:",
      ss.id,
      "URL:",
      `${SUBSUB_API}/${ss.id}`
    );
    try {
      const response = await fetch(`${SUBSUB_API}/${ss.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        if (response.status === 404) {
          toast.error("ไม่พบหมวดหมู่ย่อยระดับ 2 ที่ต้องการลบ (404 Not Found)");
          return;
        }
        let errorData = {};
        try {
          errorData = await response.json();
        } catch {}
        throw new Error(errorData.message || "Failed to delete subsubcategory");
      }
      toast.success("ลบหมวดหมู่ย่อยระดับ 2 สำเร็จ!");
      fetchSubSubcategories();
    } catch (err) {
      toast.error(`ลบหมวดหมู่ย่อยระดับ 2 ไม่สำเร็จ: ${err.message}`);
    }
  };

  const handleAddSubSubcategory = async (e) => {
    e.preventDefault();

    if (!newSubSubcategoryName.trim()) {
      return toast.warning("กรุณากรอกชื่อหมวดหมู่ย่อยระดับ 2");
    }

    if (!subcategoryId) {
      return toast.error("ไม่พบหมวดหมู่ย่อยสำหรับการเพิ่มหมวดหมู่ย่อยระดับ 2");
    }

    setIsSubSubcatAdding(true);

    try {
      const response = await fetch(SUBSUB_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newSubSubcategoryName.trim(),
          subcategoryId: subcategoryId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add subsubcategory");
      }

      toast.success("เพิ่มหมวดหมู่ย่อยระดับ 2 สำเร็จ!");
      setNewSubSubcategoryName("");
      fetchSubSubcategories(); // โหลดข้อมูลใหม่หลังเพิ่ม
    } catch (err) {
      toast.error(`เพิ่มหมวดหมู่ย่อยระดับ 2 ไม่สำเร็จ: ${err.message}`);
    } finally {
      setIsSubSubcatAdding(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      tabIndex={-1}
      className={`fixed inset-0 flex items-center justify-center z-[1200] bg-black bg-opacity-50 transition-opacity duration-300 ${
        showModal ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={handleClose}
    >
      <div
        ref={modalRef}
        className={`bg-white rounded-xl p-8 min-w-[320px] max-w-[450px] max-h-[80vh] overflow-y-auto shadow-2xl relative transform transition-transform duration-300 ${
          showModal ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"
        }`}
        onClick={onModalClick}
      >
        <h3
          id="modal-title"
          className="text-xl font-semibold mb-2 text-gray-800"
        >
          {categoryName ? `หมวดหมู่หลัก: ${categoryName}` : "หมวดหมู่หลัก"}
        </h3>
        <div className="mb-4 text-base text-gray-600 font-medium">
          จัดการหมวดหมู่ย่อยระดับ 2gnfnfgn
        </div>
        <form onSubmit={handleAddSubSubcategory} className="flex gap-3 mb-6">
          <input
            value={newSubSubcategoryName}
            onChange={(e) => setNewSubSubcategoryName(e.target.value)}
            type="text"
            placeholder="ชื่อหมวดหมู่ย่อยระดับ 2..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
          />
          <button
            type="submit"
            disabled={isSubSubcatAdding}
            className={`px-5 py-2 rounded-lg font-bold text-white transition-colors duration-200 ${
              isSubSubcatAdding
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
            }`}
          >
            {isSubSubcatAdding ? "กำลังเพิ่ม..." : "เพิ่ม"}
          </button>
        </form>

        <h4 className="text-lg font-medium text-gray-700 mb-4">
          รายการหมวดหมู่ย่อยระดับ 2
        </h4>
        <ul className="list-none p-0 m-0 space-y-3">
          {subSubcategories.length === 0 ? (
            <li className="text-gray-500 italic text-center py-3">
              ยังไม่มีหมวดหมู่ย่อยระดับ 2
            </li>
          ) : (
            subSubcategories.map((ss) => (
              <li
                key={ss.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-dashed border-gray-200 last:border-b-0 last:pb-0"
              >
                {editingSubSubcategoryId === ss.id ? (
                  <div className="flex flex-col sm:flex-row flex-grow w-full gap-2">
                    <input
                      ref={inputRef}
                      value={editingSubSubcategoryName}
                      onChange={(e) =>
                        setEditingSubSubcategoryName(e.target.value)
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveSubSubcategoryEdit(ss);
                        if (e.key === "Escape")
                          handleCancelSubSubcategoryEdit();
                      }}
                      className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 min-w-[100px]"
                      aria-label="แก้ไขชื่อหมวดหมู่ย่อยระดับ 2"
                    />
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleSaveSubSubcategoryEdit(ss)}
                        className="px-2.5 py-1 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition-colors text-xs"
                      >
                        บันทึก
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelSubSubcategoryEdit}
                        className="px-2.5 py-1 bg-gray-500 text-white rounded-md font-medium hover:bg-gray-600 transition-colors text-xs"
                      >
                        ยกเลิก
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <span className="text-base text-gray-700 flex-grow">
                      {ss.name}
                    </span>
                    <div className="flex gap-1.5 justify-end">
                      <button
                        onClick={() => handleEditSubSubcategory(ss)}
                        className="px-2.5 py-1.5 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors text-sm"
                        title="แก้ไขหมวดหมู่ย่อยระดับ 2"
                      >
                        <SquarePen size={14} />
                      </button>
                      <button
                        onClick={() => handleRemoveSubSubcategory(ss)}
                        className="px-2.5 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm"
                        title="ลบหมวดหมู่ย่อยระดับ 2"
                      >
                        <Delete size={14} />
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))
          )}
        </ul>
        <button
          onClick={handleClose}
          className="absolute top-3 right-4 text-gray-600 hover:text-gray-900 text-3xl font-light"
          title="ปิด"
          aria-label="ปิด modal"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default ManageSubSubcategoriesModal;
