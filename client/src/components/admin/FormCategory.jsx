import React, { useEffect, useState, useCallback, useReducer } from "react";
import {
  createCategory,
  removeCategory,
  updateCategory,
} from "../../api/category";
import useEcomStore from "../../store/ecom-store";
import { toast, Toaster } from "react-hot-toast"; // เปลี่ยนมาใช้ react-hot-toast
import { SquarePen, Delete, ListPlus, Eye } from "lucide-react";

// Modal Component (จำลอง) - สามารถใช้ library เช่น react-modal หรือ headlessui/react
const ConfirmModal = ({ title, isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-96">
        <h3 className="text-xl font-bold mb-4">{title}</h3>
        <p className="text-gray-700 mb-6">
          คุณต้องการลบหมวดหมู่หลักและหมวดหมู่ย่อยทั้งหมดที่เกี่ยวข้องใช่หรือไม่?
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition"
          >
            ยกเลิก
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 transition"
          >
            ยืนยัน
          </button>
        </div>
      </div>
    </div>
  );
};

// Reducer สำหรับจัดการ State การแก้ไข
const editReducer = (state, action) => {
  switch (action.type) {
    case "START_EDIT":
      return {
        ...state,
        editingId: action.payload.id,
        editingName: action.payload.name,
        editingImage: action.payload.images || "",
        imagePreview: action.payload.images || "",
      };
    case "SET_NAME":
      return { ...state, editingName: action.payload };
    case "SET_IMAGE":
      return {
        ...state,
        editingImage: action.payload.file,
        imagePreview: action.payload.preview,
      };
    case "CANCEL_EDIT":
      return {
        editingId: null,
        editingName: "",
        editingImage: "",
        imagePreview: "",
      };
    case "RESET":
      return {
        editingId: null,
        editingName: "",
        editingImage: "",
        imagePreview: "",
      };
    default:
      return state;
  }
};

const FormCategory = () => {
  const token = useEcomStore((state) => state.token);
  const categories = useEcomStore((state) => state.categories);
  const getCategory = useEcomStore((state) => state.getCategory);

  const [categoryName, setCategoryName] = useState("");
  const [categoryImage, setCategoryImage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryIdToDelete, setCategoryIdToDelete] = useState(null);

  const [editState, dispatch] = useReducer(editReducer, {
    editingId: null,
    editingName: "",
    editingImage: "",
    imagePreview: "",
  });

  const { editingId, editingName, editingImage, imagePreview } = editState;

  // โหลดข้อมูลหมวดหมู่หลัก
  useEffect(() => {
    if (token) {
      getCategory(token);
    }
  }, [token, getCategory]);

  // ฟังก์ชันเพิ่มหมวดหมู่หลัก
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) return toast.error("กรุณากรอกชื่อหมวดหมู่");

    setIsLoading(true);
    try {
      const res = await createCategory(token, {
        name: categoryName,
        images: categoryImage || "",
      });
      toast.success(`เพิ่มหมวดหมู่ "${res.data.name}" สำเร็จ!`);
      setCategoryName("");
      setCategoryImage("");
      getCategory(token);
    } catch (error) {
      toast.error(
        `เพิ่มหมวดหมู่ไม่สำเร็จ: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ฟังก์ชันแก้ไขหมวดหมู่หลัก
  const handleSaveEdit = async () => {
    if (!editingName.trim()) return toast.error("กรุณากรอกชื่อใหม่");
    setIsLoading(true);

    try {
      let imageData = editingImage;
      // Convert file to base64 if it's a new file
      if (editingImage && typeof editingImage === "object") {
        imageData = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(editingImage);
        });
      }

      const res = await updateCategory(token, editingId, {
        name: editingName,
        images: imageData,
      });
      toast.success(`แก้ไขหมวดหมู่เป็น "${res.data.name}" สำเร็จ`);
      getCategory(token);
      dispatch({ type: "RESET" });
    } catch (error) {
      toast.error(
        `แก้ไขหมวดหมู่ไม่สำเร็จ: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ฟังก์ชันลบหมวดหมู่หลัก
  const handleDeleteCategory = (id) => {
    setCategoryIdToDelete(id);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const res = await removeCategory(token, categoryIdToDelete);
      toast.success(`ลบหมวดหมู่ "${res.data.name}" สำเร็จ`);
      getCategory(token);
    } catch (error) {
      toast.error(
        `ลบหมวดหมู่ไม่สำเร็จ: ${error.response?.data?.message || error.message}`
      );
    } finally {
      setIsModalOpen(false);
      setCategoryIdToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <Toaster />
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-extrabold mb-8 text-center text-gray-800">
          จัดการหมวดหมู่สินค้า
        </h1>

        {/* ฟอร์มเพิ่มหมวดหมู่หลัก */}
        <div className="bg-gray-50 p-6 rounded-xl shadow-inner mb-10">
          <h2 className="text-xl font-bold mb-4 text-gray-700">
            เพิ่มหมวดหมู่หลัก
          </h2>
          <form
            onSubmit={handleAddCategory}
            className="flex flex-col md:flex-row items-center gap-4"
            aria-label="ฟอร์มเพิ่มหมวดหมู่หลัก"
          >
            <div className="flex-1 w-full flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                placeholder="ชื่อหมวดหมู่หลัก"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-lg"
                disabled={isLoading}
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setCategoryImage(reader.result);
                    };
                    reader.readAsDataURL(file);
                  } else {
                    setCategoryImage("");
                  }
                }}
                disabled={isLoading}
                className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition border border-gray-300 rounded-lg"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-blue-600 text-white font-bold text-lg transition shrink-0 ${
                isLoading
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:bg-blue-700"
              }`}
            >
              <ListPlus size={24} />
              {isLoading ? "กำลังเพิ่ม..." : "เพิ่มหมวดหมู่"}
            </button>
          </form>
          {categoryImage && (
            <div className="mt-4">
              <span className="text-sm text-gray-600">พรีวิวรูปภาพ:</span>
              <img
                src={categoryImage}
                alt="preview"
                className="mt-2 w-32 h-32 object-cover rounded-xl border-2 border-gray-300 shadow-md"
              />
            </div>
          )}
        </div>

        {/* ตารางหมวดหมู่หลัก */}
        {categories.length === 0 ? (
          <p className="text-center text-gray-500 italic py-10">
            ยังไม่มีหมวดหมู่หลักในระบบ
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl shadow-sm border border-gray-200">
            <table className="w-full table-auto">
              <thead className="bg-gray-100">
                <tr className="text-left text-gray-600">
                  <th className="px-6 py-4 font-semibold">ชื่อหมวดหมู่หลัก</th>
                  <th className="px-6 py-4 font-semibold">รูปภาพ</th>
                  <th className="px-6 py-4 font-semibold text-center w-64">
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr
                    key={cat.id}
                    className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-4 align-middle text-gray-800">
                      {editingId === cat.id ? (
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) =>
                            dispatch({
                              type: "SET_NAME",
                              payload: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          autoFocus
                        />
                      ) : (
                        <span className="font-medium">{cat.name}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 align-middle">
                      {editingId === cat.id ? (
                        <div className="flex items-center gap-4">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  dispatch({
                                    type: "SET_IMAGE",
                                    payload: { file, preview: reader.result },
                                  });
                                };
                                reader.readAsDataURL(file);
                              } else {
                                dispatch({
                                  type: "SET_IMAGE",
                                  payload: { file: null, preview: "" },
                                });
                              }
                            }}
                            className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition"
                          />
                          {imagePreview && (
                            <img
                              src={imagePreview}
                              alt="edit preview"
                              className="w-24 h-24 object-cover rounded-xl border shadow-md"
                            />
                          )}
                        </div>
                      ) : cat.images ? (
                        <img
                          src={cat.images}
                          alt={cat.name}
                          className="w-24 h-24 object-cover rounded-xl shadow-sm"
                        />
                      ) : (
                        <span className="text-gray-400 text-sm">
                          - ไม่มีรูปภาพ -
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 align-middle">
                      {editingId === cat.id ? (
                        <div className="flex flex-col sm:flex-row justify-center gap-2">
                          <button
                            onClick={handleSaveEdit}
                            disabled={isLoading}
                            className={`px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium ${
                              isLoading ? "opacity-60 cursor-not-allowed" : ""
                            }`}
                          >
                            บันทึก
                          </button>
                          <button
                            onClick={() => dispatch({ type: "CANCEL_EDIT" })}
                            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition font-medium"
                          >
                            ยกเลิก
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col sm:flex-row justify-center gap-2">
                          <button
                            onClick={() =>
                              dispatch({ type: "START_EDIT", payload: cat })
                            }
                            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition flex items-center justify-center gap-1 font-medium"
                            title="แก้ไขชื่อและรูปภาพหมวดหมู่หลัก"
                          >
                            <SquarePen size={18} />
                            แก้ไข
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat.id)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-1 font-medium"
                            title="ลบหมวดหมู่หลัก"
                          >
                            <Delete size={18} />
                            ลบ
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <ConfirmModal
        title="ยืนยันการลบ"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default FormCategory;
