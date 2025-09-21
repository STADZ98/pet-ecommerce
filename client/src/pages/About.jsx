import React from "react";
import { Link } from "react-router-dom";
import start1 from "../components/home/images/start1.jpg";
import d2 from "../components/home/images/d2.jpg";
import cream3 from "../components/home/images/cream3.jpg";

const Stat = ({ value, label }) => (
  <div className="text-center">
    <div className="text-2xl font-extrabold text-gray-800">{value}</div>
    <div className="text-sm text-gray-600">{label}</div>
  </div>
);

const team = [
  {
    img: start1,
    name: "นายปกรณ์เนกษ์ บุญแสนรัน",
    No: "6540204176",
    role: "ผู้จัดการร้าน",
  },
  { img: d2, name: "กนกวรรณ วรอัด", No: "6540203921", role: "ผู้จัดการร้าน" },
  {
    img: cream3,
    name: "ศิริรัตน์ พรหมสุข",
    No: "6540204663",
    role: "ผู้จัดการร้าน",
  },
];

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-3xl font-extrabold text-gray-900">เกี่ยวกับเรา</h1>
        <p className="mt-4 text-gray-600">
          ร้านค้าออนไลน์สำหรับคนรักสัตว์เลี้ยง
          มุ่งมั่นที่จะให้บริการสินค้าที่มีคุณภาพ
          พร้อมคำแนะนำจากผู้เชี่ยวชาญและการบริการที่เป็นมิตร
        </p>
      </div>

      <main className="max-w-6xl mx-auto space-y-8">
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              พันธกิจของเรา
            </h2>
            <p className="text-gray-700 leading-relaxed">
              เราคัดสรรสินค้าที่ปลอดภัยและได้มาตรฐานสำหรับสัตว์เลี้ยง
              พร้อมบริการที่รวดเร็วและคำแนะนำจากผู้เชี่ยวชาญ
              เพื่อสุขภาพและความสุขของสัตว์เลี้ยงในทุกช่วงวัย
            </p>

            <ul className="mt-6 space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 mt-2" />
                <div>
                  <div className="font-semibold text-gray-800">
                    สินค้าคุณภาพ
                  </div>
                  <div className="text-sm text-gray-600">
                    แบรนด์ที่ได้รับการคัดสรร
                  </div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 mt-2" />
                <div>
                  <div className="font-semibold text-gray-800">
                    บริการรวดเร็ว
                  </div>
                  <div className="text-sm text-gray-600">
                    จัดส่งที่เชื่อถือได้และการสนับสนุนลูกค้ามืออาชีพ
                  </div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 mt-2" />
                <div>
                  <div className="font-semibold text-gray-800">
                    คำแนะนำจากผู้เชี่ยวชาญ
                  </div>
                  <div className="text-sm text-gray-600">
                    คอนเทนต์และคำแนะนำที่เป็นประโยชน์
                  </div>
                </div>
              </li>
            </ul>

            <div className="mt-8">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 bg-yellow-500 text-white px-5 py-3 rounded-full font-semibold shadow hover:bg-yellow-600"
              >
                ติดต่อเรา
              </Link>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden shadow-lg bg-white p-6">
            <img
              src="/logo.jpg"
              alt="PETSHOP"
              className="w-full h-64 object-cover rounded-lg"
            />
            <div className="mt-4">
              <p className="text-gray-700">
                เราเริ่มต้นจากความรักสัตว์เลี้ยง
                ทีมงานมีประสบการณ์ด้านการดูแลและจัดหาสินค้า
                ทำให้เราสามารถตอบโจทย์เจ้าของสัตว์เลี้ยงที่ต้องการคุณภาพในราคายุติธรรม
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-sm p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Stat value="30+" label="ลูกค้าที่พอใจ" />
            <Stat value="300" label="รายการสินค้า" />
            <Stat value="4.9/5" label="คะแนนการบริการ" />
          </div>
        </section>

        <section>
          <h3 className="text-xl font-bold text-gray-800 mb-4">ทีมงานของเรา</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {team.map((m) => (
              <div
                key={m.name}
                className="bg-white p-4 rounded-2xl shadow-sm text-center"
              >
                <div className="w-24 h-24 rounded-full bg-gray-100 mx-auto mb-3 overflow-hidden">
                  <img
                    src={m.img}
                    alt={m.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="font-semibold text-gray-800">{m.name}</div>
                <div className="text-sm text-gray-500">{m.No}</div>
                <div className="text-sm text-gray-500">{m.role}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            มาร่วมเป็นส่วนหนึ่ง
          </h3>
          <p className="text-gray-600 mb-4">
            หากคุณมีคำถาม ต้องการร่วมงาน หรือเสนอไอเดียใหม่ ๆ ติดต่อเราได้เสมอ
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded-full font-semibold shadow hover:bg-yellow-600"
            >
              ติดต่อเรา
            </Link>
            <a
              href="/shop"
              className="inline-flex items-center gap-2 border border-gray-200 px-4 py-2 rounded-full text-gray-700 hover:bg-gray-50"
            >
              ไปยังร้านค้า
            </a>
          </div>
        </section>
      </main>
    </div>
  );
};

export default About;
