import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { SquarePen, Delete, List } from "lucide-react";

const ManageSubSubSubcategoriesModal = ({
  subsubcategoryId,
  onClose,
  token,
  SUBSUBSUB_API,
}) => {
  const [newName, setNewName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");

  // Fetch all subsubsubcategories for a subSubcategory
  const fetchItems = useCallback(async () => {
    if (!subsubcategoryId) {
      setItems([]);
      return;
    }
    try {
      const res = await fetch(
        `${SUBSUBSUB_API}?subsubcategoryId=${subsubcategoryId}`
      );
      if (res.ok) {
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      } else {
        setItems([]);
        toast.error("ไม่สามารถโหลดหมวดหมู่ย่อยระดับ 3 ได้");
      }
    } catch (err) {
      setItems([]);
      toast.error("เกิดข้อผิดพลาดในการโหลดหมวดหมู่ย่อยระดับ 3");
    }
  }, [subsubcategoryId, SUBSUBSUB_API]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newName.trim())
      return toast.warning("กรุณากรอกชื่อหมวดหมู่ย่อยระดับ 3");
    if (!subsubcategoryId)
      return toast.error(
        "ไม่พบหมวดหมู่ย่อยระดับ 2 สำหรับเพิ่มหมวดหมู่ย่อยระดับ 3"
      );
    setIsAdding(true);
    try {
      const response = await fetch(SUBSUBSUB_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newName, subsubcategoryId }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add subsubsubcategory");
      }
      toast.success("เพิ่มหมวดหมู่ย่อยระดับ 3 สำเร็จ!");
      setNewName("");
      fetchItems();
    } catch (err) {
      toast.error(`เพิ่มหมวดหมู่ย่อยระดับ 3 ไม่สำเร็จ: ${err.message}`);
    } finally {
      setIsAdding(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setEditingName(item.name);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  const handleSaveEdit = async (item) => {
    if (!editingName.trim()) return toast.warning("กรุณากรอกชื่อใหม่");
    try {
      const response = await fetch(`${SUBSUBSUB_API}/${item.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: editingName }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to update subsubsubcategory"
        );
      }
      toast.success("อัปเดตชื่อหมวดหมู่ย่อยระดับ 3 สำเร็จ!");
      setEditingId(null);
      setEditingName("");
      fetchItems();
    } catch (err) {
      toast.error(`อัปเดตหมวดหมู่ย่อยระดับ 3 ไม่สำเร็จ: ${err.message}`);
    }
  };

  const handleRemove = async (item) => {
    if (!window.confirm("คุณต้องการลบหมวดหมู่ย่อยระดับ 3 นี้ใช่หรือไม่?"))
      return;
    try {
      const response = await fetch(`${SUBSUBSUB_API}/${item.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to delete subsubsubcategory"
        );
      }
      toast.success("ลบหมวดหมู่ย่อยระดับ 3 สำเร็จ!");
      fetchItems();
    } catch (err) {
      toast.error(`ลบหมวดหมู่ย่อยระดับ 3 ไม่สำเร็จ: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1200]">
      <div className="bg-white rounded-xl p-8 min-w-[320px] max-w-[450px] max-h-[80vh] overflow-y-auto shadow-2xl relative">
        <h3 className="text-2xl font-bold mb-6 text-gray-800">
          จัดการหมวดหมู่ย่อยระดับ 3
        </h3>
        <form onSubmit={handleAdd} className="flex gap-3 mb-6">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            type="text"
            placeholder="ชื่อหมวดหมู่ย่อยระดับ 3..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
          />
          <button
            type="submit"
            disabled={isAdding}
            className={`px-6 py-2 rounded-lg font-bold text-white transition-colors duration-200 ${
              isAdding
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
            }`}
            style={{ fontSize: 20 }}
          >
            {isAdding ? "กำลังเพิ่ม..." : "เพิ่ม"}
          </button>
        </form>
        <h4 className="text-lg font-medium text-gray-700 mb-4">
          รายการหมวดหมู่ย่อยระดับ 3
        </h4>
        <ul className="list-none p-0 m-0 space-y-3">
          {items.length === 0 ? (
            <li className="text-gray-500 italic text-center py-3">
              ยังไม่มีหมวดหมู่ย่อยระดับ 3
            </li>
          ) : (
            items.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-2 pb-2 border-b border-dashed border-gray-200 last:border-b-0 last:pb-0"
              >
                <div className="flex items-center gap-2 w-full">
                  <span className="text-base text-gray-700 flex-grow">
                    {item.name}
                  </span>
                  <button
                    onClick={() => toast.info("ดูรายการ (Demo)")}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-lg"
                    title="ดูรายการหมวดหมู่ย่อยระดับ 3"
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    <List size={18} />
                  </button>
                  <button
                    onClick={() => handleEdit(item)}
                    className="px-3 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors text-lg"
                    title="แก้ไขหมวดหมู่ย่อยระดับ 3"
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    <SquarePen size={18} />
                  </button>
                  <button
                    onClick={() => handleRemove(item)}
                    className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-lg"
                    title="ลบหมวดหมู่ย่อยระดับ 3"
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    <Delete size={18} />
                  </button>
                </div>
                {editingId === item.id && (
                  <div className="flex flex-col sm:flex-row flex-grow w-full gap-2 mt-2">
                    <input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 min-w-[100px]"
                    />
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleSaveEdit(item)}
                        className="px-2.5 py-1 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition-colors text-xs"
                      >
                        บันทึก
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-2.5 py-1 bg-gray-500 text-white rounded-md font-medium hover:bg-gray-600 transition-colors text-xs"
                      >
                        ยกเลิก
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))
          )}
        </ul>
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-600 hover:text-gray-900 text-3xl font-light"
          title="ปิด"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default ManageSubSubSubcategoriesModal;
