import React from "react";
import { Link } from "react-router-dom";

const SectionHeader = ({ title, subtitle, action }) => (
  <div className="flex items-start justify-between mb-8">
    <div>
      <h1 className="text-3xl font-extrabold text-gray-800">{title}</h1>
      {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
    </div>
    {action && <div className="self-center">{action}</div>}
  </div>
);

const articles = [
  {
    id: 1,
    image:
      "https://www.purina.co.th/sites/default/files/2020-12/Feeding%20Your%20Indoor%20CatHERO.jpg",
    date: "15 ส.ค.",
    title: "วิธีให้อาหารแมวที่เลี้ยงในบ้าน",
    summary:
      "รู้หรือไม่ว่าพืชบางชนิดอาจเป็นอันตรายต่อสัตว์เลี้ยงของคุณได้ มาดูวิธีเลือกพืชที่ปลอดภัยสำหรับบ้านที่มีสัตว์เลี้ยงกัน!",
    tag: "แมว",
  },
  {
    id: 2,
    image:
      "https://www.purina.co.th/sites/default/files/2023-04/Dog-run-with-food-bowl-HERO.jpg",
    date: "16 ส.ค.",
    title: "น้ำหนักและรูปร่างที่เหมาะสมของสุนัข",
    summary:
      "ความแตกต่างของสุนัขแต่ละสายพันธุ์ ทำให้เป็นเรื่องยากว่ารูปร่างแบบไหนถึงจะเหมาะกับสุนัขของคุณ",
    tag: "สุนัข",
  },
  {
    id: 3,
    image:
      "https://www.purina.co.th/sites/default/files/2022-05/healthy-puppies-training-guide.jpg",
    date: "16 ส.ค.",
    title: "มือใหม่ต้องรู้ไว้ ดูแลลูกหมาตัวใหม่ อย่างไรให้แข็งแรง",
    summary:
      "กว่าที่ลูกหมาแรกเกิดจะเติบโตเป็นสุนัขโตเต็มวัยได้อย่างมีสุขภาพกายและสุขภาพใจที่แข็งแรงนั้น ต้องอาศัยการพื้นฐานจากการเลี้ยงลูกหมาตั้งแต่วัยเด็ก",
    tag: "ลูกหมา",
  },
  {
    id: 4,
    image:
      "https://www.purina.co.th/sites/default/files/2020-12/Unusual%20Cat%20Illness%20Symptoms%20To%20Watch%20Out%20ForHERO.jpg",
    date: "17 ส.ค.",
    title: "สัญญาณแปลก ๆ ที่เตือนว่าแมวกำลังป่วย",
    summary:
      "ในฐานะคนรักแมว เราเข้าใจดีว่า เจ้าของทุกคนอยากให้สัตว์เลี้ยงของเรามีความสุขและแข็งแรงทั้งกายและจิตใจอยู่เสมอ",
    tag: "แมว",
  },
  {
    id: 5,
    image:
      "https://kingkongpetshop.com/wp-content/uploads/2022/07/cat-licking-fur-1024x538.jpg",
    date: "18 ส.ค.",
    title: "แมวเลียขนบ่อยมากเกินไป ทำไมแมวถึงมีพฤติกรรมเช่นนั้น แก้ไขอย่างไรดี",
    summary:
      "แมวบางตัวนั้นจุกจิก และพิถีพิถันกว่าแมวตัวอื่น แต่การแจ่งขนตัวเองมากเกินไป อาจเป็นสัญญานของปัญหาบางอย่าง",
    tag: "พฤติกรรม",
  },
  {
    id: 6,
    image:
      "https://www.purina.co.th/sites/default/files/2020-12/Preparing%20for%20a%20New%20Puppy%20Here%20is%20what%20to%20ExpectHERO.jpg",
    date: "18 ส.ค.",
    title: "เตรียมความพร้อมก่อนรับเลี้ยงสุนัข ฉบับมือโปร",
    summary:
      "การรับเลี้ยงลูกสุนัขหรือมีสุนัขตัวใหม่ในบ้านเป็นเรื่องน่าตื่นเต้น คุณควรเตรียมตัวให้พร้อม ด้วยคู่มือการดูแลลูกสุนัขของเราการต้อนรับเลี้ยงลูกสุนัขเข้าบ้าน",
    tag: "สุนัข",
  },
];

const Articles = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <header>
        <SectionHeader
          title={"บทความเพื่อสัตว์เลี้ยง"}
          subtitle={"รวมบทความแนะนำการดูแล เลี้ยง และสุขภาพสำหรับแมวและสุนัข"}
          
        />
      </header>

      <main>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((a) => (
            <article
              key={a.id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition border border-gray-100"
            >
              <div className="h-52 md:h-44 overflow-hidden bg-gray-100">
                <img
                  src={a.image}
                  alt={a.title}
                  loading="lazy"
                  onError={(e) =>
                    (e.target.src =
                      "https://via.placeholder.com/900x600?text=No+Image")
                  }
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="p-5">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span>{a.date}</span>
                  {a.tag && (
                    <span className="bg-gray-100 text-xs px-2 py-1 rounded-full text-gray-800">
                      {a.tag}
                    </span>
                  )}
                </div>

                <h2 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                  {a.title}
                </h2>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {a.summary}
                </p>

                <div className="mt-4 flex items-center justify-between">
                  <Link
                    to={`/article/${a.id}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 px-3 py-2 rounded-full shadow"
                  >
                    อ่านต่อ
                  </Link>
                  
                </div>
              </div>
            </article>
          ))}
        </div>

        
      </main>
    </div>
  );
};

export default Articles;
