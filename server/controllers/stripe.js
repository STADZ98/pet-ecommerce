const prisma = require("../config/prisma");
const stripe = require("stripe")(
  process.env.STRIPE_SECRET || process.env.STRIPE_KEY
);

exports.payment = async (req, res) => {
  try {
    //code
    console.log("test", req.user.id);
    const cart = await prisma.cart.findFirst({
      where: {
        orderedById: req.user.id,
      },
    });

    if (!cart || typeof cart.cartTotal !== "number" || cart.cartTotal <= 0) {
      console.warn("Payment creation failed: no cart or invalid cart total", {
        userId: req.user.id,
        cart,
      });
      return res
        .status(400)
        .json({ message: "ไม่พบตะกร้าสินค้าหรือยอดรวมไม่ถูกต้อง" });
    }
    const amountTHB = cart.cartTotal * 100;
    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountTHB,
      currency: "thb",
      payment_method_types: ["card", "promptpay"], // เพิ่ม promptpay เพื่อรองรับ QR
      // automatic_payment_methods: { enabled: true }, // สามารถลบหรือคอมเมนต์บรรทัดนี้
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};
