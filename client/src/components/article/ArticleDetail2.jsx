import React, { useMemo, useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import dogImg from "../home/images/หมา2.jpg";
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
  <span className="inline-flex items-center rounded-full bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 text-xs">
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
const ArticleDetail2 = () => {
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
      { id: "intro", label: "ภาพรวม: ความสำคัญของการออกกำลังกาย" },
      { id: "plan", label: "วางแผนการออกกำลังกายให้เหมาะสม" },
      { id: "bcstools", label: "การประเมินรูปร่าง (BCS)" },
      { id: "warmup", label: "Warm-up & Cool-down" },
      { id: "exercises", label: "ตัวอย่างท่า/กิจกรรม (ในบ้าน-นอกบ้าน)" },
      { id: "schedule", label: "ตารางตัวอย่าง/แผนรายสัปดาห์" },
      { id: "equipment", label: "อุปกรณ์ที่แนะนำ" },
      { id: "puppy_senior", label: "ลูกสุนัข & สุนัขสูงอายุ" },
      { id: "safety", label: "ความปลอดภัย & สัญญาณเตือน" },
      { id: "signs", label: "สัญญาณอันตราย" },
      { id: "faq", label: "คำถามพบบ่อย" },
    ],
    []
  );

  // --- Planner (แนวทางอย่างคร่าว)
  const [dogWeight, setDogWeight] = useState(10); // กก.
  const [activityLevel, setActivityLevel] = useState("medium");
  const dailyActivityTime = useMemo(() => {
    switch (activityLevel) {
      case "low":
        return "20-30 นาที";
      case "medium":
        return "45-60 นาที";
      case "high":
        return "มากกว่า 60 นาที";
      default:
        return "45-60 นาที";
    }
  }, [activityLevel]);

  return (
    <section ref={progressRef} className="bg-gray-50 min-h-screen">
      {/* Reading progress bar */}
      <div className="sticky top-0 z-50 h-1 w-full bg-gray-200">
        <div
          className="h-1 bg-blue-500 transition-[width] duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* -------- Main -------- */}
          <article className="flex-1 max-w-3xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="p-6 lg:p-8 border-b bg-gradient-to-b from-white to-blue-50/40">
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                
                <span className="ml-auto">
                  <Badge>Dog Health</Badge>
                </span>
              </div>

              <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 leading-snug mt-4">
                คู่มือการออกกำลังกายสำหรับสุนัข
              </h1>
              <p className="text-gray-600 mt-3">
                สร้างนิสัยที่ดีเพื่อสุขภาพกายและใจที่แข็งแรงของสุนัขที่คุณรัก
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
                  className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700 hover:bg-blue-100"
                >
                  ตัวช่วยวางแผนการออกกำลังกาย
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
                src={dogImg}
                alt="dog exercising cover"
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
                      <a href={`#${t.id}`} className="hover:text-blue-700">
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
              <div className="hidden lg:block mb-8 rounded-xl border border-blue-100 bg-blue-50 p-5">
                <div className="text-sm font-semibold text-blue-800 mb-2">
                  📜 สารบัญ
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-blue-900">
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
                  ภาพรวม: ความสำคัญของการออกกำลังกาย
                </h2>
                <p className="mt-3 text-gray-700 leading-7">
                  การออกกำลังกายมีบทบาทสำคัญต่อสุขภาพร่างกายและจิตใจของสุนัข
                  ไม่ว่าจะเป็นการควบคุมน้ำหนัก ป้องกันโรคหัวใจ/ข้อ และลดพฤติกรรม
                  เช่น การเห่า ทำลายข้าวของ หรือซึมเศร้า
                  การออกกำลังกายที่เหมาะสม
                  ยังช่วยเพิ่มสายสัมพันธ์ระหว่างเจ้าของและสัตว์เลี้ยงอีกด้วย
                </p>
                <div className="mt-4 grid sm:grid-cols-3 gap-3">
                  <KeyPoint
                    title="สุขภาพกาย"
                    desc="ลดความเสี่ยงโรคอ้วน เสริมกล้ามเนื้อและความยืดหยุ่น"
                  />
                  <KeyPoint
                    title="สุขภาพใจ"
                    desc="ลดความเครียด กระตุ้นสมอง ลดพฤติกรรมก้าวร้าว/ทำลาย"
                  />
                  <KeyPoint
                    title="ความสัมพันธ์"
                    desc="กิจกรรมร่วมกันเสริมความผูกพันและความเชื่อฟัง"
                  />
                </div>
              </section>

              <hr className="my-8" />

              <section id="plan" className="scroll-mt-24">
                <h2 className="text-xl font-bold text-gray-800">
                  วางแผนการออกกำลังกายให้เหมาะสม
                </h2>
                <p className="mt-3 text-gray-700 leading-8">
                  เริ่มจากประเมินอายุ น้ำหนัก สายพันธุ์ และเงื่อนไขสุขภาพ
                  สุนัขบางสายพันธุ์ต้องการพลังงานมาก (เช่น Border Collie,
                  Australian Shepherd) ขณะที่บางสายพันธุ์ (เช่น Bulldog)
                  เหมาะกับกิจกรรมสั้นและไม่หนักมาก การปรับระดับกิจกรรม
                  ควรทำอย่างค่อยเป็นค่อยไปและติดตามผลเป็นสัปดาห์
                </p>
                <div className="mt-4 grid sm:grid-cols-2 gap-4">
                  <div className="rounded-xl border p-4 bg-gray-50">
                    <div className="font-medium">เริ่มอย่างไร</div>
                    <ul className="list-disc pl-6 mt-2 text-gray-700 space-y-1">
                      <li>เริ่มจาก 10–15 นาที/ครั้ง แล้วเพิ่มทีละน้อย</li>
                      <li>ผสมกิจกรรมแบบมีแรงกับแบบคาร์ดิโอ</li>
                      <li>เว้นวันที่สุนัขพักเพื่อให้กล้ามเนื้อฟื้นตัว</li>
                    </ul>
                  </div>
                  <div className="rounded-xl border p-4 bg-gray-50">
                    <div className="font-medium">วัดผล</div>
                    <ul className="list-disc pl-6 mt-2 text-gray-700 space-y-1">
                      <li>ชั่งน้ำหนักทุก 2–4 สัปดาห์</li>
                      <li>สังเกตพฤติกรรม การกิน และระดับพลังงาน</li>
                    </ul>
                  </div>
                </div>
              </section>

              <hr className="my-8" />

              <section id="bcstools" className="scroll-mt-24">
                <h2 className="text-xl font-bold text-gray-800">
                  การประเมินรูปร่าง (BCS)
                </h2>
                <p className="mt-3 text-gray-700 leading-8">
                  Body Condition Score (BCS)
                  ช่วยบอกว่าเจ้าสุนัขมีไขมันสะสมเท่าไร โดยทั่วไปแบ่งเป็น
                  5-หรือ10 ระดับ การรู้ BCS ช่วยกำหนดปริมาณอาหาร
                  และความเข้มข้นของการออกกำลังกายที่ควรทำ
                </p>
                <div className="mt-4 bg-orange-50 border border-orange-200 rounded-xl p-4 text-orange-900 text-sm">
                  ⚠️ หากไม่แน่ใจเกี่ยวกับการประเมินหรือมีปัญหาสุขภาพ
                  ควรขอคำปรึกษาจากสัตวแพทย์
                </div>
              </section>

              <hr className="my-8" />

              <section id="warmup" className="scroll-mt-24">
                <h2 className="text-xl font-bold text-gray-800">
                  Warm-up & Cool-down
                </h2>
                <p className="mt-3 text-gray-700 leading-8">
                  ก่อนออกกำลังกาย ควรทำ warm-up 5–10 นาที เช่น เดินช้า ๆ ยืดเบา
                  ๆ เพื่อเตรียมกล้ามเนื้อและหัวใจ หลังจบการออกกำลังกาย
                  ให้คูลดาวน์ด้วยการเดินช้าและยืดกล้ามเนื้อเพื่อลดการบาดเจ็บ
                </p>
                <ul className="list-disc pl-6 mt-3 text-gray-700 space-y-2">
                  <li>เดินช้า 3–5 นาที ก่อนวิ่งหรือเล่นหนัก</li>
                  <li>หลังออกกำลังกาย เดินช้าอีก 5 นาที เพื่อลดการหายใจหอบ</li>
                </ul>
              </section>

              <hr className="my-8" />

              <section id="exercises" className="scroll-mt-24">
                <h2 className="text-xl font-bold text-gray-800">
                  ตัวอย่างท่า/กิจกรรม
                </h2>
                <p className="mt-3 text-gray-700 leading-8">
                  แบ่งกิจกรรมตามพื้นที่: ในบ้าน (Indoor) และนอกบ้าน (Outdoor)
                </p>
                <div className="mt-4 grid sm:grid-cols-2 gap-4">
                  <div className="rounded-xl border p-4 bg-gray-50">
                    <div className="font-medium">กิจกรรมในบ้าน</div>
                    <ul className="list-disc pl-6 mt-2 text-gray-700 space-y-1">
                      <li>เล่น Fetch แบบสั้นในโถง</li>
                      <li>ซ่อนขนมหรือของเล่นให้ค้นหา (nose work)</li>
                      <li>ใช้บันไดหรือที่ปีนป่ายในบ้าน (ระมัดระวังพื้นลื่น)</li>
                      <li>ฝึกคำสั่งผสมการเคลื่อนไหว เช่น sit→stay→come</li>
                    </ul>
                  </div>
                  <div className="rounded-xl border p-4 bg-gray-50">
                    <div className="font-medium">กิจกรรมนอกบ้าน</div>
                    <ul className="list-disc pl-6 mt-2 text-gray-700 space-y-1">
                      <li>เดินเร็ว 20–40 นาที</li>
                      <li>วิ่งจ๊อกกิ้งร่วมกับเจ้าของ (ค่อย ๆ เพิ่มระยะ)</li>
                      <li>
                        ว่ายน้ำสำหรับสุนัขที่ชอบ เป็นการออกกำลังกายแบบ
                        low-impact
                      </li>
                      <li>
                        เข้าคอร์ส Agility เพื่อพัฒนาความว่องไวและความยืดหยุ่น
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              <hr className="my-8" />

              <section id="schedule" className="scroll-mt-24">
                <h2 className="text-xl font-bold text-gray-800">
                  ตารางตัวอย่าง / แผนรายสัปดาห์
                </h2>
                <p className="mt-3 text-gray-700 leading-8">
                  ต่อไปนี้เป็นแผนตัวอย่างสำหรับสุนัขระดับปกติ (ปานกลาง)
                  ปรับลดหรือเพิ่มตาม BCS และระดับพลังงานของสุนัข
                </p>
                <div className="mt-4 space-y-3 text-sm text-gray-700">
                  <div className="rounded-xl border p-4 bg-gray-50">
                    <div className="font-medium">แผน 5 วัน (ตัวอย่าง)</div>
                    <ol className="list-decimal pl-6 mt-2 space-y-1">
                      <li>จันทร์: เดินเร็ว 30 นาที + เล่น Fetch 10 นาที</li>
                      <li>อังคาร: เดินช้า 20 นาที + ฝึกคำสั่ง 15 นาที</li>
                      <li>พุธ: วิ่งจ๊อกกิ้ง 20–30 นาที</li>
                      <li>พฤหัส: ว่ายน้ำ/เล่นน้ำ 20 นาที หรือกิจกรรมเบา</li>
                      <li>ศุกร์: เดินสำรวจธรรมชาติ 40 นาที</li>
                    </ol>
                  </div>
                  <div className="text-xs text-gray-500">
                    พักเต็มวัน 1–2 วันต่อสัปดาห์ ขึ้นกับความเหนื่อยของสุนัข
                  </div>
                </div>
              </section>

              <hr className="my-8" />

              <section id="equipment" className="scroll-mt-24">
                <h2 className="text-xl font-bold text-gray-800">
                  อุปกรณ์ที่แนะนำ
                </h2>
                <ul className="list-disc pl-6 mt-3 text-gray-700 space-y-2">
                  <li>
                    สายจูงที่เหมาะสมและมีการยับยั้งแรงดึง (no-pull harness)
                  </li>
                  <li>ลูกบอล/ของเล่นคายแรงกระแทก</li>
                  <li>บันไดหรือแพลตฟอร์มสำหรับการฝึกข้ามระดับ</li>
                  <li>อุปกรณ์ Agility พื้นฐาน เช่น ฮูลาฮูป/คอนชู/slalom</li>
                </ul>
              </section>

              <hr className="my-8" />

              <section id="puppy_senior" className="scroll-mt-24">
                <h2 className="text-xl font-bold text-gray-800">
                  ลูกสุนัข & สุนัขสูงอายุ
                </h2>
                <p className="mt-3 text-gray-700 leading-8">
                  ลูกสุนัข: หลีกเลี่ยงการออกกำลังกายหนักจนเกินไป
                  ข้อต่อยังไม่แข็งแรง
                  จำกัดกิจกรรมมีแรงกระแทกและเน้นการฝึกพื้นฐานในช่วงโตกว่า 4-6
                  เดือน
                </p>
                <p className="mt-2 text-gray-700 leading-8">
                  สุนัขสูงอายุ: เลือกกิจกรรม low-impact เช่น เดินช้า ว่ายน้ำเบา
                  ๆ และยืดกล้ามเนื้อเพื่อป้องกันข้ออักเสบ
                  ปรึกษาสัตวแพทย์ก่อนเพิ่มความเข้มข้น
                </p>
              </section>

              <hr className="my-8" />

              <section id="safety" className="scroll-mt-24">
                <h2 className="text-xl font-bold text-gray-800">
                  ความปลอดภัย & สัญญาณเตือน
                </h2>
                <p className="mt-3 text-gray-700 leading-8">
                  ปัจจัยด้านสภาพอากาศ พื้นผิว
                  และสภาพร่างกายของสุนัขมีผลต่อการออกกำลังกาย
                  หลีกเลี่ยงกิจกรรมหนักในวันที่อากาศร้อนจัด
                  และตรวจสอบพื้นให้ไม่ลื่น
                </p>
                <ul className="list-disc pl-6 mt-3 text-gray-700 space-y-2">
                  <li>อย่าให้สุนัขวิ่งบนพื้นร้อน (เช่น ถนนยางร้อน)</li>
                  <li>ระวังการหายใจหอบมากเกินไปหลังออกกำลังกาย</li>
                  <li>เตรียมผ้าชุบน้ำและน้ำสะอาดในที่ทำกิจกรรม</li>
                </ul>
              </section>

              <hr className="my-8" />

              <section id="signs" className="scroll-mt-24">
                <h2 className="text-xl font-bold text-gray-800">
                  สัญญาณอันตรายที่ต้องระวัง
                </h2>
                <ul className="list-disc pl-6 mt-3 text-gray-700 space-y-2">
                  <li>หายใจหอบถี่ผิดปกติ หรือหายใจไม่ออก</li>
                  <li>ล้มหรือไม่สามารถเดินต่อได้</li>
                  <li>อาเจียนมาก อาการชัก หรือซึมผิดปกติ</li>
                </ul>
                <div className="mt-4 text-xs text-gray-500">
                  *หากพบอาการเหล่านี้
                  ควรหยุดกิจกรรมทันทีและพาสุนัขไปพบสัตวแพทย์*
                </div>
              </section>

              <hr className="my-8" />

              <section id="faq" className="scroll-mt-24">
                <h2 className="text-xl font-bold text-gray-800">คำถามพบบ่อย</h2>
                <div className="mt-3 grid sm:grid-cols-2 gap-4">
                  <KeyPoint
                    title="ควรออกกำลังกายบ่อยแค่ไหน?"
                    desc="อย่างน้อยวันละ 30–60 นาที ขึ้นกับขนาดและพลังงานของสุนัข"
                  />
                  <KeyPoint
                    title="สุนัขแก่ต้องออกกำลังกายไหม?"
                    desc="ใช่ แต่ควรเป็นกิจกรรมที่เบา ปรึกษาสัตวแพทย์สำหรับกรณีมีโรคข้อหรือหัวใจ"
                  />
                  <KeyPoint
                    title="จะรู้ว่าสุนัขเหนื่อยเกินไปอย่างไร?"
                    desc="ถ้าสุนัขหยุดเล่น หายใจหนักมาก หรือไม่อยากลุก ควรพักทันที"
                  />
                  <KeyPoint
                    title="ควรเริ่มตอนไหน?"
                    desc="เริ่มเมื่อสุนัขพร้อม สุภาพสำหรับลูกสุนัขให้เริ่มช้า ๆ และเพิ่มตามวัย"
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
                แนวทางการฝึกสุนัขให้ออกกำลังกายอย่างปลอดภัยและมีประสิทธิภาพ
                เพื่อสุขภาพที่ดี
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge>Health Guide</Badge>
                <Badge>Dog Exercise</Badge>
                <Badge>Body Condition</Badge>
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
                  className="w-full rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700 hover:bg-blue-100"
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
        title="Key Takeaways: การออกกำลังกายสุนัข"
      >
        <div className="space-y-3 text-sm text-gray-700">
          <div className="grid sm:grid-cols-2 gap-3">
            <KeyPoint
              title="เหมาะสมกับวัย"
              desc="ปรับกิจกรรมให้เข้ากับอายุและสุขภาพของสุนัข"
            />
            <KeyPoint title="สม่ำเสมอ" desc="ออกกำลังกายเป็นประจำทุกวัน" />
            <KeyPoint
              title="สังเกตอาการ"
              desc="หยุดพักหากสุนัขเหนื่อยหอบหรือแสดงอาการผิดปกติ"
            />
            <KeyPoint
              title="BCS"
              desc="ประเมินรูปร่างสุนัขเพื่อคุมน้ำหนักให้พอดี"
            />
          </div>
        </div>
      </Modal>

      <Modal
        open={openPlanner}
        onClose={() => setOpenPlanner(false)}
        title="ตัวช่วยวางแผนการออกกำลังกาย (แนวทางคร่าวๆ)"
      >
        <div className="space-y-5 text-sm">
          <div className="rounded-xl border p-4 bg-gray-50">
            <div className="grid sm:grid-cols-2 gap-3">
              <label className="flex flex-col">
                <span className="text-gray-600">น้ำหนักสุนัข (กก.)</span>
                <input
                  type="number"
                  step="0.1"
                  min="2"
                  max="50"
                  value={dogWeight}
                  onChange={(e) =>
                    setDogWeight(parseFloat(e.target.value || "0"))
                  }
                  className="mt-1 rounded-lg border px-3 py-2"
                />
              </label>
              <label className="flex flex-col">
                <span className="text-gray-600">ระดับกิจกรรม</span>
                <select
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value)}
                  className="mt-1 rounded-lg border px-3 py-2"
                >
                  <option value="low">น้อย (สุนัขแก่/ขี้เกียจ)</option>
                  <option value="medium">ปานกลาง (ทั่วไป)</option>
                  <option value="high">สูง (พลังงานเยอะ/นักกีฬา)</option>
                </select>
              </label>
            </div>
            <div className="mt-3 text-gray-600">
              ควรใช้เวลาออกกำลังกายประมาณ {dailyActivityTime} ต่อวัน
            </div>
            <div className="mt-3 text-xs text-gray-500">
              *เป็นค่ากลางคร่าว ๆ เท่านั้น
              ควรปรึกษาสัตวแพทย์หากมีข้อกังวลเกี่ยวกับสุขภาพ
            </div>
          </div>

          <div className="rounded-xl border p-4">
            <div className="font-medium text-gray-800 mb-2">
              ตัวอย่างกิจกรรม
            </div>
            <ul className="list-disc pl-6 space-y-1 text-gray-700">
              <li>**ระดับน้อย**: การเดินเล่นช้าๆ ในสวนสาธารณะ</li>
              <li>**ระดับปานกลาง**: การเดินเร็ว, เล่น Fetch (คาบของ)</li>
              <li>**ระดับสูง**: การวิ่งจ๊อกกิ้ง, ว่ายน้ำ, หรือ Dog Agility</li>
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
            เนื้อหาเรียบเรียงขึ้นจากหลักการทั่วไปของการออกกำลังกายและการประเมินรูปร่างในสุนัข
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>ปรึกษาสัตวแพทย์สำหรับคำแนะนำที่เฉพาะเจาะจงกับสุนัขของคุณ</li>
          </ul>
        </div>
      </Modal>
    </section>
  );
};

export default ArticleDetail2;
