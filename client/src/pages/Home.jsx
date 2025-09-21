// Home.jsx
// หน้าแรกของเว็บ petshop online แสดง carousel, index, best seller ฯลฯ
import React from "react";
import ContentCarousel from "../components/home/ContentCarousel";
import Index from "../components/home/Index";
import BestSeller from "../components/home/BestSeller";

const Home = () => {
  return (
    <div>
      <Index />
    </div>
  );
};

export default Home;
