// ✅ เพิ่มเส้นทางสำหรับ subsubcategory
// (import อยู่แล้วด้านล่าง)
import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

// Public Pages
import Home from "../pages/Home";
import Shop from "../pages/Shop";
import Cart from "../pages/Cart";
import History from "../pages/user/History";
import Success from "../pages/user/Success";
import Checkout from "../pages/Checkout";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

import Layout from "../layouts/Layout";
import LayoutAdmin from "../layouts/LayoutAdmin";
import LayoutUser from "../layouts/LayoutUser";

// Admin Pages
import Dashbord from "../pages/admin/Dashboard";
import Category from "../pages/admin/Category";
import SubCategoryPage from "../pages/admin/SubCategoryPage";
import SubSubCategoryPage from "../pages/admin/SubSubCategoryPage";
import Product from "../pages/admin/Product";
import EditProduct from "../pages/admin/EditProduct";
import Manage from "../pages/admin/Manage";
import ManageOrders from "../pages/admin/ManageOrders";
import FormSubcategory from "../components/admin/FormSubcategory";
// User Pages
import HomeUser from "../pages/user/HomeUser";
import Payment from "../pages/user/Payment";
import Profile from "../pages/user/Profile";

// Product Detail Page
import ProductDetail from "../pages/ProductDetail";

// ✅ Category Page (หมวดหมู่สินค้า)
import CategoryPage from "../pages/CategoryPage";

// Protected Routes
import ProtectRouteAdmin from "./ProtecRouteAdmin";
import ProtectRouteUser from "./ProtectRouteUser";

// เพิ่มบรรทัดนี้

import SubCategory from "../pages/SubCategory";
import SubSubCategory from "../pages/SubSubCategory";
import ProductListingPage from "../pages/ProductListingPage";
import BrandPage from "../pages/BrandPage";

import ArticleDetail from "../components/article/ArticleDetail";
import ArticleDetail2 from "../components/article/ArticleDetail2";
import ArticleDetail3 from "../components/article/ArticleDetail3";
import ArticleDetail4 from "../components/article/ArticleDetail4";
import ArticleDetail5 from "../components/article/ArticleDetail5";
import ArticleDetail6 from "../components/article/ArticleDetail6";
import Articles from "../pages/Articles";
import About from "../pages/About";
import Contact from "../pages/Contact";
import Track from "../pages/Track";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: "shop", element: <Shop /> },
      { path: "cart", element: <Cart /> },
      { path: "checkout", element: <Checkout /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },

      // ✅ เพิ่มเส้นทางนี้
      { path: "category/:id", element: <CategoryPage /> },
      { path: "category", element: <CategoryPage /> },
      { path: "/product/:id", element: <ProductDetail /> },
      // ✅ เพิ่มเส้นทางสำหรับ subcategory
      { path: "shop/subcategory", element: <SubCategory /> },
      // ✅ เพิ่มเส้นทางสำหรับ subsubcategory
      { path: "shop/subsubcategory", element: <SubSubCategory /> },
      // ✅ เพิ่มเส้นทางสำหรับ subsubsubcategory (สินค้าใน subsubcategory)
      { path: "shop/productListingPage", element: <ProductListingPage /> },
      // ✅ เพิ่มเส้นทางสำหรับ brand page
      { path: "shop/brand", element: <BrandPage /> },
      // ...existing code...

      { path: "article/1", element: <ArticleDetail /> },
      { path: "article/2", element: <ArticleDetail2 /> },
      { path: "article/3", element: <ArticleDetail3 /> },
      { path: "article/4", element: <ArticleDetail4 /> },
      { path: "article/5", element: <ArticleDetail5 /> },
      { path: "article/6", element: <ArticleDetail6 /> },
      { path: "articles", element: <Articles /> },
      { path: "about", element: <About /> },
      { path: "contact", element: <Contact /> },
      { path: "track", element: <Track /> },
    ],
  },
  {
    path: "/admin",
    element: <ProtectRouteAdmin element={<LayoutAdmin />} />,
    children: [
      { index: true, element: <Dashbord /> },

      { path: "category", element: <Category /> },
      { path: "category/sub", element: <SubCategoryPage /> },
      { path: "category/subsub", element: <SubSubCategoryPage /> },
      { path: "product", element: <Product /> },
      { path: "product/:id", element: <EditProduct /> },
      { path: "manage", element: <Manage /> },
      { path: "orders", element: <ManageOrders /> },
      { path: "subcategory", element: <FormSubcategory /> },
    ],
  },
  {
    path: "/user",
    element: <ProtectRouteUser element={<LayoutUser />} />,
    children: [
      { index: true, element: <HomeUser /> },
      { path: "payment", element: <Payment /> },
      { path: "history", element: <History /> },
      { path: "success", element: <Success /> },
      { path: "profile", element: <Profile /> },
    ],
  },
]);

const AppRoutes = () => {
  return <RouterProvider router={router} />;
};

export default AppRoutes;
