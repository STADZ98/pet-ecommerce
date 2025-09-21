import React, { useState } from "react";
import MainNav from "./components/MainNav";
import Index from "./components/home/Index";
import CartCard from "./components/card/CartCard";

const App = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <>
      <MainNav setIsCartOpen={setIsCartOpen} />
      <Index setIsCartOpen={setIsCartOpen} />

      {/* ตะกร้าสินค้าแบบ overlay */}
      {isCartOpen && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]"
          onClick={() => setIsCartOpen(false)}
        >
          <div
            className="w-full max-w-3xl bg-white h-full md:h-auto md:rounded-2xl p-6 shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="mb-4 text-gray-600 hover:text-gray-900"
              onClick={() => setIsCartOpen(false)}
              aria-label="ปิดตะกร้าสินค้า"
            >
              ✕ ปิด
            </button>
            <CartCard />
          </div>
        </div>
      )}
    </>
  );
};

export default App;
