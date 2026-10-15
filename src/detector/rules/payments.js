export default [
  {
    name: "Stripe",
    category: "payments",
    website: "https://stripe.com",
    color: "#635bff",
    // Stripe.js is versioned in its URL: js.stripe.com/v3/
    scriptSrc: [{ pattern: /js\.stripe\.com(?:\/v(\d+))?/i, version: "\\1", weight: 100 }],
    js: { Stripe: { weight: 70 } }
  },
  {
    name: "PayPal",
    category: "payments",
    website: "https://www.paypal.com",
    color: "#003087",
    scriptSrc: [{ pattern: /paypal\.com\/sdk\/js|paypalobjects\.com\/api\/checkout/i, weight: 100 }],
    js: { paypal: { weight: 60 } }
  },
  {
    name: "Razorpay",
    category: "payments",
    website: "https://razorpay.com",
    color: "#0c2451",
    scriptSrc: [{ pattern: /checkout\.razorpay\.com/i, weight: 100 }],
    js: { Razorpay: { weight: 80 } }
  },
  {
    name: "Paddle",
    category: "payments",
    website: "https://www.paddle.com",
    color: "#ffd400",
    scriptSrc: [{ pattern: /cdn\.paddle\.com\/paddle\//i, weight: 100 }],
    js: { Paddle: { weight: 60 } }
  },
  {
    name: "Klarna",
    category: "payments",
    website: "https://www.klarna.com",
    color: "#ffa8cd",
    scriptSrc: [{ pattern: /(?:x|js|na-library|eu-library)\.klarnaservices\.com|\.klarnacdn\.net/i, weight: 90 }],
    js: { KlarnaOnsiteService: { weight: 90 }, Klarna: { weight: 60 } }
  }
];
