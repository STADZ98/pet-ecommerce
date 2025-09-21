import React, { useEffect, useState, useReducer } from "react";
import useEcomStore from "../../store/ecom-store";
import { toast, Toaster } from "react-hot-toast";
import { Plus, SquarePen, Delete, Loader2 } from "lucide-react";

// Reducer for managing editing state
const editReducer = (state, action) => {
  switch (action.type) {
    case "START_EDIT":
      return {
        id: action.payload.id,
        name: action.payload.name,
        image: action.payload.images || "",
        imagePreview: action.payload.images || "",
      };
    case "SET_NAME":
      return { ...state, name: action.payload };
    case "SET_IMAGE":
      return {
        ...state,
        image: action.payload.file,
        imagePreview: action.payload.preview,
      };
    case "CANCEL_EDIT":
      return { id: null, name: "", image: "", imagePreview: "" };
    case "RESET":
      return { id: null, name: "", image: "", imagePreview: "" };
    default:
      return state;
  }
};

const API = import.meta.env.VITE_API || "http://localhost:5005/api";

const SubCategoryPage = () => {
  const token = useEcomStore((state) => state.token);
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryIdToDelete, setCategoryIdToDelete] = useState(null);

  const [editState, dispatch] = useReducer(editReducer, {
    id: null,
    name: "",
    image: "",
    imagePreview: "",
  });

  // Fetch all categories and subcategories
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [categoriesRes, subcategoriesRes] = await Promise.all([
          fetch(`${API}/category`),
          fetch(`${API}/subcategory`),
        ]);
        const categoriesData = await categoriesRes.json();
        const subcategoriesData = await subcategoriesRes.json();
        setCategories(categoriesData);
        setSubcategories(subcategoriesData);
      } catch (err) {
        toast.error("ไม่สามารถโหลดข้อมูลได้");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handle file change for new subcategory
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setImagePreview("");
    }
  };

  // Handle submit for adding a new subcategory
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !categoryId) {
      toast.error("กรุณากรอกชื่อและเลือกหมวดหมู่หลัก");
      return;
    }
    setIsLoading(true);
    try {
      let imageBase64 = "";
      if (imageFile) {
        imageBase64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(imageFile);
        });
      }
      const res = await fetch(`${API}/subcategory`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : undefined,
        },
        body: JSON.stringify({
          name: name.trim(),
          categoryId,
          images: imageBase64,
        }),
      });
      if (!res.ok)
        throw new Error((await res.json()).message || "เกิดข้อผิดพลาด");
      toast.success("เพิ่มหมวดหมู่ย่อยสำเร็จ");
      setName("");
      setCategoryId("");
      setImageFile(null);
      setImagePreview("");
      // Refresh subcategory list
      const updatedSubcategories = await fetch(`${API}/subcategory`).then(
        (res) => res.json()
      );
      setSubcategories(updatedSubcategories);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle save edit for a subcategory
  const handleSaveEdit = async () => {
    if (!editState.name.trim() || !categoryId) {
      toast.error("กรุณากรอกชื่อและเลือกหมวดหมู่หลัก");
      return;
    }
    setIsLoading(true);
    try {
      let imageData = editState.image;
      if (editState.image && editState.image instanceof File) {
        imageData = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(editState.image);
        });
      }

      const res = await fetch(`${API}/subcategory/${editState.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : undefined,
        },
        body: JSON.stringify({
          name: editState.name.trim(),
          categoryId,
          images: imageData,
        }),
      });
      if (!res.ok)
        throw new Error((await res.json()).message || "เกิดข้อผิดพลาด");
      toast.success("แก้ไขสำเร็จ");
      dispatch({ type: "RESET" });
      const updatedSubcategories = await fetch(`${API}/subcategory`).then(
        (res) => res.json()
      );
      setSubcategories(updatedSubcategories);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete
  const handleDelete = (id) => {
    setCategoryIdToDelete(id);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`${API}/subcategory/${categoryIdToDelete}`, {
        method: "DELETE",
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });
      if (!res.ok)
        throw new Error((await res.json()).message || "เกิดข้อผิดพลาด");
      toast.success("ลบสำเร็จ");
      // Refresh subcategory list
      const updatedSubcategories = await fetch(`${API}/subcategory`).then(
        (res) => res.json()
      );
      setSubcategories(updatedSubcategories);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsDeleting(false);
      setIsModalOpen(false);
    }
  };

  if (isLoading && subcategories.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <Loader2 className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <Toaster />
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-extrabold mb-8 text-center text-gray-800">
          จัดการหมวดหมู่ย่อย
        </h1>

        {/* Add Subcategory Form */}
        <div className="bg-gray-50 p-6 rounded-xl shadow-inner mb-10">
          <h2 className="text-xl font-bold mb-4 text-gray-700">
            เพิ่มหมวดหมู่ย่อย
          </h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                ชื่อหมวดหมู่ย่อย
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                placeholder="ชื่อหมวดหมู่ย่อย"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                หมวดหมู่หลัก
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">เลือกหมวดหมู่หลัก</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                รูปภาพ (ถ้ามี)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition border border-gray-300 rounded-lg"
              />
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="preview"
                  className="mt-4 w-32 h-32 object-cover rounded-xl border-2 border-gray-300 shadow-md"
                />
              )}
            </div>
            <button
              type="submit"
              className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-blue-600 text-white font-bold text-lg transition ${
                isLoading
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:bg-blue-700"
              }`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  กำลังบันทึก...
                </>
              ) : (
                <>
                  <Plus size={24} />
                  บันทึกหมวดหมู่ย่อย
                </>
              )}
            </button>
          </form>
        </div>

        {/* Subcategory Table */}
        <h3 className="text-xl font-bold mt-8 mb-4 text-gray-800">
          รายการหมวดหมู่ย่อยทั้งหมด
        </h3>
        {subcategories.length === 0 ? (
          <p className="text-center text-gray-500 italic py-10">
            ยังไม่มีหมวดหมู่ย่อยในระบบ
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl shadow-sm border border-gray-200">
            <table className="w-full table-auto">
              <thead className="bg-gray-100">
                <tr className="text-left text-gray-600">
                  <th className="px-6 py-4 font-semibold">ชื่อ</th>
                  <th className="px-6 py-4 font-semibold">รูปภาพ</th>
                  <th className="px-6 py-4 font-semibold">หมวดหมู่หลัก</th>
                  <th className="px-6 py-4 font-semibold text-center w-56">
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody>
                {subcategories.map((sub) => (
                  <tr
                    key={sub.id}
                    className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-4 align-middle text-gray-800">
                      {editState.id === sub.id ? (
                        <input
                          type="text"
                          value={editState.name}
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
                        <span className="font-medium">{sub.name}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 align-middle">
                      {editState.id === sub.id ? (
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
                          {editState.imagePreview && (
                            <img
                              src={editState.imagePreview}
                              alt="edit preview"
                              className="w-24 h-24 object-cover rounded-xl border shadow-md"
                            />
                          )}
                        </div>
                      ) : sub.images ? (
                        <img
                          src={sub.images}
                          alt={sub.name}
                          className="w-24 h-24 object-cover rounded-xl shadow-sm"
                        />
                      ) : (
                        <span className="text-gray-400 text-sm">
                          - ไม่มีรูปภาพ -
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 align-middle">
                      {sub.category?.name || (
                        <span className="text-gray-400">- ไม่ระบุ -</span>
                      )}
                    </td>
                    <td className="px-6 py-4 align-middle">
                      {editState.id === sub.id ? (
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
                              dispatch({ type: "START_EDIT", payload: sub })
                            }
                            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition flex items-center justify-center gap-1 font-medium"
                            title="แก้ไขหมวดหมู่ย่อย"
                          >
                            <SquarePen size={18} />
                            แก้ไข
                          </button>
                          <button
                            onClick={() => handleDelete(sub.id)}
                            disabled={isDeleting}
                            className={`px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-1 font-medium ${
                              isDeleting ? "opacity-60 cursor-not-allowed" : ""
                            }`}
                            title="ลบหมวดหมู่ย่อย"
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

      {/* Delete Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96 text-center">
            <h3 className="text-xl font-bold mb-4">ยืนยันการลบ</h3>
            <p className="text-gray-700 mb-6">
              คุณต้องการลบหมวดหมู่ย่อยนี้ใช่หรือไม่?
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition"
                disabled={isDeleting}
              >
                ยกเลิก
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 transition"
                disabled={isDeleting}
              >
                {isDeleting ? "กำลังลบ..." : "ยืนยัน"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubCategoryPage;
