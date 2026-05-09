// lib/zarinpal.js
import ZarinpalCheckout from "zarinpal-checkout";

export const zarinpal = ZarinpalCheckout.create(
  process.env.ZARINPAL_MERCHANT,
  true, // sandbox = true ; live = false
);
