import React, { useMemo, useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import catLickingImg from "../home/images/cat-licking-fur-1024x538.jpg";
import catn1ipImg from "../home/images/ปกแมว1.jpg";
import dog2ipImg from "../home/images/หมา2.jpg";
import dog3ipImg from "../home/images/มือ.webp";
import cat2ipImg from "../home/images/แมว4.jpg";
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
  <span className="inline-flex items-center rounded-full bg-orange-50 text-orange-700 border border-orange-200 px-3 py-1 text-xs">
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
const ArticleDetail5 = () => {
  // --- Modal states
  const [openSummary, setOpenSummary] = useState(false);
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
      { id: "intro", label: "ภาพรวม: พฤติกรรมเลียขนของแมว" },
      { id: "physical-causes", label: "สาเหตุทางกายภาพ" },
      { id: "psychological-causes", label: "สาเหตุทางจิตวิทยา" },
      { id: "solutions", label: "วิธีแก้ไขและรับมือ" },
      { id: "when-to-see-vet", label: "เมื่อไหร่ควรไปหาสัตวแพทย์" },
    ],
    []
  );

  return (
    <section ref={progressRef} className="bg-gray-50 min-h-screen">
      {/* Reading progress bar */}
      <div className="sticky top-0 z-50 h-1 w-full bg-gray-200">
        <div
          className="h-1 bg-orange-500 transition-[width] duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* -------- Main -------- */}
          <article className="flex-1 max-w-3xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="p-6 lg:p-8 border-b bg-gradient-to-b from-white to-orange-50/40">
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                
                <span className="ml-auto">
                  <Badge>Cat Grooming</Badge>
                </span>
              </div>

              <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 leading-snug mt-4">
                แมวเลียขนบ่อยมากเกินไป: ทำไมแมวถึงมีพฤติกรรมเช่นนั้น
                และแก้ไขอย่างไรดี?
              </h1>
              <p className="text-gray-600 mt-3">
                เข้าใจพฤติกรรมการเลียขนที่มากเกินไปของแมว
                และหาวิธีช่วยให้แมวของคุณกลับมาผ่อนคลายอีกครั้ง
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  onClick={() => setOpenSummary(true)}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm hover:border-gray-300 hover:bg-gray-50"
                >
                  สรุปย่อ (Key Takeaways)
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
                src={catLickingImg}
                alt="cat licking fur"
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
                      <a href={`#${t.id}`} className="hover:text-orange-700">
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
              <div className="hidden lg:block mb-8 rounded-xl border border-orange-100 bg-orange-50 p-5">
                <div className="text-sm font-semibold text-orange-800 mb-2">
                  📜 สารบัญ
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-orange-900">
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
                  ภาพรวม: พฤติกรรมเลียขนของแมว
                </h2>
                <p className="mt-3 text-gray-700 leading-7">
                  การเลียขนเป็นพฤติกรรมปกติที่ช่วยทำความสะอาดและควบคุมอุณหภูมิ
                  แต่เมื่อแมวทำมากจนเกิดแผล ขนร่วง หรือมีพฤติกรรมหมกมุ่น
                  เราต้องหาสาเหตุทั้งทางกายและจิตใจเพื่อแก้ไขอย่างยั่งยืน
                </p>
                <div className="mt-4 grid sm:grid-cols-3 gap-3">
                  <KeyPoint
                    title="ทำไมถึงสำคัญ"
                    desc="ป้องกันการเกิดแผลและการติดเชื้อ"
                  />
                  <KeyPoint
                    title="ต้องแยกสาเหตุ"
                    desc="อาจมาจากผิวหนัง, ความเจ็บปวด, หรือความเครียด"
                  />
                  <KeyPoint
                    title="แนวทาง"
                    desc="ตรวจรักษา ปรับสภาพแวดล้อม และฝึกพฤติกรรม"
                  />
                </div>
              </section>

              <hr className="my-8" />

              <section id="physical-causes" className="scroll-mt-24">
                <h2 className="text-xl font-bold text-gray-800">
                  สาเหตุทางกายภาพ
                </h2>
                <p className="mt-3 text-gray-700 leading-7">
                  สาเหตุทางกายภาพที่มักพบ:
                </p>
                <ul className="list-disc pl-6 mt-3 text-gray-700 space-y-2">
                  <li>
                    <strong>ปรสิตภายนอก</strong>: หมัด เห็บ ทำให้คันจนน่ารำคาญ
                  </li>
                  <li>
                    <strong>การติดเชื้อ/เชื้อรา</strong>: เกิดผื่น แผล
                    หรือกลิ่นไม่พึงประสงค์
                  </li>
                  <li>
                    <strong>โรคผิวหนังภูมิแพ้</strong>:
                    ตอบสนองต่ออาหารหรือสิ่งแวดล้อม
                  </li>
                  <li>
                    <strong>ความเจ็บปวด</strong>:
                    แมวเลียเพื่อบรรเทาอาการเจ็บบริเวณใดบริเวณหนึ่ง (เช่น ข้อต่อ)
                  </li>
                  <li>
                    <strong>ปัญหาทางระบบ</strong>: โรคไต เบาหวาน
                    หรือฮอร์โมนที่เปลี่ยน ทำให้พฤติกรรมเปลี่ยน
                  </li>
                </ul>
                <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4 text-red-900 text-sm">
                  ⚠️ หากสงสัยสาเหตุทางกายภาพ
                  ควรเข้าพบสัตวแพทย์เพื่อตรวจรักษาและรับการรักษาที่เหมาะสม
                </div>
              </section>

              <hr className="my-8" />

              <section id="psychological-causes" className="scroll-mt-24">
                <h2 className="text-xl font-bold text-gray-800">
                  สาเหตุทางจิตวิทยาและพฤติกรรม
                </h2>
                <p className="mt-3 text-gray-700 leading-7">
                  พฤติกรรมเลียมากเกินไปมักเป็นวิธีการรับมือกับความเครียดหรือความเบื่อ:
                </p>
                <ul className="list-disc pl-6 mt-3 text-gray-700 space-y-2">
                  <li>
                    <strong>ความเครียด/ความวิตกกังวล</strong>:
                    การเปลี่ยนสภาพแวดล้อม, คนใหม่, หรือเสียงดัง
                  </li>
                  <li>
                    <strong>การเบื่อ</strong>: ขาดการกระตุ้นทางกิจกรรมและจิตใจ
                  </li>
                  <li>
                    <strong>พฤติกรรมแบบหมกมุ่น</strong>:
                    บางตัวอาจพัฒนาจนกลายเป็น OCD ของสัตว์
                  </li>
                </ul>
              </section>

              <hr className="my-8" />

              <section id="diagnosis" className="scroll-mt-24">
                <h2 className="text-xl font-bold text-gray-800">
                  การวินิจฉัยและการตรวจที่สัตวแพทย์อาจทำ
                </h2>
                <p className="mt-3 text-gray-700 leading-7">
                  สัตวแพทย์มักทำการซักประวัติ ตรวจร่างกาย
                  และอาจแนะนำการตรวจเพิ่มเติม เช่น:
                </p>
                <ul className="list-disc pl-6 mt-3 text-gray-700 space-y-2">
                  <li>ตรวจผิว/ขน สำหรับปรสิตหรือการติดเชื้อ</li>
                  <li>การขูดผิวหรือส่งตัวอย่างไปเพาะเชื้อ</li>
                  <li>การตรวจเลือดและปัสสาวะ เพื่อตรวจโรคระบบภายใน</li>
                  <li>การทำ allergy test หรือ trial diet เพื่อตรวจความแพ้</li>
                </ul>
              </section>

              <hr className="my-8" />

              <section id="solutions" className="scroll-mt-24">
                <h2 className="text-xl font-bold text-gray-800">
                  การแก้ไขและรับมือเชิงปฏิบัติ
                </h2>
                <p className="mt-3 text-gray-700 leading-7">
                  การรักษามักเป็นการรวมหลายวิธี ทั้งการแพทย์และการปรับพฤติกรรม:
                </p>
                <div className="mt-3 space-y-3 text-gray-700">
                  <div>
                    <strong>การรักษาทางการแพทย์</strong>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>ยากำจัดหมัด/เห็บ และการรักษาการติดเชื้อ</li>
                      <li>
                        ยาต้านการอักเสบหรือคอร์ติโคสเตียรอยด์ในกรณีจำเป็น
                        (ภายใต้คำแนะนำสัตวแพทย์)
                      </li>
                      <li>ยาปฏิชีวนะหรือยาต้านเชื้อราเมื่อจำเป็น</li>
                    </ul>
                  </div>
                  <div>
                    <strong>การจัดการสภาพแวดล้อม</strong>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>
                        ลดแหล่งความเครียด เช่น แยกพื้นที่ให้แมวเมื่อมีสิ่งรบกวน
                      </li>
                      <li>
                        ใช้ Feliway (ฟีโรโมนสังเคราะห์) ช่วยสร้างความผ่อนคลาย
                      </li>
                      <li>ให้มุมหลบซ่อนและที่สูงเพื่อให้แมวรู้สึกปลอดภัย</li>
                    </ul>
                  </div>
                  <div>
                    <strong>การปรับพฤติกรรม</strong>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>
                        เพิ่มการเล่นและกิจกรรมวันละหลายช่วงเพื่อลดความเบื่อ
                      </li>
                      <li>
                        ใช้ของเล่นแบบให้รางวัล (puzzle feeder) เพื่อกระตุ้นสมอง
                      </li>
                      <li>
                        ใช้เทคนิค desensitization
                        ในกรณีความเครียดจากสิ่งเร้าเฉพาะ
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              <hr className="my-8" />

              <section id="grooming" className="scroll-mt-24">
                <h2 className="text-xl font-bold text-gray-800">
                  การดูแลขนและผิวหนัง
                </h2>
                <p className="mt-3 text-gray-700 leading-7">
                  การดูแลขนเป็นส่วนหนึ่งของการป้องกันและรักษา:
                </p>
                <ul className="list-disc pl-6 mt-3 text-gray-700 space-y-2">
                  <li>แปรงขนสม่ำเสมอเพื่อลดการกลืนขนและก้อนขน</li>
                  <li>อาบน้ำ/ใช้แชมพูเฉพาะเมื่อสัตวแพทย์แนะนำ</li>
                  <li>
                    ตรวจดูผิวหนังเป็นประจำ เพื่อจับสัญญาณการอักเสบแต่เนิ่น ๆ
                  </li>
                </ul>
              </section>

              <hr className="my-8" />

              <section id="prevention" className="scroll-mt-24">
                <h2 className="text-xl font-bold text-gray-800">
                  การป้องกันและการดูแลระยะยาว
                </h2>
                <p className="mt-3 text-gray-700 leading-7">
                  การป้องกันช่วยลดการเกิดพฤติกรรมเลียมากเกินไป:
                </p>
                <ul className="list-disc pl-6 mt-3 text-gray-700 space-y-2">
                  <li>โปรแกรมกำจัดปรสิตอย่างสม่ำเสมอ</li>
                  <li>โภชนาการที่เหมาะสม ลดความเสี่ยงภูมิแพ้จากอาหาร</li>
                  <li>
                    สภาพแวดล้อมที่กระตุ้นพฤติกรรมตามธรรมชาติ เช่น ที่ปีน ชั้น
                  </li>
                </ul>
              </section>

              <hr className="my-8" />

              <section id="case-studies" className="scroll-mt-24">
                <h2 className="text-xl font-bold text-gray-800">
                  กรณีศึกษา (ตัวอย่าง)
                </h2>
                <div className="mt-3 text-gray-700 space-y-3">
                  <div>
                    <strong>กรณี 1:</strong> แมวที่มีหมัดมาก
                    ทำให้เลียมากและมีแผล —
                    หลังการกำจัดหมัดและใช้ยาสเตียรอยด์ชั่วคราว อาการค่อย ๆ
                    ดีขึ้น
                  </div>
                  <div>
                    <strong>กรณี 2:</strong>{" "}
                    แมวที่ย้ายบ้านแล้วเริ่มเลียตัวเองมากขึ้น — การใช้ Feliway,
                    ให้ที่หลบซ่อน และเพิ่มเวลาสนุกกับเจ้าของ ช่วยลดพฤติกรรมได้
                  </div>
                </div>
              </section>

              <hr className="my-8" />

              <section id="when-to-see-vet" className="scroll-mt-24">
                <h2 className="text-xl font-bold text-gray-800">
                  เมื่อไหร่ควรไปหาสัตวแพทย์
                </h2>
                <p className="mt-3 text-gray-700 leading-7">
                  พาไปพบสัตวแพทย์ทันทีเมื่อ:
                </p>
                <ul className="list-disc pl-6 mt-3 text-gray-700 space-y-2">
                  <li>มีแผลหรือเลือดจากการเลีย</li>
                  <li>ขนร่วงเป็นหย่อมใหญ่หรือผิวหนังอักเสบรุนแรง</li>
                  <li>พฤติกรรมหมกมุ่นจนส่งผลต่อการกินและความเป็นอยู่</li>
                </ul>
              </section>

              <hr className="my-8" />

              <section id="faq" className="scroll-mt-24">
                <h2 className="text-xl font-bold text-gray-800">คำถามพบบ่อย</h2>
                <div className="mt-3 grid sm:grid-cols-2 gap-4">
                  <KeyPoint
                    title="แมวเลียเป็นแผง ผิวหนังแดง ควรทำยังไง?"
                    desc="อย่าปล่อยทิ้งไว้ รีบพาไปพบสัตวแพทย์เพื่อตรวจหาเชื้อ, ปรสิต หรืออาการแพ้"
                  />
                  <KeyPoint
                    title="ใช้ปลอกคอกันเลียได้ไหม?"
                    desc="ปลอกคออาจช่วยป้องกันแผลระยะสั้น แต่ต้องแก้สาเหตุและไม่ควรเป็นการแก้ปัญหาระยะยาว"
                  />
                  <KeyPoint
                    title="อาหารเปลี่ยนได้หรือไม่?"
                    desc="หากสงสัยแพ้อาหาร ให้ปรึกษาสัตวแพทย์และลอง trial diet ภายใต้การดูแล"
                  />
                  <KeyPoint
                    title="พฤติกรรมจากความเครียดหายไหม?"
                    desc="เป็นไปได้ที่จะดีขึ้นเมื่อแก้สาเหตุและเพิ่มการกระตุ้น แต่บางกรณีอาจต้องใช้เวลานานหรือการรักษาด้วยจิตเวชสัตว์"
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
                ทำความเข้าใจสาเหตุและวิธีจัดการกับพฤติกรรมการเลียขนที่มากเกินไปของแมว
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge>Cat Behavior</Badge>
                <Badge>Problem Solving</Badge>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                  onClick={() => setOpenSummary(true)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs hover:bg-gray-100"
                >
                  สรุปย่อ
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
        title="Key Takeaways: แมวเลียขนบ่อยเกินไป"
      >
        <div className="space-y-3 text-sm text-gray-700">
          <div className="grid sm:grid-cols-2 gap-3">
            <KeyPoint
              title="สาเหตุทางกายภาพ"
              desc="อาจมาจากอาการคัน, ผิวหนังอักเสบ, หรือความเจ็บปวด"
            />
            <KeyPoint
              title="สาเหตุทางจิตวิทยา"
              desc="เกิดจากความเครียด เช่น การเปลี่ยนที่อยู่หรือความเบื่อ"
            />
            <KeyPoint
              title="การแก้ไข"
              desc="แก้ไขที่ต้นเหตุ, ปรับสภาพแวดล้อม และใช้เวลาเล่นกับแมวมากขึ้น"
            />
            <KeyPoint
              title="เมื่อไหร่ควรไปหาหมอ"
              desc="หากพบแผล, ขนร่วงเป็นหย่อม, หรืออาการผิดปกติอื่นๆ"
            />
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
            เนื้อหาเรียบเรียงจากบทความของ Kingkong Petshop และข้อมูลจากสัตวแพทย์
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Kingkong Petshop: แมวเลียขนตัวเองบ่อยเกินไป...</li>
            <li>ควรปรึกษาสัตวแพทย์หากมีข้อกังวลเกี่ยวกับสุขภาพแมวของคุณ</li>
          </ul>
        </div>
      </Modal>
    </section>
  );
};

export default ArticleDetail5;
