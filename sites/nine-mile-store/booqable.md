**0 – Reality check**

* Booqable natively hooks to **Stripe** for full charges or uncaptured holds; no Square gateway required. ([Booqable][1])
* Paste a Booqable HTML/JS snippet and the catalog renders on any static site. ([Booqable Help Center][2])

---

### 1 – Core stack architecture

| Layer                  | Tool                         | Role                                                                | Notes                                                                                             |
| ---------------------- | ---------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Rental engine          | **Booqable + Stripe**        | Inventory, pricing, e-sign docs, online & in-person card processing | Stripe Terminal or Booqable mobile QR for tap/swipe ([Stripe Docs][3], [Booqable Help Center][4]) |
| Retail POS (unchanged) | **Square**                   | Feed/Hardware sales                                                 | Runs parallel; no rental payments                                                                 |
| Glue                   | **Zapier (optional)**        | Push rental SKUs/stock to Square or accounting system               | One-way sync only                                                                                 |
| Front-end              | Static site + Booqable embed | Public booking flow                                                 | `/kiosk` variant on iPad                                                                          |

---

### 2 – Build-out sequence

| Phase                | Tasks                                                                                                             | Deliverable         |
| -------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------- |
| **A. Sandbox**       | • Booqable trial<br>• Stripe test + order Stripe Reader M2/WisePOS E                                              | Safe lab            |
| **B. Inventory**     | Enter SKUs, quantities, buffer time, price + deposit rules                                                        | Clean catalog       |
| **C. Legal**         | Upload rental agreement & waiver, require e-sign                                                                  | Paperless contract  |
| **D. Payment rules** | Settings ▸ Payments: Stripe ON, manual OFF.<br>Payment due **During checkout** (web) & **On pickup** (kiosk).     | Forced up-front pay |
| **E. Website embed** | Add global `<script …embed.js>` + catalog block                                                                   | Live booking UI     |
| **F. Automation**    | *Optional* Zap: **New Order → Update Square item stock**; **Order Returned → Release Stripe hold / issue refund** | Data parity         |
| **G. iPad kiosk**    | Guided-Access iPad, load `/kiosk` pre-filtered “pickup-today”, pair Stripe Reader                                 | Walk-in flow        |
| **H. Acceptance**    | Dry-run web prepaid, kiosk prepaid, late fee; verify Stripe payouts & stock                                       | Go/no-go sheet      |
| **I. Go live**       | Switch Stripe to live keys, publish links, train staff                                                            | Launch              |

---

### 3 – Configuration tips

* **Deposits** Use Stripe *uncaptured* auth; Booqable auto-releases on “Returned”.
* **Prep buffer** Set Booqable “preparation time” for post-return inspections.
* **Kiosk speed** Make a “walk-in” price list (4-hr / 1-day presets).
* **Zap load** 100 Zap tasks ≈ 25 rentals; pick plan accordingly.
* **Fail-safe** Nightly CSV export from Booqable if Zapier down.

---

### 4 – Timeline & budget

| Week | Focus                         | Cost notes                                   |
| ---- | ----------------------------- | -------------------------------------------- |
| 1    | Sandbox, inventory, contracts | Booqable trial **\$0**                       |
| 2    | Embed, Stripe Terminal setup  | Reader M2 **\$59** / WisePOS E **\$249**     |
| 3    | Kiosk drills, staff training  | –                                            |
| 4    | Cut-over                      | Booqable Pro **\$45/mo**, Stripe 2.9 % + 30¢ |

---

### 5 – Contingencies

* **Unified reporting** Push Stripe payouts to QuickBooks/Xero; or Zap Stripe charges → Square “Other” tender.
* **High zap volume** Swap Zapier for Make/n8n or lightweight Node webhook.

Start the sandbox; surface edge-cases as they appear.

[1]: https://booqable.com/integrations/stripe-payments/?utm_source=chatgpt.com "Stripe Integration - Booqable"
[2]: https://help.booqable.com/en/articles/1826851-how-to-embed-products-on-an-existing-website?utm_source=chatgpt.com "How to embed products on an existing website"
[3]: https://docs.stripe.com/terminal?utm_source=chatgpt.com "Terminal - Stripe Documentation"
[4]: https://help.booqable.com/en/articles/8069336-how-to-manage-payments-through-the-booqable-mobile-app?utm_source=chatgpt.com "How to manage payments through the Booqable mobile app"
