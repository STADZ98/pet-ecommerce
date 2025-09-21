import React from "react";

const CategoryList = ({ categories, onSelect }) => (
  <div>
    <h2 className="text-2xl md:text-3xl font-bold text-blue-800 flex items-center gap-3">
      <span className="text-yellow-400">ไอคอนหรือข้อความ</span>
      ข้อความหัวข้อ
    </h2>
    <div style={{ display: "flex", gap: 32, justifyContent: "center" }}>
      {categories.map((cat) => (
        <div
          key={cat.id}
          onClick={() => onSelect(cat)}
          style={{
            background: "#fff",
            border: "1px solid #bfc9d1",
            borderRadius: 14,
            width: "100%",
            maxWidth: 280,
            boxSizing: "border-box",
            minHeight: 120,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            fontSize: "clamp(15px, 3.5vw, 22px)",
            cursor: "pointer",
            boxShadow: "0 2px 8px #e6e6e6",
            transition: "box-shadow 0.2s",
            padding: "0.5rem",
          }}
        >
          {cat.name}
        </div>
      ))}
    </div>
  </div>
);

export default CategoryList;
