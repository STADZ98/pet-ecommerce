import React from "react";

const SubcategoryList = ({ subcategories, onSelect }) => (
  <div style={{ marginTop: 32 }}>
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 32,
        justifyContent: "center",
      }}
    >
      {subcategories.map((sub) => (
        <div
          key={sub.id}
          onClick={() => onSelect && onSelect(sub)}
          style={{
            background: "#fff",
            border: "1px solid #bfc9d1",
            borderRadius: 14,
            /* responsive card: full width up to maxWidth */
            width: "100%",
            maxWidth: 320,
            boxSizing: "border-box",
            minHeight: 120,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            fontSize: "clamp(16px, 4vw, 24px)",
            cursor: onSelect ? "pointer" : "default",
            boxShadow: "0 2px 8px #e6e6e6",
            transition: "box-shadow 0.2s",
            textAlign: "center",
            padding: "0.75rem",
          }}
        >
          {sub.name}
        </div>
      ))}
    </div>
  </div>
);

export default SubcategoryList;
