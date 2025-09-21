import React, { useEffect, useState } from "react";
import axios from "axios";
import CategoryList from "../components/CategoryList";
import SubcategoryList from "../components/SubcategoryList";

const API = import.meta.env.VITE_API || "http://localhost:5000/api";

const AllProductPage = () => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // โหลดหมวดหมู่หลัก
  useEffect(() => {
    axios.get(`${API}/category`).then((res) => setCategories(res.data));
  }, []);

  // โหลดหมวดหมู่ย่อยเมื่อเลือกหมวดหมู่หลัก
  useEffect(() => {
    if (selectedCategory) {
      axios.get(`${API}/subcategory`).then((res) => {
        setSubcategories(
          res.data.filter((s) => s.categoryId === selectedCategory.id)
        );
      });
    }
  }, [selectedCategory]);

  // เมื่อคลิกหมวดหมู่ย่อย
  const handleSubcategorySelect = (sub) => {
    // ตัวอย่าง: ไปหน้าสินค้าของหมวดหมู่ย่อยนี้
    // navigate(`/products/subcategory/${sub.id}`);
    alert(`เลือกหมวดหมู่ย่อย: ${sub.name}`);
  };

  return (
    <div style={{ padding: 32 }}>
      {!selectedCategory ? (
        <CategoryList categories={categories} onSelect={setSelectedCategory} />
      ) : (
        <>
          <div style={{ marginBottom: 24 }}>
            <button
              onClick={() => setSelectedCategory(null)}
              style={{ marginRight: 16 }}
            >
              &lt; กลับ
            </button>
            <span style={{ fontSize: 20, fontWeight: "bold" }}>
              {selectedCategory.name}
            </span>
          </div>
          <SubcategoryList
            subcategories={subcategories}
            onSelect={handleSubcategorySelect}
          />
        </>
      )}
    </div>
  );
};

export default AllProductPage;
