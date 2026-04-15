**Tool-Subscription Club — implementation guide**

---

### 1 Subscription engine (Square)

1. **Create the plan**
   *Square Dashboard ▸ Subscriptions ▸ Create plan* →

   * Name: `Tool Club`
   * Cadence: Monthly
   * Price: \$30
   * Autopay on, no trial. ([Square][1])

2. **Enable self-signup**
   Generate Square’s checkout link for the plan; place it on `/tool-club` and the iPad kiosk home. ([Square][2])

3. **Webhooks**
   In Developer Dashboard enable **subscription.created**, **subscription.updated** events; target Zapier webhook URL. ([Square][3])

---

### 2 Access control inside Booqable

1. **Price list** — clone standard list, set every power-tool SKU to **\$0** (leave deposits).
2. **Customer tag** — `TOOL_CLUB`.
3. **Rule** — one active power-tool order per customer *and* 24 h preparation buffer after return (Settings ▸ Inventory).

---

### 3 Automation (Zapier, 3 zaps)

| # | Trigger (Square)            | Filter                           | Action (Booqable API)                                |
| - | --------------------------- | -------------------------------- | ---------------------------------------------------- |
| 1 | `subscription.created`      | `plan_id == TOOL_CLUB`           | Upsert customer → add tag → attach price list        |
| 2 | `subscription.updated`      | `status IN [CANCELED, PAST_DUE]` | Remove tag → detach price list                       |
| 3 | `order.returned` (Booqable) | customer has tag                 | Zapier “Add note” to Square subscription (usage log) |

≈ 3 tasks per member/month → 300 members fits Zapier Starter. ([Zapier Community][4])

---

### 4 Booking flow

| Step            | Member                                         | Non-member                 |
| --------------- | ---------------------------------------------- | -------------------------- |
| Online checkout | Sees \$0 rental + Stripe deposit hold          | Pays normal rate + deposit |
| Pickup kiosk    | Same via iPad                                  | Same                       |
| Return          | Staff marks returned; Stripe hold auto-release | Same                       |

---

### 5 Inventory discipline

* Unique SKU per tool.
* Preparation buffer guarantees inspection slot.
* Late fee SKU for damages; staff add on check-in.

---

### 6 Roll-out timeline (adds to prior project)

| Week | Extra work                                    |
| ---- | --------------------------------------------- |
| 2    | Build Square plan, webhook, `/tool-club` page |
| 3    | Configure price list/tag, test zaps           |
| 4    | Staff training, launch                        |

---

**Reasoning**
Square natively handles recurring billing (no extra SaaS fee); Booqable governs availability and deposits. Tags + price lists flip rental prices to zero for active subscribers, and Zapier keeps status synced in real time. Minimal code, single payment processor, tight inventory control.

[1]: https://squareup.com/us/en/subscriptions?utm_source=chatgpt.com "Subscription Management - Subscription Billing - Square"
[2]: https://squareup.com/help/us/en/article/8309-manage-square-subscriptions?utm_source=chatgpt.com "Manage Square subscriptions | Square Support Center - US"
[3]: https://developer.squareup.com/docs/subscriptions-api/overview?utm_source=chatgpt.com "Subscriptions API - Square Developer Platform"
[4]: https://community.zapier.com/how-do-i-3/how-do-i-set-up-zapier-to-trigger-with-a-square-subscription-sign-up-44171?utm_source=chatgpt.com "How do I set up Zapier to trigger with a Square Subscription sign-up?"
