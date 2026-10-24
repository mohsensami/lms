// lib/zarinpal.js
import ZarinpalCheckout from "zarinpal-checkout";

let client = null;

// Created lazily: with several payment gateways, Zarinpal may be switched off
// or not configured, and importing this file must never crash the site.
// Sandbox is ON unless ZARINPAL_SANDBOX=false (set that for real payments).
export function getZarinpal() {
  if (!client) {
    const sandbox = process.env.ZARINPAL_SANDBOX !== "false";
    client = ZarinpalCheckout.create(process.env.ZARINPAL_MERCHANT, sandbox);
  }
  return client;
}
