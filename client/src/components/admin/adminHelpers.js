import React from "react";
import { CreditCard, QrCode, Banknote, Wallet } from "lucide-react";

export const paymentMethodMap = {
  card: {
    label: "บัตรเครดิต/เดบิต",
    icon: React.createElement(CreditCard, {
      size: 16,
      className: "text-blue-600",
    }),
    color: "bg-blue-50 text-blue-700 border-blue-200",
  },
  promptpay: {
    label: "PromptPay (QR)",
    icon: React.createElement(QrCode, {
      size: 16,
      className: "text-indigo-600",
    }),
    color: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  cash: {
    label: "เงินสดปลายทาง",
    icon: React.createElement(Banknote, {
      size: 16,
      className: "text-green-600",
    }),
    color: "bg-green-50 text-green-700 border-green-200",
  },
  wallet: {
    label: "วอลเล็ต",
    icon: React.createElement(Wallet, {
      size: 16,
      className: "text-amber-600",
    }),
    color: "bg-amber-50 text-amber-700 border-amber-200",
  },
  other: {
    label: "อื่น ๆ",
    icon: React.createElement(CreditCard, {
      size: 16,
      className: "text-gray-400",
    }),
    color: "bg-gray-50 text-gray-700 border-gray-200",
  },
};

export const normalizePaymentMethod = (raw) => {
  if (raw === null || raw === undefined) return null;
  if (Array.isArray(raw)) {
    for (const it of raw) {
      const r = normalizePaymentMethod(it);
      if (r) return r;
    }
    return null;
  }
  if (typeof raw === "object") {
    const tryFields = [
      raw.type,
      raw.method,
      raw.name,
      raw.id,
      raw.payment_method,
      raw.paymentMethod,
      raw.payment,
    ];
    for (const f of tryFields) {
      if (f) {
        const r = normalizePaymentMethod(f);
        if (r) return r;
      }
    }
    return null;
  }
  const s = String(raw).toLowerCase().trim();
  if (s.includes("card") || s.includes("credit") || s.includes("debit"))
    return "card";
  if (s.includes("prompt") || s.includes("promptpay") || s.includes("qr"))
    return "promptpay";
  if (s.includes("cash") || s.includes("cod")) return "cash";
  if (s.includes("wallet") || s.includes("gpay") || s.includes("paypal"))
    return "wallet";
  if (paymentMethodMap[s]) return s;
  return "other";
};

export const statusMap = {
  NOT_PROCESSED: {
    label: "รอดำเนินการ",
    color: "bg-gray-100 text-gray-700 border-gray-300",
    icon: React.createElement("span", { className: "inline-block mr-1" }, "⏳"),
  },
  PROCESSING: {
    label: "กำลังดำเนินการ",
    color: "bg-yellow-100 text-yellow-700 border-yellow-300",
    icon: React.createElement("span", { className: "inline-block mr-1" }, "🔄"),
  },
  DELIVERED: {
    label: "จัดส่งสำเร็จ",
    color: "bg-green-100 text-green-700 border-green-300",
    icon: React.createElement("span", { className: "inline-block mr-1" }, "✨"),
  },
  CANCELLED: {
    label: "ยกเลิก",
    color: "bg-red-100 text-red-700 border-red-300",
    icon: React.createElement("span", { className: "inline-block mr-1" }, "✖️"),
  },
};

// Simple helpers copied from AdminDashboard to keep behavior identical
export const getImageUrlFromEntry = (entry) => {
  if (!entry) return null;
  if (typeof entry === "string") return entry;
  if (Array.isArray(entry)) {
    for (const it of entry) {
      const v = getImageUrlFromEntry(it);
      if (v) return v;
    }
    return null;
  }
  if (typeof entry === "object") {
    const candidates = [
      "url",
      "secure_url",
      "path",
      "image",
      "src",
      "thumbnail",
      "publicUrl",
      "fileUrl",
      "urlFull",
    ];
    for (const k of candidates) if (entry[k]) return entry[k];
    if (entry.data && typeof entry.data === "object") {
      const nested = entry.data.attributes || entry.data;
      for (const k of candidates) if (nested[k]) return nested[k];
    }
    if (entry.image && typeof entry.image === "object")
      return getImageUrlFromEntry(entry.image);
    if (entry.attributes && typeof entry.attributes === "object")
      return getImageUrlFromEntry(entry.attributes);
    return null;
  }
  return null;
};

export const getProductImage = (p) => {
  if (!p) return null;
  const variantObj =
    p.variant && typeof p.variant === "object" ? p.variant : p.variant;
  const productObj =
    p.product && typeof p.product === "object" ? p.product : p.product;
  const variantImages = variantObj
    ? variantObj.images || variantObj.image || null
    : null;
  const productImages = productObj
    ? productObj.images || productObj.image || null
    : null;
  const vImg = getImageUrlFromEntry(variantImages);
  if (vImg) return vImg;
  const pImg = getImageUrlFromEntry(productImages);
  if (pImg) return pImg;
  const fallback = getImageUrlFromEntry(
    p.variantImage ||
      p.productImage ||
      p.image ||
      p.productImageUrl ||
      p.imageUrl ||
      null
  );
  if (fallback) return fallback;
  return null;
};

export const getValue = (obj, candidates) => {
  if (!obj || !candidates) return null;
  for (const cand of candidates) {
    if (!cand) continue;
    const parts = String(cand).split(".");
    let cur = obj;
    let ok = true;
    for (const p of parts) {
      if (cur == null) {
        ok = false;
        break;
      }
      cur = cur[p];
    }
    if (ok && cur !== undefined && cur !== null && cur !== "") return cur;
  }
  return null;
};

export const toNumber = (v) => {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  if (typeof v === "string") {
    const cleaned = v.replace(/[,\s]+/g, "").replace(/[^0-9.-]+/g, "");
    if (cleaned === "") return null;
    const n = Number(cleaned);
    return Number.isNaN(n) ? null : n;
  }
  return null;
};

export const getProductTitle = (p) => {
  if (!p) return "ไม่ระบุ";
  const variantObj =
    p.variant && typeof p.variant === "object" ? p.variant : p.variant;
  const productObj =
    p.product && typeof p.product === "object" ? p.product : p.product;
  const variantCandidates = [
    "title",
    "name",
    "label",
    "data.attributes.title",
    "data.attributes.name",
    "attributes.title",
    "attributes.name",
  ];
  const productCandidates = variantCandidates;
  const variantTitle =
    getValue(variantObj, variantCandidates) ||
    p.variantTitle ||
    p.variantName ||
    p.variant_name ||
    null;
  const productTitle =
    getValue(productObj, productCandidates) ||
    p.productTitle ||
    p.title ||
    p.name ||
    null;
  return variantTitle || productTitle || "ไม่ระบุ";
};

export const getQuantity = (p) => {
  const qtyCandidates = [
    getValue(p, [
      "count",
      "quantity",
      "qty",
      "amount",
      "data.attributes.count",
      "data.attributes.quantity",
      "attributes.count",
      "attributes.quantity",
    ]),
    p.count,
    p.quantity,
    p.qty,
    p.amount,
  ];
  for (const c of qtyCandidates) {
    const n = toNumber(c);
    if (n !== null) return n;
  }
  return 0;
};

export const getUnitPrice = (p) => {
  if (!p) return 0;
  const variantObj =
    p.variant && typeof p.variant === "object" ? p.variant : p.variant;
  const productObj =
    p.product && typeof p.product === "object" ? p.product : p.product;
  const priceCandidates = [
    getValue(variantObj, [
      "price",
      "data.attributes.price",
      "attributes.price",
    ]),
    variantObj && variantObj.price,
    p.price,
    getValue(productObj, [
      "price",
      "data.attributes.price",
      "attributes.price",
    ]),
    p.unitPrice,
  ];
  for (const c of priceCandidates) {
    const n = toNumber(c);
    if (n !== null) return n;
  }
  return 0;
};

export default {};
