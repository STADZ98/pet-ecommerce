import React, { useEffect, useState } from "react";
import axios from "axios";
import useEcomStore from "../../store/ecom-store";
import { toast } from "react-toastify";
import { SquarePen, Delete, ListPlus } from "lucide-react";
import { useLocation } from "react-router-dom";

const API = import.meta.env.VITE_API || "http://localhost:5000/api";

const FormSubcategory = () => {
  const token = useEcomStore((state) => state.token);
  const categories = useEcomStore((state) => state.categories);
  const getCategory = useEcomStore((state) => state.getCategory);
  const getSubcategories = useEcomStore((state) => state.getSubcategories);

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const defaultCategoryId = params.get("categoryId");

  const [subcategories, setSubcategories] = useState([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState(defaultCategoryId || "");
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState("");

  useEffect(() => {
    if (token) getCategory(token);
  }, [token, getCategory]);

  // โหลด subcategories ทั้งหมดจาก backend (ไม่ใช้ getSubcategories จาก store เพราะไม่ได้ setSubcategories)
  useEffect(() => {
    fetchSubcategories();
    // eslint-disable-next-line
  }, [token]);

  const fetchSubcategories = async () => {
    try {
      const res = await axios.get(`${API}/subcategory`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubcategories(res.data);
    } catch (err) {
      toast.error("โหลดหมวดหมู่ย่อยไม่สำเร็จ");
    }
  };

  // Filter subcategories by selected categoryId (debug log added)
  useEffect(() => {
    if (!categoryId) {
      setFilteredSubcategories([]);
      return;
    }
    // Debug log
    // console.log('subcategories:', subcategories, 'categoryId:', categoryId);
    setFilteredSubcategories(
      subcategories.filter((item) => {
        // Some backend may return categoryId as number or string, so compare both ways
        return (
          String(item.categoryId) === String(categoryId) ||
          item.category?.id === Number(categoryId)
        );
      })
    );
  }, [categoryId, subcategories]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !categoryId)
      return toast.warning("กรุณากรอกชื่อและเลือกหมวดหมู่หลัก");
    setIsLoading(true);
    try {
      await axios.post(
        `${API}/subcategory`,
        { name, categoryId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("เพิ่มหมวดหมู่ย่อยสำเร็จ!");
      setName("");
      // ไม่ต้อง reset categoryId เพื่อให้เลือกหมวดหมู่หลักเดิม
      fetchSubcategories();
    } catch (err) {
      toast.error("เพิ่มหมวดหมู่ย่อยไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (id) => {
    if (!window.confirm("คุณต้องการลบหมวดหมู่ย่อยนี้ใช่หรือไม่?")) return;
    try {
      await axios.delete(`${API}/subcategory/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("ลบหมวดหมู่ย่อยแล้ว");
      fetchSubcategories();
    } catch (err) {
      toast.error("ลบหมวดหมู่ย่อยไม่สำเร็จ");
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setEditingName(item.name);
    setEditingCategoryId(item.categoryId);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName("");
    setEditingCategoryId("");
  };

  const handleSaveEdit = async () => {
    if (!editingName.trim() || !editingCategoryId)
      return toast.warning("กรุณากรอกชื่อและเลือกหมวดหมู่หลัก");
    try {
      await axios.put(
        `${API}/subcategory/${editingId}`,
        { name: editingName, categoryId: editingCategoryId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("อัปเดตหมวดหมู่ย่อยแล้ว");
      setEditingId(null);
      setEditingName("");
      setEditingCategoryId("");
      fetchSubcategories();
    } catch (err) {
      toast.error("ไม่สามารถอัปเดตหมวดหมู่ย่อยได้");
    }
  };

  return (
    <div
      style={{
        /* responsive container */
        width: "100%",
        maxWidth: 600,
        margin: "50px auto",
        padding: "clamp(1rem, 2.5vw, 32px)",
        backgroundColor: "#f9fafb",
        borderRadius: 16,
        boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
        boxSizing: "border-box",
      }}
    >
      <h1
        style={{
          fontSize: "clamp(18px, 3.2vw, 22px)",
          fontWeight: "bold",
          marginBottom: 24,
        }}
      >
        จัดการหมวดหมู่ย่อย
      </h1>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", gap: 12, marginBottom: 32, flexWrap: "wrap" }}
      >
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          style={{
            padding: 10,
            borderRadius: 8,
            border: "1px solid #ccc",
            fontSize: 16,
            minWidth: 120,
            boxSizing: "border-box",
          }}
        >
          <option value="">เลือกหมวดหมู่หลัก</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        {/* แสดง dropdown หมวดหมู่ย่อยที่ตรงกับหมวดหมู่หลักที่เลือก */}
        <select
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            flex: 1,
            padding: 10,
            borderRadius: 8,
            border: "1px solid #ccc",
            fontSize: 16,
            minWidth: 120,
            boxSizing: "border-box",
          }}
        >
          <option value="">เลือกหมวดหมู่ย่อย หรือ เพิ่มใหม่...</option>
          {filteredSubcategories &&
            filteredSubcategories.length > 0 &&
            filteredSubcategories.map((sub) => (
              <option key={sub.id} value={sub.name}>
                {sub.name}
              </option>
            ))}
        </select>
        {/* input สำหรับเพิ่มชื่อหมวดหมู่ย่อยใหม่ (ถ้าไม่เลือกจาก dropdown) */}
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          type="text"
          placeholder="เพิ่มชื่อหมวดหมู่ย่อยใหม่..."
          style={{
            flex: 1,
            padding: 10,
            borderRadius: 8,
            border: "1px solid #ccc",
            fontSize: 16,
            boxSizing: "border-box",
          }}
        />
        <button
          type="submit"
          disabled={isLoading}
          style={{
            padding: "10px 20px",
            borderRadius: 8,
            background: isLoading ? "#b0bec5" : "#1976d2",
            color: "#fff",
            fontWeight: "bold",
            fontSize: 16,
            border: "none",
            cursor: isLoading ? "not-allowed" : "pointer",
            boxSizing: "border-box",
          }}
        >
          {isLoading ? "กำลังเพิ่ม..." : <ListPlus />}
        </button>
      </form>

      <h2 style={{ fontSize: 18, fontWeight: "bold", marginBottom: 16 }}>
        หมวดหมู่ย่อยที่มีอยู่
      </h2>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {filteredSubcategories && filteredSubcategories.length === 0 ? (
          <li style={{ color: "#888", fontStyle: "italic" }}>
            {categoryId
              ? "ยังไม่มีหมวดหมู่ย่อยในหมวดหมู่ที่เลือก"
              : "กรุณาเลือกหมวดหมู่หลัก"}
          </li>
        ) : (
          filteredSubcategories &&
          filteredSubcategories.map((item) => (
            <li
              key={item.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 0",
                borderBottom: "1px solid #e0e0e0",
              }}
            >
              {editingId === item.id ? (
                <>
                  <select
                    value={editingCategoryId}
                    onChange={(e) => setEditingCategoryId(e.target.value)}
                    style={{
                      padding: 8,
                      borderRadius: 6,
                      border: "1px solid #ccc",
                      marginRight: 8,
                    }}
                  >
                    <option value="">เลือกหมวดหมู่หลัก</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    style={{
                      flex: 1,
                      padding: 8,
                      fontSize: 15,
                      marginRight: 12,
                      borderRadius: 6,
                      border: "1px solid #ccc",
                    }}
                  />
                  <button
                    onClick={handleSaveEdit}
                    style={{
                      background: "#43a047",
                      color: "#fff",
                      padding: "6px 14px",
                      border: "none",
                      borderRadius: 6,
                      marginRight: 6,
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                  >
                    บันทึก
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    style={{
                      background: "#9e9e9e",
                      color: "#fff",
                      padding: "6px 14px",
                      border: "none",
                      borderRadius: 6,
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                  >
                    ยกเลิก
                  </button>
                </>
              ) : (
                <>
                  <span style={{ fontSize: 16, flex: 1 }}>
                    {item.name}{" "}
                    <span style={{ color: "#888", fontSize: 13 }}>
                      ({item.category?.name || "-"})
                    </span>
                  </span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => handleEdit(item)}
                      style={{
                        background: "#ff9800",
                        color: "#fff",
                        padding: "6px 14px",
                        border: "none",
                        borderRadius: 6,
                        fontWeight: 500,
                        cursor: "pointer",
                      }}
                    >
                      <SquarePen />
                    </button>
                    <button
                      onClick={() => handleRemove(item.id)}
                      style={{
                        background: "#e53935",
                        color: "#fff",
                        padding: "6px 14px",
                        border: "none",
                        borderRadius: 6,
                        fontWeight: 500,
                        cursor: "pointer",
                      }}
                    >
                      <Delete />
                    </button>
                  </div>
                </>
              )}
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default FormSubcategory;
