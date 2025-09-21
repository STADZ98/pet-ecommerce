import { useEffect, useState } from "react";
import useEcomStore from "../../store/ecom-store";
import { createProduct } from "../../api/product";
import { toast } from "react-toastify";
import Uploadfile from "./Uploadfile";
import { Link } from "react-router-dom";
const initialState = {
  title: "Food Dog",
  description: "desc",
  price: "200",
  quantity: "15",
  categoryId: "",
  images: [],
};

const FormProduct = () => {
  const token = useEcomStore((state) => state.token);
  const getCategory = useEcomStore((state) => state.getCategory);
  const categories = useEcomStore((state) => state.categories);
  const getProduct = useEcomStore((state) => state.getProduct);
  const products = useEcomStore((state) => state.products);
  const [form, setForm] = useState(initialState);

  useEffect(() => {
    if (token) {
      getCategory(token);
      getProduct(token, 100);
    }
  }, [token]);

  const handleonChange = (e) => {
    const { name, value, type } = e.target;

    setForm({
      ...form,
      [name]: type === "number" ? Number(value) : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await createProduct(token, form);
      toast.success(`เพิ่มข้อมูล ${res.data.title} สำเร็จ`);
      await getProduct(token, 20);
      setForm(initialState);
    } catch (err) {
      console.log(err);
      toast.error("เกิดข้อผิดพลาดในการเพิ่มสินค้า");
    }
  };

  return (
    <div className="container mx-auto p-4 bg-white shadow-md">
      <form onSubmit={handleSubmit}>
        <h1 className="text-xl font-bold mb-4">เพิ่มข้อมูลสินค้า</h1>

        <input
          type="text"
          className="border p-2 w-full mb-2"
          value={form.title}
          onChange={handleonChange}
          placeholder="ชื่อสินค้า"
          name="title"
          required
        />
        <input
          type="text"
          className="border p-2 w-full mb-2"
          value={form.description}
          onChange={handleonChange}
          placeholder="รายละเอียดสินค้า"
          name="description"
          required
        />
        <input
          type="number"
          className="border p-2 w-full mb-2"
          value={form.price}
          onChange={handleonChange}
          placeholder="ราคา"
          name="price"
          min={0}
          required
        />
        <input
          type="number"
          className="border p-2 w-full mb-2"
          value={form.quantity}
          onChange={handleonChange}
          placeholder="จำนวนในคลัง"
          name="quantity"
          min={0}
          required
        />
        <select
          className="border p-2 w-full mb-4"
          name="categoryId"
          onChange={handleonChange}
          required
          value={form.categoryId}
        >
          <option value="" disabled>
            เลือกหมวดหมู่
          </option>
          {categories.map((item, index) => (
            <option key={index} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        <hr />
        {/*upload file */}
        <Uploadfile form={form} setForm={setForm} />
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          เพิ่มสินค้า
        </button>

        <hr />
        <br />

        <table className="table-auto w-full border">
          <thead>
            <tr className="bg-gray-200 border">
              <th scope="col">No.</th>
              <th scope="col">ชื่อ</th>
              <th scope="col">รายละเอียด</th>
              <th scope="col">ราคา</th>
              <th scope="col">จำนวน</th>
              <th scope="col">ขายแล้ว</th>
              <th scope="col">วันที่อัปเดต</th>
            </tr>
          </thead>
          <tbody>
            {products.map((item, index) => {
              return (
                <tr key={item.id || index}>
                  <th scope="row">{index + 1}</th>
                  <td>{item.title}</td>
                  <td>{item.description}</td>
                  <td>{item.price}</td>
                  <td>{item.quantity}</td>
                  <td>{item.sold}</td>
                  <td>{new Date(item.updatedAt).toLocaleDateString()}</td>
                  <td>
                    <p className="bg-yellow-500 rounded-md p-1 shadow-md">
                      <Link to={"/admin/product/"+item.id}>แกไข้</Link>
                    </p>
                    <p>ลบ</p>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </form>
    </div>
  );
};

export default FormProduct;
