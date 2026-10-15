export default [
  {
    name: "Shopify",
    category: "ecommerce",
    website: "https://www.shopify.com",
    color: "#95bf47",
    headers: {
      "x-shopid": true,
      "x-shopify-stage": true,
      "powered-by": /Shopify/i
    },
    meta: { "shopify-checkout-api-token": true, "shopify-digital-wallet": true },
    scriptSrc: [/cdn\.shopify\.com|\/cdn\/shop\//i],
    html: [/cdn\.shopify\.com/i],
    cookies: { _shopify_y: true, _shopify_s: true },
    js: { "Shopify.shop": { weight: 90 }, ShopifyAnalytics: { weight: 70 } }
  },
  {
    name: "WooCommerce",
    category: "ecommerce",
    website: "https://woocommerce.com",
    color: "#7f54b3",
    implies: ["WordPress"],
    meta: { generator: { pattern: /^WooCommerce ?([\d.]+)?/i, version: "\\1" } },
    scriptSrc: [{ pattern: /\/plugins\/woocommerce\//i, weight: 70 }],
    html: [/<[^>]+class=["'][^"']*\bwoocommerce\b/i],
    js: { woocommerce_params: { weight: 90 }, wc_add_to_cart_params: { weight: 90 } }
  },
  {
    name: "Magento",
    category: "ecommerce",
    website: "https://business.adobe.com/products/magento/magento-commerce.html",
    color: "#ee672f",
    implies: ["PHP", "MySQL"],
    html: [{ pattern: /Magento_(?:Theme|Ui|Customer|Catalog)|\/static\/version\d+\/frontend\//i, weight: 80 }],
    cookies: { "mage-cache-sessid": { weight: 80 }, "X-Magento-Vary": { weight: 80 } },
    js: { Mage: { weight: 70 } }
  },
  {
    name: "BigCommerce",
    category: "ecommerce",
    website: "https://www.bigcommerce.com",
    color: "#121118",
    html: [{ pattern: /cdn\d+\.bigcommerce\.com/i, weight: 70 }],
    scriptSrc: [/bigcommerce\.com/i],
    js: { BCData: { weight: 80 } }
  },
  {
    name: "PrestaShop",
    category: "ecommerce",
    website: "https://www.prestashop.com",
    color: "#df0067",
    implies: ["PHP", "MySQL"],
    meta: { generator: /PrestaShop/i },
    js: { prestashop: { weight: 80 } },
    cookies: { "PrestaShop-*": { weight: 90 } }
  },
  {
    name: "OpenCart",
    category: "ecommerce",
    website: "https://www.opencart.com",
    color: "#23a1d1",
    implies: ["PHP", "MySQL"],
    html: [{ pattern: /catalog\/view\/(?:theme|javascript)\//i, weight: 70 }],
    cookies: { OCSESSID: { weight: 90 } }
  },
  {
    name: "Salesforce Commerce Cloud",
    category: "ecommerce",
    website: "https://www.salesforce.com/commerce/",
    color: "#00a1e0",
    html: [{ pattern: /demandware\.static|\/on\/demandware\.store\//i, weight: 90 }],
    cookies: { dwsid: { weight: 80 }, "dwanonymous_*": { weight: 80 } }
  },
  {
    name: "commercetools",
    category: "ecommerce",
    website: "https://commercetools.com",
    color: "#213c45",
    html: [{ pattern: /\.(?:[a-z0-9-]+\.)?(?:gcp|aws)\.commercetools\.com/i, weight: 80 }]
  },
  {
    name: "Medusa",
    category: "ecommerce",
    website: "https://medusajs.com",
    color: "#7c3aed",
    // Headless — only weak public traces exist (default image bucket, cart cookies).
    html: [{ pattern: /medusa-public-images/i, weight: 60 }],
    cookies: { "_medusa_*": { weight: 80 } }
  },
  {
    name: "Snipcart",
    category: "ecommerce",
    website: "https://snipcart.com",
    color: "#2e3338",
    scriptSrc: [{ pattern: /cdn\.snipcart\.com\/themes\/v([\d.]+)/i, version: "\\1", weight: 100 }],
    dom: { "#snipcart": { weight: 80 } },
    js: { Snipcart: { weight: 80 } }
  }
];
