const prisma = require("../config/prisma");
const Stripe = require("stripe");

function getStripe() {
  const key = process.env.STRIPE_SECRET || process.env.STRIPE_KEY;
  if (!key) return null;
  try {
    return Stripe(key);
  } catch (e) {
    console.error("Failed to initialize Stripe:", e && e.message ? e.message : e);
    return null;
  }
}
const bcrypt = require("bcryptjs");

// แผนที่ภาษาไทย ↔ ENUM
const orderStatusMap = {
  รอดำเนินการ: "NOT_PROCESSED",
  กำลังดำเนินการ: "PROCESSING",
  จัดส่งแล้ว: "SHIPPED",
  จัดส่งสำเร็จ: "DELIVERED",
  ยกเลิก: "CANCELLED",
};
const reverseOrderStatusMap = Object.fromEntries(
  Object.entries(orderStatusMap).map(([k, v]) => [v, k])
);

// =======================
// ✅ อัปเดตข้อมูลผู้ใช้เร็วขึ้น
// =======================
exports.updateUserInfo = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, email, telephone, address, password, picture } = req.body;
    const updateData = {};
    if (email) updateData.email = email;
    if (picture) updateData.picture = picture;
    if (password && password.length >= 6) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    // ใช้ transaction + upsert ลด query หลายรอบ
    await prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id }, data: updateData });

      if (name || telephone || address) {
        const existing = await tx.address.findFirst({ where: { userId: id } });
        if (existing) {
          await tx.address.update({
            where: { id: existing.id },
            data: { name, telephone, address },
          });
        } else {
          await tx.address.create({
            data: { userId: id, name, telephone, address },
          });
        }
      }
    });

    res.json({ message: "อัปเดตข้อมูลผู้ใช้สำเร็จ" });
  } catch (err) {
    console.error("updateUserInfo error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// =======================
// ✅ เปลี่ยนสถานะคำสั่งซื้อ
// =======================
exports.changeOrderStatus = async (req, res) => {
  try {
    const { orderId, orderStatus } = req.body;

    const enumValues = [
      "NOT_PROCESSED",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
    ];
    let prismaOrderStatus = enumValues.includes(orderStatus)
      ? orderStatus
      : orderStatusMap[orderStatus?.trim()];

    if (!prismaOrderStatus)
      return res.status(400).json({ message: "สถานะไม่ถูกต้อง" });

    const id = Number(orderId);
    if (Number.isNaN(id))
      return res.status(400).json({ message: "orderId ไม่ถูกต้อง" });

    const orderUpdate = await prisma.order.update({
      where: { id },
      data: { orderStatus: prismaOrderStatus },
    });

    res.json({
      ...orderUpdate,
      orderStatusText: reverseOrderStatusMap[orderUpdate.orderStatus],
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};

// =======================
// ✅ ดึงคำสั่งซื้อของ Admin (พร้อม pagination + ลดการเรียก Stripe)
// =======================
exports.getOrdersAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 20;

    const orders = await prisma.order.findMany({
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: { createdAt: "desc" },
      include: {
        orderedBy: { select: { id: true, email: true, picture: true } },
        address: { select: { name: true, address: true, telephone: true } },
        products: {
          include: {
            product: { include: { category: true, images: true } },
            variant: { include: { images: true } },
          },
        },
      },
    });

    const mappedOrders = orders.map((order) => ({
      id: order.id,
      createdAt: order.createdAt,
      cartTotal: order.cartTotal,
      trackingCarrier: order.trackingCarrier || null,
      trackingCode: order.trackingCode || null,
      orderStatus: order.orderStatus,
      orderStatusText:
        reverseOrderStatusMap[order.orderStatus] || "ไม่ทราบสถานะ",
      stripePaymentId: order.stripePaymentId,
      amount: order.amount,
      currency: order.currency,
      orderedBy: order.orderedBy || null,
      address: order.address || null,
      name: order.address?.name || order.orderedBy?.email || null,
      products: Array.isArray(order.products)
        ? order.products.map((p) => ({
            id: p.id,
            productId: p.productId,
            variantId: p.variantId || null,
            count: p.count,
            price: p.price,
            product: p.product
              ? {
                  id: p.product.id,
                  title: p.product.title,
                  category: p.product.category
                    ? {
                        id: p.product.category.id,
                        name: p.product.category.name,
                      }
                    : null,
                  image:
                    Array.isArray(p.product.images) &&
                    p.product.images.length > 0
                      ? p.product.images[0].url || p.product.images[0]
                      : null,
                }
              : null,
            variant: p.variant
              ? {
                  id: p.variant.id,
                  title: p.variant.title,
                  price: p.variant.price,
                  quantity: p.variant.quantity,
                  image:
                    Array.isArray(p.variant.images) &&
                    p.variant.images.length > 0
                      ? p.variant.images[0].url || p.variant.images[0]
                      : null,
                }
              : null,
          }))
        : [],
      paymentMethod: null,
    }));

    // ลดการเรียก Stripe → เฉพาะ order ที่มี stripePaymentId และ limit page
    await Promise.allSettled(
      mappedOrders.map(async (mo) => {
        if (!mo.stripePaymentId) return;
        try {
          const pi = await stripe.paymentIntents.retrieve(mo.stripePaymentId);
          const method = pi.payment_method_types?.[0] || null;
          if (method === "card") mo.paymentMethod = "card";
          else if (method === "promptpay" || method === "wechat_pay")
            mo.paymentMethod = "promptpay";
          else if (method === "cash") mo.paymentMethod = "cash";
        } catch (e) {
          console.warn("Stripe PI error for order", mo.id, e.message);
        }
      })
    );

    res.json({ page, perPage, orders: mappedOrders });
  } catch (err) {
    console.error("getOrdersAdmin error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// =======================
// ✅ Sales Summary
// =======================
exports.getSalesSummary = async (req, res) => {
  try {
    const totalSales = await prisma.order.aggregate({
      _sum: { cartTotal: true },
    });
    const totalOrders = await prisma.order.count();
    const totalUsers = await prisma.user.count();

    res.json({
      totalSales: totalSales._sum.cartTotal || 0,
      totalOrders,
      totalUsers,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};

// =======================
// ✅ ลบผู้ใช้
// =======================
exports.deleteUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.order.deleteMany({ where: { orderedById: id } });
    await prisma.user.delete({ where: { id } });
    res.json({ message: "ลบผู้ใช้งานสำเร็จ" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "ลบผู้ใช้งานไม่สำเร็จ" });
  }
};

// =======================
// ✅ Update user email
// =======================
exports.updateUserEmail = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { email, password } = req.body;
    const data = { email };
    if (password && password.length >= 6) {
      const salt = await bcrypt.genSalt(10);
      data.password = await bcrypt.hash(password, salt);
    }
    await prisma.user.update({ where: { id }, data });
    res.json({ message: "อัปเดตข้อมูลผู้ใช้สำเร็จ" });
  } catch (err) {
    res.status(500).json({ message: "อัปเดตข้อมูลผู้ใช้ไม่สำเร็จ" });
  }
};

// =======================
// ✅ Get Admin Profile
// =======================
exports.getAdminProfile = async (req, res) => {
  try {
    const { id } = req.user;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        enabled: true,
        picture: true,
      },
    });

    const address = await prisma.address.findFirst({
      where: { userId: id },
      select: { name: true, telephone: true, address: true },
    });

    if (address?.name) user.name = address.name;

    res.json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "ไม่สามารถดึงข้อมูลโปรไฟล์ได้" });
  }
};

// =======================
// ✅ Delete Order
// =======================
exports.deleteOrder = async (req, res) => {
  try {
    const orderId = Number(req.params.id);
    await prisma.order.delete({ where: { id: orderId } });
    res.json({ message: "ลบคำสั่งซื้อสำเร็จ" });
  } catch (err) {
    res.status(400).json({ message: "ไม่สามารถลบคำสั่งซื้อได้" });
  }
};

// =======================
// ✅ Update Shipping Info
// =======================
exports.updateOrderShipping = async (req, res) => {
  try {
    const { orderId, carrier, tracking, trackingCarrier, trackingCode } =
      req.body;
    const id = Number(orderId);
    if (Number.isNaN(id))
      return res.status(400).json({ message: "orderId ไม่ถูกต้อง" });

    const carrierValue = carrier || trackingCarrier || null;
    const trackingValue = tracking || trackingCode || null;

    const allowedCarriers = [
      "ไปรษณีย์ไทย",
      "Flash",
      "J&T",
      "Kerry",
      "Kerry Express",
      "Ninjavan",
      "Ninja Van",
    ];
    if (carrierValue && !allowedCarriers.includes(carrierValue)) {
      return res.status(400).json({ message: "carrier ไม่ถูกต้อง" });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { trackingCarrier: carrierValue, trackingCode: trackingValue },
    });

    res.json({ message: "บันทึกข้อมูลการจัดส่งสำเร็จ", order: updated });
  } catch (err) {
    console.error("updateOrderShipping error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// =======================
// ✅ Generate Tracking Code (server-backed sequential generator)
// =======================
exports.generateTrackingCode = async (req, res) => {
  try {
    // body: { format: 'ORD'|'INV'|'SHOP001', branch?: 'ABC' }
    const { format, branch } = req.body || {};
    if (!format) return res.status(400).json({ message: "format is required" });

    // normalize format and date
    const allowedFormats = ["ORD", "INV", "SHOP001"];
    if (!allowedFormats.includes(format)) {
      return res.status(400).json({ message: "unsupported format" });
    }

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const datePart = `${yyyy}${mm}${dd}`;

    const key =
      branch && branch.trim()
        ? `${format}:${branch.trim().toUpperCase()}:${datePart}`
        : `${format}:${datePart}`;

    // Try to increment/create a sequence row in DB. If the DB/table isn't present
    // (e.g. migrations not run or drift), fall back to a timestamp-based counter.
    let counter;
    try {
      const result = await prisma.$transaction(async (tx) => {
        const existing = await tx.trackingSequence.findUnique({
          where: { key },
        });
        if (existing) {
          const updated = await tx.trackingSequence.update({
            where: { key },
            data: { counter: { increment: 1 } },
          });
          return updated;
        }
        const created = await tx.trackingSequence.create({
          data: { key, counter: 1 },
        });
        return created;
      });
      counter = result.counter;
    } catch (dbErr) {
      console.warn(
        "TrackingSequence table unavailable or DB drift; using fallback counter",
        dbErr?.message || dbErr
      );
      // Fallback: derive a semi-unique counter from epoch seconds (keeps within reasonable length)
      counter = Math.floor(Date.now() / 1000) % 1000000;
    }

    // Build formatted code depending on format
    let code;
    if (format === "ORD") {
      // ORD-YYYYMMDD-000123
      const seq = String(counter).padStart(6, "0");
      code = `ORD-${datePart}-${seq}`;
    } else if (format === "INV") {
      // INV-YYYYMMDD-ABC789 (branch or random suffix)
      const suffix =
        branch && branch.trim()
          ? branch.trim().toUpperCase()
          : Math.random().toString(36).substring(2, 8).toUpperCase();
      code = `INV-${datePart}-${suffix}`;
    } else if (format === "SHOP001") {
      // SHOP001-YYYYMMDD-456 (short numeric)
      const seq = String(counter % 1000).padStart(3, "0");
      const prefix =
        branch && branch.trim() ? branch.trim().toUpperCase() : "SHOP001";
      code = `${prefix}-${datePart}-${seq}`;
    }

    return res.json({ ok: true, code, key, counter });
  } catch (err) {
    console.error("generateTrackingCode error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
