import { NextRequest, NextResponse } from "next/server";

// Package definitions (mirrored from client-side types)
const COIN_PACKAGES = [
  { id: "starter", name: "Starter", coins: 50, priceINR: 99, priceUSD: 1.49 },
  { id: "popular", name: "Popular", coins: 150, priceINR: 249, priceUSD: 3.49 },
  { id: "best-value", name: "Best Value", coins: 500, priceINR: 699, priceUSD: 8.99 },
  { id: "pro", name: "Pro", coins: 1500, priceINR: 1799, priceUSD: 21.99 },
];

// POST /api/coins
// Creates a coin purchase order (mock Razorpay flow)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { packageId } = body;

    if (!packageId) {
      return NextResponse.json({ error: "Missing package ID" }, { status: 400 });
    }

    const pkg = COIN_PACKAGES.find((p) => p.id === packageId);
    if (!pkg) {
      return NextResponse.json({ error: "Invalid package" }, { status: 400 });
    }

    // Mock Razorpay order creation
    // In production: const razorpay = new Razorpay({ key_id, key_secret });
    // const order = await razorpay.orders.create({ amount: pkg.priceINR * 100, currency: "INR", receipt: `damrooh_${packageId}` });
    const order = {
      id: `order_${crypto.randomUUID()}`,
      amount: pkg.priceINR * 100, // paise
      currency: "INR",
      packageId: pkg.id,
      coins: pkg.coins,
      displayPrice: pkg.priceINR,
    };

    return NextResponse.json(order);
  } catch (error) {
    console.error("Coin purchase error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}

// PUT /api/coins
// Verifies payment and credits coins
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, paymentId, signature, packageId } = body;

    if (!orderId || !paymentId) {
      return NextResponse.json({ error: "Missing payment details" }, { status: 400 });
    }

    const pkg = COIN_PACKAGES.find((p) => p.id === packageId);
    if (!pkg) {
      return NextResponse.json({ error: "Invalid package" }, { status: 400 });
    }

    // Mock verification — in production:
    // const expectedSignature = crypto.createHmac("sha256", RAZORPAY_SECRET).update(`${orderId}|${paymentId}`).digest("hex");
    // if (expectedSignature !== signature) return error;
    // Then credit coins in DB: UPDATE users SET coins = coins + pkg.coins WHERE id = userId

    return NextResponse.json({
      success: true,
      coinsAdded: pkg.coins,
      packageName: pkg.name,
      message: `${pkg.coins} tokens credited successfully!`,
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json({ error: "Payment verification failed" }, { status: 500 });
  }
}
