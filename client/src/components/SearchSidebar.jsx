import React from "react";
import SearchCard from "./card/สำรอง/SearchCard";

const SearchSidebar = () => (
  <div className="bg-white border border-blue-200 rounded-2xl shadow-lg p-6">
    <h3 className="text-xl font-bold text-blue-700 mb-5 text-center">
      ค้นหาสินค้า
    </h3>
    <SearchCard />
  </div>
);

export default SearchSidebar;
