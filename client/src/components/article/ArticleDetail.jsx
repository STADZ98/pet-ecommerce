import React, { useMemo, useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import catn1ipImg from "../home/images/ปกแมว1.jpg";
import dog2ipImg from "../home/images/หมา2.jpg";
import dog3ipImg from "../home/images/มือ.webp";
import cat2ipImg from "../home/images/แมว4.jpg";
import catLickingImg from "../home/images/cat-licking-fur-1024x538.jpg";
import puppyHomeImg from "../home/images/dogg.jpg";
import { Share2, Clock, User, Printer, Bookmark } from "lucide-react";

// ====== Reusable Modal (ไฟล์เดียวจบ) ======
const Modal = ({ open, onClose, title, children }) => {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (open && dialogRef.current) {
      dialogRef.current.focus();
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
      aria-modal="true"
      role="dialog"
      aria-labelledby="modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 id="modal-title" className="text-lg font-semibold text-gray-800">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100"
            aria-label="ปิดหน้าต่าง"
            ref={dialogRef}
          >
            ✕
          </button>
        </div>
        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

// ====== Small UI bits ======
const Badge = ({ children }) => (
  <span className="inline-flex items-center rounded-full bg-green-50 text-green-700 border border-green-200 px-3 py-1 text-xs">
    {children}
  </span>
);

const KeyPoint = ({ title, desc }) => (
  <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
    <div className="font-medium text-gray-800">{title}</div>
    <div className="text-sm text-gray-600 mt-1">{desc}</div>
  </div>
);

// ====== Main Page ======
const ArticleDetail = () => {
  // --- Modal states
  const [openSummary, setOpenSummary] = useState(false);
  const [openPlanner, setOpenPlanner] = useState(false);
  const [openRefs, setOpenRefs] = useState(false);

  // --- Reading progress
  const progressRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const el = progressRef.current;
      if (!el) return;
      const total = el.scrollHeight - window.innerHeight;
      const scrolled = window.scrollY - (el.offsetTop || 0);
      const pct = Math.min(100, Math.max(0, (scrolled / total) * 100));
      setProgress(isNaN(pct) ? 0 : pct);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // compute reading time from text content (~200 words per minute)
  useEffect(() => {
    const el = progressRef.current;
    if (!el) return;
    // compute after paint
    const calc = () => {
      try {
        const text = el.innerText || "";
        const words = (text.match(/\w+/g) || []).length;
        setReadingTime(Math.max(1, Math.ceil(words / 200)));
      } catch (e) {
        console.error(e);
        setReadingTime(3);
      }
    };
    // small delay to ensure images/text rendered
    const t = setTimeout(calc, 100);
    return () => clearTimeout(t);
  }, [progressRef]);



  // --- TOC
  const toc = useMemo(
    () => [
      { id: "intro", label: "ภาพรวม: แมว Indoor ต่างอย่างไร" },
      { id: "routine", label: "วางตารางให้อาหารที่สม่ำเสมอ" },
      { id: "portion", label: "ปริมาณที่เหมาะสม & คุมน้ำหนัก" },
      { id: "quality", label: "เลือกสูตรอาหารที่เหมาะกับ Indoor" },
      { id: "enrichment", label: "กระตุ้นการเคลื่อนไหว & ชามให้อาหารช้า" },
      { id: "treats", label: "ขนม: ให้ได้ แต่ต้องพอดี" },
      { id: "hydration", label: "น้ำสะอาด & อาหารเปียกช่วยความชุ่มชื้น" },
      { id: "switch", label: "เปลี่ยนอาหารอย่างค่อยเป็นค่อยไป" },
      { id: "mealplan", label: "ตัวอย่างแผนมื้อ/ตัวอย่างสูตร" },
      { id: "signs", label: "สังเกตสัญญาณผิดปกติ" },
      { id: "faq", label: "คำถามพบบ่อย (สรุปเร็ว)" },
    ],
    []
  );

  // --- Planner (แนวทางอย่างคร่าว)
  const [catWeight, setCatWeight] = useState(4); // กก.
  const [meals, setMeals] = useState(2); // มื้อ/วัน
  const dailyDryGram = useMemo(() => {
    // ค่าประมาณทั่วไป (สำหรับอาหารเม็ดมาตรฐานบางแบรนด์ 250–300 kcal/ถ้วย)
    // สมมติ 4 กก. ต้องการ ~200–250 kcal/วัน -> ประมาณ 45–60 กรัม/วัน (ขึ้นกับสูตร)
    // ใช้สูตรคร่าว: 12 * น้ำหนัก(กก.) + 8 กรัม  (ช่วงกลางๆ)
    const g = Math.round(12 * catWeight + 8);
    return Math.max(20, Math.min(90, g)); // เบรกช่วงที่เหมาะสมแบบคร่าวๆ
  }, [catWeight]);
  const perMeal = useMemo(
    () => Math.max(5, Math.round(dailyDryGram / meals)),
    [dailyDryGram, meals]
  );

  return (
    <section ref={progressRef} className="bg-gray-50 min-h-screen">
      {/* Reading progress bar */}
      <div className="sticky top-0 z-50 h-1 w-full bg-gray-200">
        <div
          className="h-1 bg-green-500 transition-[width] duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>

   

      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* -------- Main -------- */}
          <article className="flex-1 max-w-3xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="p-6 lg:p-8 border-b bg-gradient-to-b from-white to-green-50/40">
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
           
                <span className="ml-auto">
                  <Badge>Indoor Cat Care</Badge>
                </span>
              </div>

              <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 leading-snug mt-4">
                คู่มือให้อาหารแมวเลี้ยงในบ้าน (Indoor)
              </h1>
              <p className="text-gray-700 mt-3 text-base md:text-lg leading-8">
                ทำอย่างไรให้แมวระบบปิดอิ่มพอดี สุขภาพดี ไม่อ้วนง่าย
                และไม่เบื่ออาหาร
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  onClick={() => setOpenSummary(true)}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm hover:border-gray-300 hover:bg-gray-50"
                >
                  อ่านสั้นๆ (Key Takeaways)
                </button>
                <button
                  onClick={() => setOpenPlanner(true)}
                  className="rounded-xl border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700 hover:bg-green-100"
                >
                  Planner แบ่งมื้อ/ปริมาณ (คร่าวๆ)
                </button>
                <button
                  onClick={() => setOpenRefs(true)}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm hover:border-gray-300 hover:bg-gray-50"
                >
                  แหล่งอ้างอิง
                </button>
              </div>
            </div>

            {/* Cover */}
            <div className="overflow-hidden">
              <img
                src={catn1ipImg}
                alt="indoor cat cover"
                className="w-full h-64 lg:h-80 object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>

            {/* TOC (mobile button) */}
            <div className="px-6 lg:px-8 py-5 border-b bg-white lg:hidden">
              <details className="group">
                <summary className="cursor-pointer text-sm text-gray-700 font-medium flex items-center justify-between">
                  สารบัญ
                  <span className="text-gray-400 group-open:rotate-180 transition">
                    ⌄
                  </span>
                </summary>
                <ul className="mt-3 space-y-2 text-sm text-gray-600">
                  {toc.map((t) => (
                    <li key={t.id}>
                      <a href={`#${t.id}`} className="hover:text-green-700">
                        • {t.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </details>
            </div>

            {/* Content */}
            <div className="p-6 lg:p-8">
              {/* Desktop TOC inline tip */}
              <div className="hidden lg:block mb-8 rounded-xl border border-green-100 bg-white p-5 shadow-sm">
                <div className="text-sm font-semibold text-green-800 mb-2">
                  📜 สารบัญ
                </div>
                <div className="flex flex-col gap-2 text-sm text-gray-700">
                  {toc.map((t) => (
                    <a
                      key={t.id}
                      href={`#${t.id}`}
                      className="text-sm hover:text-green-700"
                    >
                      {t.label}
                    </a>
                  ))}
                </div>
              </div>

              {/* Sections */}
              <section id="intro" className="scroll-mt-24">
                <h2 className="text-xl font-bold text-gray-800">
                  ภาพรวม: แมว Indoor ต่างอย่างไร
                </h2>
                <p className="mt-3 text-gray-700 leading-8 text-base md:text-lg">
                  แมวที่เลี้ยงในบ้านมักใช้พลังงานน้อยกว่า อ้วนง่าย เบื่อได้ง่าย
                  และมีโอกาสเกิดก้อนขน
                  การเลือกสูตรอาหารและวิธีให้อาหารที่เหมาะสมจึงสำคัญ
                  ทั้งเพื่อควบคุมน้ำหนัก ดูแลสุขภาพทางเดินปัสสาวะ
                  และดูแลผิวหนัง/ขนให้เงางาม
                </p>
                <div className="mt-4 grid sm:grid-cols-3 gap-3">
                  <KeyPoint
                    title="พลังงานต่ำลง"
                    desc="กิจกรรมน้อยลง ต้องคุมแคลอรี่ต่อวัน"
                  />
                  <KeyPoint
                    title="สุขอนามัย"
                    desc="ชาม น้ำ แบ่งสัดส่วนเป็นกิจจะลักษณะ"
                  />
                  <KeyPoint
                    title="ป้องกันเบื่อ"
                    desc="ใช้ชามให้อาหารช้า/ของเล่นเสริม"
                  />
                </div>
              </section>

              <hr className="my-8" />

              <section id="routine" className="scroll-mt-24">
                <h2 className="text-xl font-bold text-gray-800">
                  วางตารางให้อาหารที่สม่ำเสมอ
                </h2>
                <p className="mt-3 text-gray-700 leading-8 text-base md:text-lg">
                  เลือกเวลาให้อาหารคงที่วันละ 2–3 มื้อ (เช้า–เย็น
                  หรือเช้า–บ่าย–เย็น) เพื่อสร้างวินัย
                  ช่วยควบคุมความหิวและปริมาณต่อมื้อ
                  ไม่แนะนำการวางอาหารทิ้งไว้ตลอดวันสำหรับแมวที่กินเพลิน/อ้วนง่าย
                </p>
              </section>

              <hr className="my-8" />

              <section id="portion" className="scroll-mt-24">
                <h2 className="text-xl font-bold text-gray-800">
                  ปริมาณที่เหมาะสม & คุมน้ำหนัก
                </h2>
                <p className="mt-3 text-gray-700 leading-8 text-base md:text-lg">
                  อ่านฉลากดูคำแนะนำต่อวันของแบรนด์ แล้วแบ่งเป็นมื้อย่อย ๆ
                  ตวงด้วยช้อน/แก้วตวงเดิมทุกครั้ง ชั่งน้ำหนักแมวทุก 2–4 สัปดาห์
                  ปรับเพิ่ม–ลด 5–10% ตามสภาพร่างกาย (BCS) และกิจกรรม
                </p>
                <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-900 text-sm">
                  ⚠️ คำเตือน: หลีกเลี่ยงการลดอาหารแบบฮวบฮาบ โดยเฉพาะแมวอ้วน
                  เพราะเสี่ยงโรคตับไขมัน ควรปรับแบบค่อยเป็นค่อยไป
                </div>
              </section>

              <hr className="my-8" />

              <section id="quality" className="scroll-mt-24">
                <h2 className="text-xl font-bold text-gray-800">
                  เลือกสูตรอาหารที่เหมาะกับ Indoor
                </h2>
                <ul className="list-disc pl-6 mt-3 text-gray-700 space-y-2">
                  <li>
                    พลังงานพอเหมาะ โปรตีนคุณภาพดี เส้นใยช่วยระบบทางเดินอาหาร
                  </li>
                  <li>
                    ดูโภชนาการสมดุล พร้อมทอรีน วิตามิน และแร่ธาตุที่จำเป็น
                  </li>
                  <li>สูตรช่วยลดกลิ่นมูล/ก้อนขน และสนับสนุนสุขภาพปัสสาวะ</li>
                </ul>
              </section>

              <hr className="my-8" />

              <section id="enrichment" className="scroll-mt-24">
                <h2 className="text-xl font-bold text-gray-800">
                  กระตุ้นการเคลื่อนไหว & ใช้ชามให้อาหารช้า
                </h2>
                <p className="mt-3 text-gray-700 leading-8 text-base md:text-lg">
                  แมว indoor มีกิจกรรมน้อยกว่าตามธรรมชาติ การเพิ่มสภาพแวดล้อม
                  (environmental enrichment) เป็นหัวใจสำคัญของการควบคุมน้ำหนัก
                  และรักษาสุขภาพจิต เทคนิคที่ได้ผลรวมถึงการเล่นเชิงล่าสัตว์,
                  ของเล่นแจกอาหาร (puzzle feeder), และของเล่นที่ต้องขยับตัว
                  เพื่อให้แมวออกแรงและใช้พลังงานมากขึ้น
                </p>
                <ul className="list-disc pl-6 mt-3 text-gray-700 space-y-2">
                  <li>
                    ของเล่นล่อ (fishing rod) 10–15 นาที/วัน ช่วยยิงพลังงานและ
                    กระตุ้นพฤติกรรมธรรมชาติ
                  </li>
                  <li>
                    พัซเซิลฟีดเดอร์: กระจายเม็ดอาหารเป็นชิ้นเล็ก ๆ ให้กินช้า
                    ลดกินเพลินและทำให้แมวใช้เวลาหาอาหาร
                  </li>
                  <li>
                    ใช้ชามชะลอ (slow feeder) สำหรับแมวที่กินเร็วมาก
                    เพื่อลดการอาเจียน/กลืนเร็ว และช่วยให้ความอิ่มยาวนานขึ้น
                  </li>
                  <li>
                    กระตุ้นแนวดิ่ง: ชั้นวางหรือที่ปีนป่าย ช่วยให้แมวได้ปีนขึ้นลง
                    และเผาผลาญพลังงาน
                  </li>
                </ul>
              </section>

              <hr className="my-8" />

              <section id="treats" className="scroll-mt-24">
                <h2 className="text-xl font-bold text-gray-800">
                  ขนม: ให้ได้ แต่ต้องพอดี
                </h2>
                <p className="mt-3 text-gray-700 leading-8 text-base md:text-lg">
                  ขนมเป็นเครื่องมือที่ดีสำหรับฝึกและเสริมความสัมพันธ์กับ เจ้าของ
                  แต่ต้องระวังเรื่องพลังงานสะสม ควรกินไม่เกิน 5–10%
                  ของแคลอรี่รวมต่อวัน และคำนวณจากปริมาณอาหารหลัก
                </p>
                <ul className="list-disc pl-6 mt-3 text-gray-700 space-y-2">
                  <li>เลือกขนมแคลอรี่ต่ำหรือชิ้นเล็ก ๆ เพื่อการฝึกสั้น ๆ</li>
                  <li>หักปริมาณขนมจากมื้อประจำ ถ้าให้ขนมบ่อยให้ลดอาหารหลัก</li>
                  <li>
                    หลีกเลี่ยงขนมปรุงรส เครื่องปรุง และของมนุษย์ที่อันตราย
                  </li>
                </ul>
              </section>

              <hr className="my-8" />

              <section id="hydration" className="scroll-mt-24">
                <h2 className="text-xl font-bold text-gray-800">
                  น้ำสะอาด & อาหารเปียกช่วยความชุ่มชื้น
                </h2>
                <p className="mt-3 text-gray-700 leading-8 text-base md:text-lg">
                  แมวมีแนวโน้มดื่มน้ำน้อย
                  โดยเฉพาะแมวที่กินอาหารเม็ดเพียงอย่างเดียว การเพิ่มอาหารเปียก
                  (หรือท็อปปิ้งน้ำซุปจืดที่ไม่มีเกลือ/เครื่องปรุง)
                  ช่วยลดความเสี่ยงโรคระบบทางเดินปัสสาวะและนิ่ว
                </p>
                <div className="mt-3 grid sm:grid-cols-2 gap-4 text-sm text-gray-700">
                  <div>
                    <strong>คำแนะนำปฏิบัติ</strong>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>ตั้งชามน้ำหลายจุดในบ้าน และเปลี่ยนน้ำทุกวัน</li>
                      <li>พิจารณาน้ำพุสำหรับสัตว์เลี้ยง ถ้าแมวชอบน้ำไหล</li>
                      <li>
                        เพิ่มอาหารเปียก 1–2 มื้อต่อสัปดาห์
                        หรือผสมเล็กน้อยทุกมื้อ
                      </li>
                    </ul>
                  </div>
                  <div>
                    <strong>สิ่งที่ควรหลีกเลี่ยง</strong>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>น้ำซุปที่มีเกลือ/หัวหอม/กระเทียม</li>
                      <li>นมหรือผลิตภัณฑ์นมถ้าแมวแพ้น้ำตาลแลคโตส</li>
                    </ul>
                  </div>
                </div>
              </section>

              <hr className="my-8" />

              <section id="switch" className="scroll-mt-24">
                <h2 className="text-xl font-bold text-gray-800">
                  เปลี่ยนอาหารอย่างค่อยเป็นค่อยไป
                </h2>
                <p className="mt-3 text-gray-700 leading-8 text-base md:text-lg">
                  การเปลี่ยนสูตรอาหารควรทำอย่างค่อยเป็นค่อยไปเพื่อลด
                  ภาวะท้องเสียและความเครียดของระบบย่อยอาหาร วิธีมาตรฐานคือ
                  การผสมสัดส่วนอาหารเก่า-ใหม่เป็นช่วง 7–10 วัน
                  แต่แมวบางตัวอาจต้อง ใช้เวลานานกว่านั้น
                  ขึ้นกับความไวของระบบย่อย
                </p>
                <ol className="list-decimal pl-6 mt-3 text-gray-700 space-y-2">
                  <li>วัน 1–3: 75% เก่า + 25% ใหม่</li>
                  <li>วัน 4–6: 50% เก่า + 50% ใหม่</li>
                  <li>วัน 7–9: 25% เก่า + 75% ใหม่</li>
                  <li>วัน 10+: 100% สูตรใหม่ หากไม่มีอาการผิดปกติ</li>
                </ol>
                <div className="mt-3 text-xs text-gray-500">
                  หากแมวมีอาการอาเจียน ท้องเสีย หรือเบื่ออาหาร ควรหยุด
                  การเปลี่ยนและปรึกษาสัตวแพทย์
                </div>
              </section>

              <hr className="my-8" />

              <section id="mealplan" className="scroll-mt-24">
                <h2 className="text-xl font-bold text-gray-800">
                  ตัวอย่างแผนมื้อ
                </h2>
                <p className="mt-3 text-gray-700 leading-8 text-base md:text-lg">
                  ตัวอย่างนี้เป็นแนวทางสำหรับแมวสุขภาพดีน้ำหนักปกติ ปรับให้เหมาะ
                  กับแมวแต่ละตัวตามคำแนะนำของฉลากและสัตวแพทย์
                </p>
                <div className="mt-4 grid sm:grid-cols-2 gap-4">
                  <div className="rounded-xl border p-4 bg-gray-50">
                    <div className="font-medium text-gray-800">
                      แมวบ้าน 4 กก. (2 มื้อ)
                    </div>
                    <ul className="list-disc pl-6 mt-2 text-gray-700 space-y-1">
                      <li>
                        เช้า: 25–30 กรัม อาหารเม็ด (หรือ 1/2 ปริมาณเม็ด +
                        ท็อปเปิ้ลเปียก)
                      </li>
                      <li>
                        เย็น: 25–30 กรัม อาหารเม็ด
                        พร้อมเล่นหลังมื้อเพื่อกระตุ้นกิจกรรม
                      </li>
                    </ul>
                  </div>
                  <div className="rounded-xl border p-4 bg-gray-50">
                    <div className="font-medium text-gray-800">
                      แมวอ้วน/ต้องลดน้ำหนัก
                    </div>
                    <ul className="list-disc pl-6 mt-2 text-gray-700 space-y-1">
                      <li>แบ่งเป็น 3–4 มื้อเล็ก ๆ เพื่อลดความหิว</li>
                      <li>
                        เลือกสูตรลดพลังงานหรือสูตรโปรตีนสูง เส้นใยเพิ่มความอิ่ม
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="mt-3 text-xs text-gray-500">
                  ข้อมูลเป็นตัวอย่างเท่านั้น โปรดดูฉลากอาหารและปรึกษาสัตวแพทย์
                </div>
              </section>

              <hr className="my-8" />

              <section id="signs" className="scroll-mt-24">
                <h2 className="text-xl font-bold text-gray-800">
                  สังเกตสัญญาณผิดปกติ
                </h2>
                <ul className="list-disc pl-6 mt-3 text-gray-700 space-y-2">
                  <li>
                    อาเจียนบ่อย ท้องเสียเรื้อรัง หรือเบื่ออาหารนานกว่า 24–48 ชม.
                  </li>
                  <li>
                    ปัสสาวะผิดปกติ เบ่ง/ร้องขณะแมวถ่ายปัสสาวะ หรือมีเลือดปน
                  </li>
                  <li>น้ำหนักลดหรือเพิ่มรวดเร็ว พฤติกรรมเปลี่ยนไปมาก</li>
                </ul>
                <div className="mt-4 text-xs text-gray-500">
                  *กรณีดังกล่าวควรปรึกษาสัตวแพทย์*
                </div>
              </section>

              <hr className="my-8" />

              <section id="faq" className="scroll-mt-24">
                <h2 className="text-xl font-bold text-gray-800">
                  คำถามพบบ่อย (สรุปเร็ว)
                </h2>
                <div className="mt-3 grid sm:grid-cols-2 gap-4">
                  <KeyPoint
                    title="วันละกี่มื้อดี?"
                    desc="ทั่วไป 2–3 มื้อ เลือกช่วงเวลาคงที่ ช่วยคุมปริมาณและระเบียบ"
                  />
                  <KeyPoint
                    title="อาหารเม็ด vs เปียก?"
                    desc="เม็ดสะดวก คุมปริมาณง่าย เปียกช่วยน้ำและความน่ากิน ผสมกันได้"
                  />
                  <KeyPoint
                    title="ขนมให้เท่าไหร่?"
                    desc="ไม่เกิน ~10% ของพลังงานต่อวัน และหักจากอาหารหลัก"
                  />
                  <KeyPoint
                    title="เปลี่ยนสูตรยังไง?"
                    desc="ค่อยเป็นค่อยไป 7–10 วัน สังเกตอุจจาระ/พฤติกรรม"
                  />
                </div>
              </section>

              {/* Footer meta */}
              {/* <div className="mt-10 pt-6 border-t flex flex-wrap items-center gap-3 text-sm text-gray-600">
                <div className="flex items-center gap-3">
                  <span className="text-sm">
                    👀 อ่านแล้ว:{" "}
                    <strong className="text-gray-800">1,234</strong> ครั้ง
                  </span>
                  <span className="text-gray-300">•</span>
                  <div className="flex items-center gap-2">
                    <Badge>#Indoor</Badge>
                    <Badge>#Feeding</Badge>
                    <Badge>#Cat</Badge>
                  </div>
                </div>
                <div className="ml-auto flex items-center gap-3">
                  <button
                    onClick={() => handleShare("facebook")}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    แชร์
                  </button>
                  <button
                    onClick={() => handleShare("print")}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    พิมพ์
                  </button>
                </div>
              </div> */}
            </div>
          </article>

          {/* -------- Sidebar -------- */}
          <aside className="w-full lg:w-80 flex-shrink-0">
            {/* About */}
            <div className="bg-white rounded-2xl shadow p-6 mb-8">
              <h3 className="font-bold text-gray-800 mb-3">
                ℹ เกี่ยวกับบทความ
              </h3>
              <p className="text-gray-600 text-sm">
                แนวทางเลือกสูตรและจัดมื้ออาหารแมวเลี้ยงในบ้าน เน้นคุมพลังงาน
                เสริมความชุ่มชื้น และแก้เบื่อแบบยั่งยืน
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge>Feeding Guide</Badge>
                <Badge>Indoor</Badge>
                <Badge>Cat Health</Badge>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                  onClick={() => setOpenSummary(true)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs hover:bg-gray-100"
                >
                  สรุปย่อ
                </button>
                <button
                  onClick={() => setOpenPlanner(true)}
                  className="w-full rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700 hover:bg-green-100"
                >
                  Planner
                </button>
              </div>
            </div>

            {/* Latest */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h3 className="font-bold text-gray-800 mb-4">📰 บทความล่าสุด</h3>
              <ul className="space-y-4">
                {[
                  "คู่มือให้อาหารแมวเลี้ยงในบ้าน (Indoor)",
                  "คู่มือการออกกำลังกายสำหรับสุนัข",
                  "มือใหม่ต้องรู้: ดูแลลูกหมาตัวใหม่ อย่างไรให้แข็งแรง",
                  "สัญญาณแปลก ๆ ที่เตือนว่าแมวกำลังป่วย",
                  "แมวเลียขนบ่อยมากเกินไป: ทำไมแมวถึงมีพฤติกรรมเช่นนั้น และแก้ไขอย่างไรดี? ",
                  "เตรียมความพร้อมก่อนรับเลี้ยงสุนัข ฉบับมือโปร",
                ].map((title, i) => (
                  <li key={i}>
                    <Link
                      to={`/article/${i + 1}`}
                      className="flex gap-3 items-center group"
                    >
                      <div className="w-14 h-14 overflow-hidden rounded-lg shadow">
                        <img
                          src={
                            i === 1
                              ? dog2ipImg
                              : i === 2
                              ? dog3ipImg
                              : i == 3
                              ? cat2ipImg
                              : i == 4
                              ? catLickingImg
                              : i === 5
                              ? puppyHomeImg
                              : catn1ipImg
                          }
                          alt="thumb"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <span className="text-sm text-gray-700 leading-snug group-hover:text-orange-700">
                        {title}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>

      {/* ===== Modals ===== */}
      <Modal
        open={openSummary}
        onClose={() => setOpenSummary(false)}
        title="Key Takeaways: ให้อาหารแมว Indoor"
      >
        <div className="space-y-3 text-sm text-gray-700">
          <div className="grid sm:grid-cols-2 gap-3">
            <KeyPoint
              title="มื้อคงที่"
              desc="ยึด 2–3 มื้อ/วัน เวลาเดิม ลดกินเพลิน"
            />
            <KeyPoint
              title="ตวงทุกครั้ง"
              desc="อิงคำแนะนำบนฉลาก แล้วปรับตามน้ำหนัก/กิจกรรม"
            />
            <KeyPoint
              title="เสริมความชุ่มชื้น"
              desc="เพิ่มน้ำพุ/อาหารเปียก/น้ำซุปจืด"
            />
            <KeyPoint
              title="ป้องกันเบื่อ"
              desc="พัซเซิลฟีดเดอร์/ชามให้อาหารช้า/ของเล่นล่า"
            />
            <KeyPoint
              title="ขนมไม่เกิน 10%"
              desc="และหักออกจากอาหารหลักทุกครั้ง"
            />
            <KeyPoint
              title="เปลี่ยนสูตร 7–10 วัน"
              desc="เพิ่มสัดส่วนใหม่อย่างค่อยเป็นค่อยไป"
            />
          </div>
        </div>
      </Modal>

      <Modal
        open={openPlanner}
        onClose={() => setOpenPlanner(false)}
        title="Planner แบ่งมื้อ/ปริมาณ (แนวทางคร่าวๆ)"
      >
        <div className="space-y-5 text-sm">
          <div className="rounded-xl border p-4 bg-gray-50">
            <div className="grid sm:grid-cols-3 gap-3">
              <label className="flex flex-col">
                <span className="text-gray-600">น้ำหนักแมว (กก.)</span>
                <input
                  type="number"
                  step="0.1"
                  min="2"
                  max="8"
                  value={catWeight}
                  onChange={(e) =>
                    setCatWeight(parseFloat(e.target.value || "0"))
                  }
                  className="mt-1 rounded-lg border px-3 py-2"
                />
              </label>
              <label className="flex flex-col">
                <span className="text-gray-600">จำนวนมื้อ/วัน</span>
                <select
                  value={meals}
                  onChange={(e) => setMeals(parseInt(e.target.value))}
                  className="mt-1 rounded-lg border px-3 py-2"
                >
                  {[2, 3, 4].map((m) => (
                    <option key={m} value={m}>
                      {m} มื้อ
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex flex-col">
                <span className="text-gray-600">ปริมาณต่อวัน (ประมาณ)</span>
                <div className="mt-1 rounded-lg border px-3 py-2 bg-white">
                  {dailyDryGram} กรัม/วัน
                </div>
              </div>
            </div>
            <div className="mt-3 text-gray-600">
              ≈ {perMeal} กรัม/มื้อ × {meals} มื้อ/วัน
            </div>
            <div className="mt-3 text-xs text-gray-500">
              *เป็นค่ากลางคร่าว ๆ เท่านั้น
              ควรอิงฉลากของยี่ห้ออาหารที่ใช้อยู่และปรึกษาสัตวแพทย์หากมีโรคประจำตัว
            </div>
          </div>

          <div className="rounded-xl border p-4">
            <div className="font-medium text-gray-800 mb-2">
              ตัวอย่างตารางเวลา
            </div>
            <ul className="list-disc pl-6 space-y-1 text-gray-700">
              <li>07:30 — มื้อเช้า</li>
              <li>18:30 — มื้อเย็น</li>
              <li className="text-xs text-gray-500">
                *ถ้า 3 มื้อ: เพิ่มมื้อบ่าย ~13:00 และลดปริมาณต่อมื้อให้สมดุล
              </li>
            </ul>
          </div>
        </div>
      </Modal>

      <Modal
        open={openRefs}
        onClose={() => setOpenRefs(false)}
        title="แหล่งอ้างอิง & อ่านต่อ"
      >
        <div className="text-sm text-gray-700 space-y-3">
          <p>
            เนื้อหาเรียบเรียงใหม่จากหลักการให้อาหารแมวเลี้ยงในบ้าน (Indoor)
            และแนวทางโภชนาการทั่วไปของแบรนด์อาหารสัตว์เลี้ยงชั้นนำ
            โดยยึดหลักค่อยเป็นค่อยไป คุมพลังงาน เสริมความชุ่มชื้น
            และป้องกันความเบื่อ
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              บทความต้นทาง (Purina Thailand): การให้อาหารแมวที่เลี้ยงในบ้าน —
              ค้นหาอ่านในเว็บไซต์ Purina ประเทศไทย
            </li>
            <li>ฉลากโภชนาการของอาหารแมวที่ใช้อยู่ (คำแนะนำปริมาณต่อวัน)</li>
            <li>ปรึกษาสัตวแพทย์สำหรับแมวที่มีโรคประจำตัว/ภาวะอ้วน</li>
          </ul>
        </div>
      </Modal>
    </section>
  );
};

export default ArticleDetail;
