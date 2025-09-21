import React, { useEffect, useState } from "react";
import { listProductBy } from "../../api/product";
import ProductCard from "../card/ProductCard";
import SwiperShowProduct from '../../utils/SwiperShowProduct'
const BestSeller = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    listProductBy("sold", "desc", 3)
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  return (
    <SwiperShowProduct>
      {data?.map((item, index) => (
        <ProductCard item={item} key={index}/>
      ))}
    </SwiperShowProduct>
  );
};

export default BestSeller;
