import React, { useState } from "react";
import { Link } from "react-router-dom";

// Google Maps URL (embed + open link)
const MAP_URL =
  "https://www.google.com/maps?q=17.2863168,104.1066294&hl=th&z=16&output=embed";
const MAP_LINK =
  "https://www.google.com/maps/search/?api=1&query=17.2863168,104.1066294";

function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text);
  }
  // fallback
  const el = document.createElement("textarea");
  el.value = text;
  document.body.appendChild(el);
  el.select();
  try {
    document.execCommand("copy");
    document.body.removeChild(el);
    return Promise.resolve();
  } catch (err) {
    document.body.removeChild(el);
    return Promise.reject(err);
  }
}

const MapBlock = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await copyToClipboard(MAP_LINK);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="w-full h-64 rounded-lg overflow-hidden shadow-sm">
        <iframe
          title="อาคาร 7 อาคารวิทยาศาสตร์และเทคโนโลยี มหาวิทยาลัยเกษตรศาสตร์ สกลนคร"
          src={MAP_URL}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
        />
      </div>

      <div className="text-sm text-gray-700">
        <div className="font-semibold">
          อาคาร 7 อาคารวิทยาศาสตร์และเทคโนโลยี
        </div>
        <div>มหาวิทยาลัยเกษตรศาสตร์ วิทยาเขตสกลนคร</div>
        <div>พิกัด (ประมาณ): 17.2863168, 104.1066294</div>
      </div>

      <div className="flex items-center gap-3">
        <a
          href={MAP_LINK}
          target="_blank"
          rel="noreferrer"
          className="text-sm inline-flex items-center gap-2 text-yellow-600 hover:underline"
        >
          เปิดใน Google Maps
        </a>

        <button
          onClick={handleCopy}
          className="text-sm inline-flex items-center gap-2 border px-3 py-1 rounded-md text-gray-700 hover:bg-gray-50"
        >
          คัดลอกพิกัด / ลิงก์
        </button>

        {copied && <div className="text-sm text-green-600">คัดลอกแล้ว</div>}
      </div>
    </div>
  );
};

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // No backend in this repo; show fake success and clear form
    setStatus({
      type: "success",
      message: "ส่งข้อความเรียบร้อย ทีมงานจะติดต่อกลับเร็วๆ นี้",
    });
    setForm({ name: "", email: "", message: "" });
    setTimeout(() => setStatus(null), 6000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-4xl font-extrabold text-gray-900">ติดต่อเรา</h1>
          <p className="text-gray-600 mt-2">
            ทีมงาน PETSHOP พร้อมช่วยเหลือ หากต้องการสอบถามเรื่องสินค้า
            การสั่งซื้อ หรือบริการหลังการขาย กรุณากรอกแบบฟอร์มด้านล่าง
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact info */}
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              ข้อมูลติดต่อ
            </h2>
            <p className="text-gray-600">อีเมล: support@petshop.example</p>
            <p className="text-gray-600">โทร: 02-123-4567</p>
            <p className="text-gray-600">เวลาทำการ: จ.-ส. 09:00 - 18:00</p>

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                ช่องทางอื่น
              </h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>Line: @petshop</li>
                <li>Facebook: /petshop</li>
              </ul>
            </div>
          </div>

          {/* Contact form */}
          <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              ส่งข้อความถึงเรา
            </h3>

            {status && (
              <div
                className={`mb-4 p-3 rounded-md ${
                  status.type === "success"
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {status.message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  ชื่อ
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-lg border border-gray-200 p-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  อีเมล
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-lg border border-gray-200 p-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  ข้อความ
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={6}
                  className="mt-1 block w-full rounded-lg border border-gray-200 p-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                  required
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 bg-yellow-500 text-white px-5 py-3 rounded-full font-semibold shadow hover:bg-yellow-600"
                >
                  ส่งข้อความ
                </button>
                <Link to="/" className="text-sm text-gray-600 hover:underline">
                  กลับหน้าหลัก
                </Link>
              </div>
            </form>

            <div className="mt-8">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                ที่ตั้งร้าน
              </h4>

              {/* Map and address block */}
              <MapBlock />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Contact;
