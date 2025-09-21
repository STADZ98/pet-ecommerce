// src/pages/CategoryPage.jsx
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import useEcomStore from "../store/ecom-store";
import ProductCard from "../components/card/ProductCard";
const CategoryPage = () => {
  const { id } = useParams();
  const products = useEcomStore((s) => s.products);
  const getProduct = useEcomStore((s) => s.getProduct);
  const categories = useEcomStore((s) => s.categories);
  const getCategory = useEcomStore((s) => s.getCategory);

  useEffect(() => {
    getProduct();
    getCategory();
  }, [getProduct, getCategory]);

  const category = categories.find((c) => String(c.id) === id);
  const filteredProducts = products.filter((p) => String(p.categoryId) === id);

  return (
    <main className="max-w-7xl mx-auto px-10 py-10">
      <header className="mb-12 ">
        <h1 className="text-4xl font-extrabold text-yellow-500 tracking-wide">
          {category?.name || "ไม่พบหมวดหมู่"}
        </h1>
        <p className="mt-2 text-gray-600 text-lg">สินค้าทั้งหมดในหมวดหมู่นี้</p>
      </header>

      {filteredProducts.length > 0 ? (
        <section
          className="
            grid grid-cols-1 
            sm:grid-cols-2 
            md:grid-cols-3 
            lg:grid-cols-4 
            gap-8
          "
          aria-label="รายการสินค้า"
        >
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} item={product} />
          ))}
        </section>
      ) : (
        <p className="text-center text-gray-500 text-lg mt-20">
          ยังไม่มีสินค้าสำหรับหมวดหมู่นี้
        </p>
      )}
    </main>
  );
};

export default CategoryPage;
