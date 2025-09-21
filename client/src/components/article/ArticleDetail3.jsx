import React, { useMemo, useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import puppyImg from "../home/images/มือ.webp";
import catn1ipImg from "../home/images/ปกแมว1.jpg";
import dog2ipImg from "../home/images/หมา2.jpg";
import dog3ipImg from "../home/images/มือ.webp";
import cat2ipImg from "../home/images/แมว4.jpg";
import catLickingImg from "../home/images/cat-licking-fur-1024x538.jpg";
import puppyHomeImg from "../home/images/dogg.jpg";
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
  <span className="inline-flex items-center rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1 text-xs">
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
const ArticleDetail3 = () => {
  // --- Modal states
  const [openSummary, setOpenSummary] = useState(false);
  const [openPlanner, setOpenPlanner] = useState(false);
  const [openRefs, setOpenRefs] = useState(false);

  // --- Reading progress
  const progressRef = useRef(null);
  const [progress, setProgress] = useState(0);
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

  // --- TOC
  const toc = useMemo(
    () => [
      { id: "intro", label: "ภาพรวม: การเตรียมตัวสำหรับลูกหมา" },
      { id: "feeding", label: "โภชนาการที่เหมาะสมสำหรับลูกหมา" },
      { id: "health", label: "การดูแลสุขภาพและสุขอนามัย" },
      { id: "training", label: "การฝึกเบื้องต้นและปลูกฝังนิสัยที่ดี" },
      { id: "socialization", label: "การเข้าสังคมของลูกหมา" },
      { id: "faq", label: "คำถามพบบ่อย" },
    ],
    []
  );

  // --- Planner
  const [puppyAge, setPuppyAge] = useState(3); // เดือน
  const [puppyWeight, setPuppyWeight] = useState(4); // กก.
  const dailyCalorie = useMemo(() => {
    // RER = 70 * (น้ำหนัก)^0.75
    // DE = 2-3 x RER สำหรับลูกหมา
    const rer = 70 * Math.pow(puppyWeight, 0.75);
    return Math.round(rer * 2.5); // ใช้ค่ากลาง 2.5
  }, [puppyWeight]);

  return (
    <section ref={progressRef} className="bg-gray-50 min-h-screen">
      {/* Reading progress bar */}
      <div className="sticky top-0 z-50 h-1 w-full bg-gray-200">
        <div
          className="h-1 bg-indigo-500 transition-[width] duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* -------- Main -------- */}
          <article className="flex-1 max-w-3xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="p-6 lg:p-8 border-b bg-gradient-to-b from-white to-indigo-50/40">
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                <span className="ml-auto">
                  <Badge>New Puppy</Badge>
                </span>
              </div>

              <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 leading-snug mt-4">
                มือใหม่ต้องรู้: ดูแลลูกหมาตัวใหม่ อย่างไรให้แข็งแรง
              </h1>
              <p className="text-gray-600 mt-3">
                ตั้งแต่วันแรกที่ลูกหมาเข้ามาอยู่ในบ้าน
                ไปจนถึงการเติบโตเป็นสุนัขสุขภาพดี
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  onClick={() => setOpenSummary(true)}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm hover:border-gray-300 hover:bg-gray-50"
                >
                  สรุปย่อ (Key Takeaways)
                </button>
                <button
                  onClick={() => setOpenPlanner(true)}
                  className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm text-indigo-700 hover:bg-indigo-100"
                >
                  Planner โภชนาการลูกหมา (คร่าวๆ)
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
                src={puppyImg}
                alt="puppy care cover"
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
                      <a href={`#${t.id}`} className="hover:text-indigo-700">
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
              <div className="hidden lg:block mb-8 rounded-xl border border-indigo-100 bg-indigo-50 p-5">
                <div className="text-sm font-semibold text-indigo-800 mb-2">
                  📜 สารบัญ
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-indigo-900">
                  {toc.map((t) => (
                    <a
                      key={t.id}
                      href={`#${t.id}`}
                      className="underline-offset-2 hover:underline"
                    >
                      {t.label}
                    </a>
                  ))}
                </div>
              </div>

              {/* Sections */}
              <section id="intro" className="scroll-mt-24">
                <h2 className="text-xl font-bold text-gray-800">
                  ภาพรวม: การเตรียมตัวสำหรับลูกหมา
                </h2>
                <p className="mt-3 text-gray-700 leading-7">
                  การรับลูกหมาเข้าบ้านเป็นทั้งความสุขและความรับผิดชอบ
                  การเตรียมตัวล่วงหน้า ทั้งสถานที่ อาหาร อุปกรณ์ และความรู้
                  จะช่วยให้การผสานลูกหมาเข้าสู่ครอบครัวเป็นไปอย่างราบรื่น
                </p>
                <div className="mt-4 grid sm:grid-cols-3 gap-3">
                  <KeyPoint
                    title="ที่อยู่ปลอดภัย"
                    desc="เตรียมเตียง กล่อง/กรง และพื้นที่พักผ่อนที่อบอุ่น"
                  />
                  <KeyPoint
                    title="อุปกรณ์พื้นฐาน"
                    desc="ชาม ขวดน้ำ สายจูง ปลอกคอ ของเล่น และผ้าห่ม"
                  />
                  <KeyPoint
                    title="เตรียมข้อมูลสุขภาพ"
                    desc="นำบันทึกวัคซีน/ถ่ายพยาธิของลูกหมาจากเพื่อนผู้ให้หรือฟาร์ม"
                  />
                </div>
              </section>

              <hr className="my-8" />

              <section id="feeding" className="scroll-mt-24">
                <h2 className="text-xl font-bold text-gray-800">
                  โภชนาการที่เหมาะสมสำหรับลูกหมา
                </h2>
                <p className="mt-3 text-gray-700 leading-8">
                  ลูกหมามีความต้องการพลังงานและสารอาหารสูงเพื่อการเจริญเติบโต
                  จึงควรเลือกอาหารสูตรลูกหมาที่ออกแบบมาเพื่อการเติบโต
                  มีโปรตีนคุณภาพ ไขมันที่เหมาะสม วิตามิน และแร่ธาตุสำคัญ เช่น
                  แคลเซียมและฟอสฟอรัส
                </p>
                <div className="mt-4 grid sm:grid-cols-2 gap-4">
                  <div className="rounded-xl border p-4 bg-gray-50">
                    <div className="font-medium">คำแนะนำการให้อาหาร</div>
                    <ul className="list-disc pl-6 mt-2 text-gray-700 space-y-1">
                      <li>แบ่งมื้อเล็ก ๆ 3–4 มื้อต่อวันสำหรับลูกหมาเล็ก</li>
                      <li>
                        ติดตามน้ำหนักและปรับปริมาณตามฉลากและคำแนะนำสัตวแพทย์
                      </li>
                      <li>เปลี่ยนอาหารอย่างค่อยเป็นค่อยไปภายใน 7–10 วัน</li>
                    </ul>
                  </div>
                  <div className="rounded-xl border p-4 bg-gray-50">
                    <div className="font-medium">สิ่งที่ควรหลีกเลี่ยง</div>
                    <ul className="list-disc pl-6 mt-2 text-gray-700 space-y-1">
                      <li>
                        อาหารคนที่มีเครื่องปรุง หัวหอม กระเทียม หรือเกลือมาก
                      </li>
                      <li>นมวัวในปริมาณมาก หากลูกหมาแพ้แลคโตส</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-4 bg-orange-50 border border-orange-200 rounded-xl p-4 text-orange-900 text-sm">
                  ⚠️ หากลูกหมามีอาการท้องเสียหรืออาเจียนบ่อย
                  ควรปรึกษาสัตวแพทย์ทันที
                </div>
              </section>

              <hr className="my-8" />

              <section id="health" className="scroll-mt-24">
                <h2 className="text-xl font-bold text-gray-800">
                  การดูแลสุขภาพและสุขอนามัย
                </h2>
                <p className="mt-3 text-gray-700 leading-8">
                  การนัดสัตวแพทย์ตั้งแต่แรกเป็นสิ่งสำคัญเพื่อวางแผนวัคซีน
                  การถ่ายพยาธิ และตรวจสุขภาพทั่วไป สัตวแพทย์จะช่วยกำหนด
                  ตารางวัคซีนและยาถ่ายพยาธิตามอายุและความเสี่ยง
                </p>
                <ul className="list-disc pl-6 mt-3 text-gray-700 space-y-2">
                  <li>ตารางวัคซีนพื้นฐาน (เช่น DHP, Lepto ตามคำแนะนำ)</li>
                  <li>การถ่ายพยาธิเป็นรอบ ๆ ตามวัย (ปรึกษาสัตวแพทย์)</li>
                  <li>
                    ดูแลฟัน หมั่นแปรงหรือใช้ผลิตภัณฑ์ดูแลช่องปากสำหรับลูกหมา
                  </li>
                </ul>
                <div className="mt-4 text-xs text-gray-500">
                  บันทึกการรักษาและวัคซีนเก็บไว้ให้เรียบร้อยเพื่อการติดตาม
                </div>
              </section>

              <hr className="my-8" />

              <section id="training" className="scroll-mt-24">
                <h2 className="text-xl font-bold text-gray-800">
                  การฝึกเบื้องต้นและปลูกฝังนิสัยที่ดี
                </h2>
                <p className="mt-3 text-gray-700 leading-8">
                  เริ่มฝึกคำสั่งพื้นฐานตั้งแต่เนิ่น ๆ โดยใช้วิธีให้รางวัล
                  (positive reinforcement) และทำให้การฝึกเป็นเรื่องสนุก สั้น ๆ
                  แต่สม่ำเสมอ ฝึกการขับถ่ายให้อยู่ในที่ที่กำหนด
                  ใช้การสังเกตและรางวัลเพื่อสร้างนิสัย
                </p>
                <ul className="list-disc pl-6 mt-3 text-gray-700 space-y-2">
                  <li>สอนคำสั่งเช่น นั่ง มากิน มานี่ และรอ</li>
                  <li>ใช้รางวัลชิ้นเล็กและคำชมแทนการลงโทษ</li>
                  <li>แบ่งเซสชันฝึก 5–10 นาที หลายครั้งต่อวัน</li>
                </ul>
              </section>

              <hr className="my-8" />

              <section id="socialization" className="scroll-mt-24">
                <h2 className="text-xl font-bold text-gray-800">
                  การเข้าสังคมของลูกหมา
                </h2>
                <p className="mt-3 text-gray-700 leading-8">
                  การให้ลูกหมาได้พบผู้คนและสัตว์อื่น ๆ
                  ในช่วงที่มีภูมิคุ้มกันและปลอดภัย
                  จะช่วยให้เขาเติบโตเป็นสุนัขที่มั่นใจและเป็นมิตร
                  เริ่มจากสถานการณ์ที่ควบคุมได้
                  และเพิ่มระดับความท้าทายเมื่อเขาปรับตัวดีขึ้น
                </p>
                <div className="mt-3 text-sm text-gray-700">
                  เทคนิค: เริ่มจากเพื่อนเจ้าของที่ไว้ใจได้
                  พาไปสวนที่มีสุนัขเป็นมิตร หรือเข้าคลาส socialization
                  ที่มีผู้เชี่ยวชาญ
                </div>
              </section>

              <hr className="my-8" />

              <section id="faq" className="scroll-mt-24">
                <h2 className="text-xl font-bold text-gray-800">
                  คำถามพบบ่อย (FAQ)
                </h2>
                <div className="mt-3 grid sm:grid-cols-2 gap-4">
                  <KeyPoint
                    title="ควรให้อาหารกี่มื้อ?"
                    desc="ลูกหมา 2–3 เดือน: 3–4 มื้อ/วัน; 4–6 เดือน: 3 มื้อ/วัน; หลัง 6 เดือนลดเป็น 2–3 มื้อ"
                  />
                  <KeyPoint
                    title="เมื่อลูกหมามีไข้/ท้องเสียทำอย่างไร?"
                    desc="หยุดอาหารแข็งชั่วคราว ให้เกลือแร่และน้ำ แน่ใจว่ามีอาการไม่ดีขึ้นให้พบสัตวแพทย์"
                  />
                  <KeyPoint
                    title="เริ่มฝึกได้ตอนไหน?"
                    desc="เริ่มฝึกพื้นฐานเมื่ออายุ 8 สัปดาห์ ขึ้นอยู่กับความพร้อมของลูกหมา"
                  />
                  <KeyPoint
                    title="ควรพาไปพบสัตวแพทย์เมื่อไหร่?"
                    desc="พาทันทีเมื่อรับมาเพื่อตรวจเบื้องต้นและวางแผนวัคซีน/ถ่ายพยาธิ"
                  />
                </div>
               
              </section>

              {/* Footer meta */}
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
                แนวทางการดูแลลูกหมาสำหรับมือใหม่ ตั้งแต่การให้อาหาร การฝึก
                ไปจนถึงการเข้าสังคม เพื่อการเติบโตที่แข็งแรง
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge>Puppy Care</Badge>
                <Badge>Health Guide</Badge>
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
                  className="w-full rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs text-indigo-700 hover:bg-indigo-100"
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
                              : i == 5
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
        title="Key Takeaways: การดูแลลูกหมาตัวใหม่"
      >
        <div className="space-y-3 text-sm text-gray-700">
          <div className="grid sm:grid-cols-2 gap-3">
            <KeyPoint
              title="โภชนาการ"
              desc="อาหารลูกหมาเฉพาะวัยและน้ำสะอาดเสมอ"
            />
            <KeyPoint
              title="สุขอนามัย"
              desc="แปรงขนและฟัน สังเกตอาการผิดปกติ"
            />
            <KeyPoint
              title="การฝึก"
              desc="เริ่มฝึกคำสั่งง่ายๆ และการขับถ่ายให้เป็นที่"
            />
            <KeyPoint
              title="การเข้าสังคม"
              desc="พาลูกหมาพบปะคนและสุนัขอื่นๆ อย่างปลอดภัย"
            />
          </div>
        </div>
      </Modal>

      <Modal
        open={openPlanner}
        onClose={() => setOpenPlanner(false)}
        title="Planner โภชนาการลูกหมา (แนวทางคร่าวๆ)"
      >
        <div className="space-y-5 text-sm">
          <div className="rounded-xl border p-4 bg-gray-50">
            <div className="grid sm:grid-cols-3 gap-3">
              <label className="flex flex-col">
                <span className="text-gray-600">น้ำหนัก (กก.)</span>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="50"
                  value={puppyWeight}
                  onChange={(e) =>
                    setPuppyWeight(parseFloat(e.target.value || "0"))
                  }
                  className="mt-1 rounded-lg border px-3 py-2"
                />
              </label>
              <label className="flex flex-col">
                <span className="text-gray-600">อายุ (เดือน)</span>
                <input
                  type="number"
                  step="1"
                  min="2"
                  max="12"
                  value={puppyAge}
                  onChange={(e) => setPuppyAge(parseInt(e.target.value || "0"))}
                  className="mt-1 rounded-lg border px-3 py-2"
                />
              </label>
              <div className="flex flex-col">
                <span className="text-gray-600">
                  พลังงานที่ต้องการต่อวัน (kcal)
                </span>
                <div className="mt-1 rounded-lg border px-3 py-2 bg-white">
                  {dailyCalorie} kcal
                </div>
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-500">
              *ค่านี้เป็นค่าประมาณการเท่านั้น
              ควรอ้างอิงคำแนะนำบนฉลากอาหารและปรึกษาสัตวแพทย์
            </div>
          </div>
          <div className="rounded-xl border p-4">
            <div className="font-medium text-gray-800 mb-2">
              ตัวอย่างตารางเวลา
            </div>
            <ul className="list-disc pl-6 space-y-1 text-gray-700">
              <li>**อายุ 2-3 เดือน**: 3-4 มื้อต่อวัน</li>
              <li>**อายุ 4-6 เดือน**: 3 มื้อต่อวัน</li>
              <li>**อายุ 6 เดือนขึ้นไป**: 2-3 มื้อต่อวัน</li>
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
            เนื้อหาเรียบเรียงจากแนวทางปฏิบัติทั่วไปและคำแนะนำจากผู้เชี่ยวชาญด้านโภชนาการสุนัข
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              บทความต้นฉบับ: PURINA® Pro Plan® - Training and Healthy Puppies
            </li>
            <li>สัตวแพทย์ที่ดูแลลูกหมาของคุณ</li>
          </ul>
        </div>
      </Modal>
    </section>
  );
};

export default ArticleDetail3;
