# BusinessOS production database architecture

Status: target design with organization foundation applied, 2026-10-10. This is a logical PostgreSQL schema and migration contract, not a single executable migration. The authoritative current schema remains `apps/api/prisma/schema.prisma` and its reviewed migrations. Do not run this target design directly against customer data.

## 1. Scope and invariants

- `Tenant` is the billing, identity, and security boundary. `Business` is a legal/trading entity within a tenant; create one Business per existing Tenant initially. Business type is configuration, not a separate database or application. A tenant may later own several Businesses without changing the shared operational model.
- Tenant-owned rows carry `tenant_id`; business-owned rows also carry `business_id`; branch operations carry `branch_id`. Composite foreign keys must prove each referenced parent belongs to the same tenant and, where applicable, business and branch. A global primary key alone does not prove ownership.
- Preserve existing CUID `text` primary keys during migration. New tables use the same opaque key format to avoid mixed-key joins. UUIDv7 is an optional later change, not part of this rollout. Add `UNIQUE (tenant_id, id)` or `UNIQUE (tenant_id, business_id, id)` on referenced parents as needed for composite foreign keys.
- Every mutable row has `created_at timestamptz(3) NOT NULL`, `updated_at timestamptz(3) NOT NULL`, and `version bigint NOT NULL DEFAULT 1`. Immutable event/ledger rows have `created_at` only. Store UTC instants; display in `Asia/Dhaka`.
- Money is `numeric(20,2)` with `currency_code char(3)`; BDT is the initial currency. Unit price and tax-rate inputs are `numeric(20,6)`, quantities are `numeric(20,6)`, rates are `numeric(12,6)`. Calculate with a decimal library or decimal strings, round once at the documented line/tax boundary, and never convert financial or inventory values to JavaScript `number` for arithmetic. PostgreSQL `money`, `real`, and `double precision` are not financial types here. [PostgreSQL monetary guidance](https://www.postgresql.org/docs/16/datatype-money.html).
- Status columns use bounded lookup/enum values with an application transition table. An order's operational state, payment settlement state, fulfillment state, and sync state are separate. Posted invoices, stock movements, payment events, usage events, and audit records are append-only; corrections are reversal records.

**Notation:** `PK` primary key; `FK` foreign key; `UQ` unique key. All IDs below are `text` unless stated. Columns named `amount`, `total`, `price`, and `rate` use the decimal types above. Tables with `tenant_id` have `FK tenant_id -> Tenant.id`. Business-scoped child rows also carry `business_id` even when repeated scope columns are abbreviated in a table cell. Shown FKs are composite-scoped where both sides are tenant/business-owned. Tables marked `global` have no tenant owner.

## 2. Relational schema

### Organization, identity, and authorization

| Entity | Required columns and relationships | Keys and constraints |
| --- | --- | --- |
| `Tenant` | `id`, `code`, `status`, `default_currency`, `default_locale`, `timezone`, `created_at` | PK `id`; UQ `code`; default `BDT`, `Asia/Dhaka` |
| `BusinessType` (global) | `id`, `code`, `config_version`, `status` | PK `id`; UQ `code`; existing ten profile codes seed catalog |
| `Business` | `id`, `tenant_id`, `business_type_id`, `code`, `legal_name`, `trading_name`, `tax_identifier`, `currency_code`, `status` | PK `id`; UQ `(tenant_id, code)`; FK `business_type_id -> BusinessType` |
| `Branch` | `id`, `tenant_id`, `business_id`, `code`, `name`, `address`, `status` | PK `id`; UQ `(tenant_id, business_id, code)`; scoped Business FK |
| `Warehouse` | `id`, `tenant_id`, `business_id`, nullable `branch_id`, `code`, `name`, `status` | PK `id`; UQ `(tenant_id, business_id, code)`; branch must belong to Business |
| `User` | `id`, normalized `email`, password/identity reference, `status`, `last_login_at` | PK `id`; UQ normalized email; no tenant FK because an identity may join multiple tenants |
| `Membership` | `tenant_id`, `user_id`, `status`, `joined_at` | PK `(tenant_id, user_id)`; replaces direct user ownership; platform identity is separate |
| `Role` | `id`, nullable `tenant_id`, `code`, `name`, `is_system`, `status` | PK `id`; unique global and tenant role codes via separate partial indexes |
| `Permission` (global) | `id`, `code`, `module_id`, `description` | PK `id`; UQ `code`; immutable codes such as `sale.create` |
| `RolePermission` | `role_id`, `permission_id` | PK `(role_id, permission_id)`; FKs to Role and Permission |
| `UserRole` | `tenant_id`, `user_id`, `role_id` | PK `(tenant_id, user_id, role_id)`; role belongs to tenant or is approved system role |
| `BranchAccess` | `tenant_id`, `user_id`, `branch_id` | PK `(tenant_id, user_id, branch_id)`; empty set means no branch access, not all branches |
| `Employee` | `id`, `tenant_id`, `business_id`, nullable `branch_id`, nullable `user_id`, `employee_no`, employment status and HR fields | PK `id`; UQ `(tenant_id, business_id, employee_no)`; optional link to User, not the same record |

Tenant-wide roles explicitly carry a scope policy; they do not infer all-branch access from an absent `BranchAccess` row. Platform administrators are control-plane principals, not implicit members of every tenant.

### Subscription and billing control plane

| Entity | Required columns and relationships | Keys and constraints |
| --- | --- | --- |
| `Module` (global) | `id`, `code`, `status`, `available`, dependency metadata | PK `id`; UQ `code`; unavailable modules cannot be billed or enabled |
| `Plan` (global) | `id`, `code`, `version`, `billing_interval`, `currency_code`, `price`, `effective_from`, `retired_at` | PK `id`; UQ `(code, version, billing_interval)`; referenced price version is immutable |
| `PlanFeature` (global) | `plan_id`, nullable `module_id`, `feature_code`, `included_limit`, `overage_price` | PK `(plan_id, feature_code)`; optional module FK; limits use integer or exact numeric units |
| `Subscription` | `id`, `tenant_id`, `plan_id`, `status`, `period_start`, `period_end`, `trial_end`, `cancel_at_period_end` | PK `id`; FK Plan; no overlapping active periods for one tenant; history retained |
| `EntitlementOverride` | `id`, `tenant_id`, `feature_code`, limit, reason, approver, validity | PK `id`; owner/platform-authorized grant with audit evidence |
| `FeatureEntitlement` | `id`, `tenant_id`, nullable `business_id`, `feature_code`, nullable `subscription_id`, nullable `override_id`, `limit_value`, `valid_from`, `valid_until`, `status` | PK `id`; exactly one typed source FK; effective grants derived from subscription or explicit override, not a free-floating boolean |
| `UsageRecord` | `id`, `tenant_id`, `feature_code`, `operation_id`, `quantity`, `occurred_at`, `period_start` | PK `id`; UQ `(tenant_id, feature_code, operation_id)`; append-only metering |
| `Invoice` | `id`, `tenant_id`, nullable `business_id`, nullable `order_id`, nullable `subscription_id`, `invoice_no`, `type`, `status`, `currency_code`, subtotal/tax/discount/total, `issued_at`, `due_at` | PK `id`; UQ `(tenant_id, invoice_no)`; exactly one of Order or Subscription source; posted amounts immutable |
| `InvoiceLine` | `id`, `tenant_id`, `invoice_id`, `source_line_id`, description/quantity/unit-price/tax/total snapshots | PK `id`; scoped Invoice FK; immutable after issue |
| `Payment` | `id`, `tenant_id`, `invoice_id`, `method`, `status`, `currency_code`, `amount`, `idempotency_key`, provider account/payment IDs, `captured_at` | PK `id`; UQ `(tenant_id, idempotency_key)` when present; composite FK also matches Invoice currency; one row per attempt/tender |
| `PaymentEvent` | `id`, `tenant_id`, `payment_id`, `kind`, `amount`, nullable `provider_account_id`, nullable `provider_event_id`, `occurred_at` | PK `id`; unique provider event per account; append-only evidence of authorization, capture, failure, refund |
| `Refund` | `id`, `tenant_id`, `payment_id`, nullable `return_id`, `amount`, `status`, `idempotency_key`, provider refund ID | PK `id`; UQ `(tenant_id, idempotency_key)`; sum of settled refunds cannot exceed captured Payment |

An Invoice is the immutable receivable document for either a sale or a subscription; `InvoiceLine` intentionally snapshots issued terms rather than depending on editable catalog/plan rows. Payment is an incoming tender or gateway attempt, not proof of capture merely because a shopper submitted a bKash/Nagad/Rocket reference. Outgoing liabilities use `Disbursement` below.

### Catalog, inventory, and procurement

| Entity | Required columns and relationships | Keys and constraints |
| --- | --- | --- |
| `Category` | `id`, `tenant_id`, `business_id`, nullable `parent_id`, `code`, `name`, `status` | PK `id`; scoped parent FK; UQ `(tenant_id, business_id, code)` |
| `Brand` | `id`, `tenant_id`, `business_id`, `code`, `name`, `status` | PK `id`; UQ `(tenant_id, business_id, code)` |
| `Product` | `id`, `tenant_id`, `business_id`, `category_id`, nullable `brand_id`, `name`, `type`, `status`, low-risk `attributes jsonb` | PK `id`; scoped Category/Brand FKs; no mutable stock or financial balance here |
| `ProductVariant` | `id`, `tenant_id`, `business_id`, `product_id`, `sku`, nullable `barcode`, `unit_code`, `pack_factor`, `sale_price`, `cost_basis`, `status` | PK `id`; UQ `(tenant_id, business_id, sku)` even after archival; one default variant for each Product |
| `StockLocation` | `id`, `tenant_id`, `business_id`, `kind`, exactly one of `branch_id`, `warehouse_id`, or `transfer_id`, `status` | PK `id`; UQ scoped owner location; `transfer_id` represents in-transit stock |
| `Inventory` | `id`, `tenant_id`, `business_id`, `stock_location_id`, `variant_id`, `on_hand`, `reserved`, `version` | PK `id`; UQ `(tenant_id, business_id, stock_location_id, variant_id)`; `on_hand >= 0`, `reserved >= 0`, `reserved <= on_hand` |
| `InventoryTransaction` | `id`, `tenant_id`, `business_id`, `kind`, `operation_id`, typed nullable source FKs to Order/PurchaseReceipt/StockTransfer/StockAdjustment/Return, `created_by_id`, `created_at` | PK `id`; UQ `(tenant_id, operation_id)`; source check by kind; one atomic movement group |
| `InventoryMovement` | `id`, `tenant_id`, `transaction_id`, `stock_location_id`, `variant_id`, signed `quantity_delta`, `balance_after`, `created_at` | PK `id`; UQ `(transaction_id, line_no)`; append-only; every balance change has a movement |
| `StockTransfer` | `id`, `tenant_id`, `business_id`, `from_location_id`, `to_location_id`, `status`, requested/shipped/received timestamps | PK `id`; locations distinct and same Business; shipping and receipt have separate movement groups |
| `StockTransferLine` | `id`, `tenant_id`, `transfer_id`, `variant_id`, requested/shipped/received quantities | PK `id`; UQ `(transfer_id, variant_id)` |
| `StockAdjustment` | `id`, `tenant_id`, `business_id`, `stock_location_id`, `status`, `reason_code`, approver and approval time | PK `id`; approved count variance creates one movement group |
| `StockAdjustmentLine` | `id`, `tenant_id`, `adjustment_id`, `variant_id`, counted/expected/delta quantities | PK `id`; UQ `(adjustment_id, variant_id)` |
| `Supplier` | `id`, `tenant_id`, `business_id`, `code`, `name`, contacts, `status` | PK `id`; UQ `(tenant_id, business_id, code)`; payable is derived from documents/disbursements |
| `Purchase` | `id`, `tenant_id`, `business_id`, `branch_id`, `supplier_id`, `purchase_no`, `status`, `currency_code`, committed totals | PK `id`; UQ `(tenant_id, business_id, purchase_no)`; scoped Branch/Supplier FKs |
| `PurchaseItem` | `id`, `tenant_id`, `purchase_id`, `variant_id`, ordered quantity, unit-cost and tax snapshots | PK `id`; scoped Purchase/Variant FKs; immutable after approval |
| `PurchaseReceipt` / `PurchaseReceiptItem` | receipt header with branch/location/time; item references PurchaseItem and received quantity | Separate partial receipts; receiving creates InventoryTransaction and supplier liability atomically |

`Inventory` is the current materialized balance; `InventoryMovement` is its immutable explanation. A transfer uses an in-transit StockLocation after shipment, then moves to destination on receipt. Neither `Product.stock` nor a supplier's running payable is a second independent authority.

### Customers, orders, accounting, and operations

| Entity | Required columns and relationships | Keys and constraints |
| --- | --- | --- |
| `CustomerGroup` | `id`, `tenant_id`, `business_id`, `code`, `name`, `status` | PK `id`; UQ `(tenant_id, business_id, code)` |
| `Customer` | `id`, `tenant_id`, `business_id`, nullable `group_id`, `name`, normalized phone, email, consent flags, `status` | PK `id`; scoped group FK; phone unique per Business when present; due/spend are reconciled read models, not authority |
| `Order` | `id`, `tenant_id`, `business_id`, `branch_id`, nullable `customer_id`, `order_no`, `channel`, `order_type`, separate operational/payment/fulfillment statuses, `currency_code`, totals, `operation_id`, `request_fingerprint` | PK `id`; UQ `(tenant_id, business_id, order_no)` and `(tenant_id, operation_id)`; scoped Branch/Customer FKs |
| `OrderItem` | `id`, `tenant_id`, `order_id`, nullable `variant_id`, name/SKU/unit/quantity/price/discount/tax/total snapshots | PK `id`; scoped Order/Variant FKs; retain snapshots if catalog item is archived |
| `Return` (physical `SalesReturn`) | `id`, `tenant_id`, `business_id`, `order_id`, `return_no`, `status`, `reason`, approver, totals | PK `id`; UQ `(tenant_id, business_id, return_no)`; state transition approval audited |
| `ReturnItem` | `id`, `tenant_id`, `return_id`, `order_item_id`, quantity, disposition, amount | PK `id`; returned quantity across approved returns <= sold quantity, enforced in transaction |
| `Discount` | `id`, `tenant_id`, `business_id`, `code`, `version`, type/value, eligibility, validity | PK `id`; UQ `(tenant_id, business_id, code, version)`; historical versions immutable |
| `Coupon` | `id`, `tenant_id`, `business_id`, `discount_id`, normalized `code`, usage limits, validity, status | PK `id`; active code unique per Business; redemption counted transactionally |
| `CouponRedemption` | `id`, `tenant_id`, `coupon_id`, `order_id`, `customer_id`, `redeemed_at` | PK `id`; UQ `(coupon_id, order_id)`; append-only |
| `OrderAdjustment` | `id`, `tenant_id`, `order_id`, nullable `discount_id`, nullable `coupon_id`, kind, amount, description snapshot | PK `id`; all signed adjustments included in recorded order total |
| `Tax` | `id`, `tenant_id`, `business_id`, `code`, `version`, `rate`, effective period, status | PK `id`; UQ `(tenant_id, business_id, code, version)`; tax policy requires local legal review |
| `OrderTaxLine` | `id`, `tenant_id`, `order_item_id`, `tax_id`, `rate_snapshot`, `taxable_base`, `amount` | PK `id`; issued values immutable; totals reconcile with Order and Invoice |
| `Expense` | `id`, `tenant_id`, `business_id`, nullable `branch_id`, category, `expense_no`, `currency_code`, amount, `status`, incurred/due dates | PK `id`; UQ `(tenant_id, business_id, expense_no)`; approvals and corrections audited |
| `Disbursement` | `id`, `tenant_id`, exactly one of `expense_id` or `purchase_id`, method, amount, status, provider/reference | PK `id`; records outgoing funds separately from incoming Payment |
| `CashSession` | `id`, `tenant_id`, `business_id`, `branch_id`, `opened_by_id`, optional `closed_by_id`, opening/expected/count amounts, `status`, open/close times | PK `id`; one open session per register; closing variance audited, never edited silently |
| `Notification` | `id`, `tenant_id`, nullable `user_id`, channel, template/version, recipient reference, status, dedupe key, created/sent timestamps | PK `id`; UQ `(tenant_id, dedupe_key)` when present; no secrets in payload |
| `AuditLog` | `id`, nullable `tenant_id`, nullable actor `user_id`, request/correlation ID, action, entity type/ID, sanitized before/after metadata, IP, `created_at` | PK `id`; append-only; platform actions can have null tenant but explicit scope |
| `IdempotencyRequest` | `id`, `tenant_id`, operation scope/key, request hash, result type/ID, status, nullable expiry | PK `id`; UQ `(tenant_id, operation_scope, key)`; key reuse with different hash is rejected; financial keys retained with their records |
| `OutboxEvent` | `id`, `tenant_id`, aggregate type/ID, event type/version, compact payload, created/published timestamps, attempt count | PK `id`; committed with business transaction; workers dedupe by event ID |
| `POSDevice` / `POSSyncOperation` | enrolled device/branch; operation ID, local sequence, payload hash, accepted/rejected result | UQ `(tenant_id, device_id, local_sequence)` and `(tenant_id, operation_id)`; offline sales stay provisional until accepted |

`Return` records the operational reversal; `Refund` records money returned against an actual Payment. A restock or write-off creates inventory movements, never a silent balance edit. Tax/discount versions and order item snapshots allow historical receipts to remain correct after configuration changes.

### Storefront and website builder

| Entity | Required columns and relationships | Keys and constraints |
| --- | --- | --- |
| `Storefront` | `id`, `tenant_id`, `business_id`, `slug`, `status`, nullable `published_site_revision_id`, `published_at` | PK `id`; UQ `(tenant_id, business_id)`; globally unique normalized published slug |
| `Theme` | `id`, nullable `tenant_id`, `code`, `version`, token JSON, status | PK `id`; global templates and tenant variants have separate unique indexes; published version immutable |
| `Page` | `id`, `tenant_id`, `storefront_id`, `slug`, `kind`, `status`, `draft_revision_id` | PK `id`; UQ `(storefront_id, slug)`; homepage is unique per Storefront |
| `PageRevision` | `id`, `tenant_id`, `page_id`, `revision_no`, author, created timestamp | PK `id`; UQ `(page_id, revision_no)`; referenced published revisions immutable |
| `SiteRevision` / `SiteRevisionPage` | immutable `SiteRevision` header with Storefront, Theme version, navigation/settings snapshot; join rows identify each Page and PageRevision | UQ `(storefront_id, revision_no)` and `(site_revision_id, page_id)`; publication set is complete and tenant-scoped |
| `Section` | `id`, `tenant_id`, `page_revision_id`, `section_type`, `position`, `visible` | PK `id`; UQ `(page_revision_id, position)`; type from allowlisted registry |
| `SectionConfiguration` | `section_id`, schema version, validated content/binding JSON | PK/FK `section_id`; no executable HTML, JS, or arbitrary CSS; referenced catalog IDs scoped to Business |
| `Navigation` | `id`, `tenant_id`, `storefront_id`, `code`, status | PK `id`; UQ `(storefront_id, code)` |
| `NavigationItem` | `id`, `tenant_id`, `navigation_id`, parent/position, label, internal page or validated external URL | PK `id`; scoped tree; depth and link policy enforced |
| `Domain` | `id`, `tenant_id`, `storefront_id`, normalized hostname, ownership challenge/status, TLS status, verified time | PK `id`; globally unique hostname; route traffic only after verification and TLS readiness |
| `StorefrontSettings` | `storefront_id`, fulfillment flags, checkout/contact/SEO settings, version | PK/FK `storefront_id`; draft settings versioned with publication |

The published SiteRevision pins a complete set of PageRevisions plus Theme, navigation, and settings snapshots; live prices and availability are fetched from the shared Catalog and Inventory. Publication is one atomic Storefront pointer change after schema, asset, link, permission, and domain checks. A rollback points to a prior SiteRevision; it does not edit history.

**Relationship map:** Tenant 1:N Business, Membership, Subscription, and AuditLog; Business 1:N Branch, Warehouse, Product, Supplier, Customer, and Storefront; Product 1:N ProductVariant; StockLocation + ProductVariant 1:1 Inventory balance and 1:N movements; Order 1:N OrderItem and Return; Invoice 1:N InvoiceLine and Payment; Payment 1:N PaymentEvent and Refund; Storefront 1:N Page/Domain and 1:N SiteRevision; SiteRevision N:M PageRevision through SiteRevisionPage. Every tenant/business edge is a composite FK, not merely an application-side assumption. Order/Invoice totals and Inventory balances are intentional materialized state backed by immutable lines/events and reconciliation, not independent competing sources.

### Vertical extensions

Reuse the existing RestaurantTable/KitchenTicket tables and attach further typed extension tables to core IDs: restaurant recipe/modifier and station ticket; pharmacy stock lot, expiry, prescription and pharmacist approval; grocery unit conversion/scale evidence; electronics serial/warranty; bakery production batch. Use `tenant_id`, `business_id`, and typed FKs in each extension. JSONB is limited to presentation/configuration fields, never regulated evidence, stock quantity, or payment state. No vertical receives its own Product, Order, or Payment table.

## 3. Physical constraints, indexes, and deletion

- All business-owned FKs use `(tenant_id, business_id, referenced_id)` where the parent is business-owned; branch-owned FKs additionally prove that the branch belongs to the Business. PostgreSQL does not automatically index referencing FK columns, so index them according to query and deletion paths. [PostgreSQL constraint documentation](https://www.postgresql.org/docs/16/ddl-constraints.html).
- API/repository queries always filter by authenticated tenant and authorized branch; composite FKs protect writes even if a service forgets a filter. PostgreSQL row-level security may add defense in depth after transaction-local tenant context, connection pooling, migration roles, and support access are tested. It is not a substitute for scoped API authorization.
- Minimum operational indexes: `Order(tenant_id, branch_id, created_at DESC, id DESC)`, `Purchase(tenant_id, business_id, created_at DESC, id DESC)`, `InventoryMovement(tenant_id, stock_location_id, created_at DESC, id DESC)`, `Payment(tenant_id, invoice_id, created_at DESC)`, `AuditLog(tenant_id, created_at DESC, id DESC)`, and published `Page(storefront_id, slug)`.
- Add exact unique keys for SKUs, order/invoice/return numbers, operation IDs, provider event IDs, normalized hostnames, and published slugs. Use partial unique indexes only for deliberately reusable active codes; SKU and financial document numbers are never reused. Do not duplicate indexes already created by a PK/UQ constraint. [PostgreSQL unique-index documentation](https://www.postgresql.org/docs/16/indexes-unique.html).
- Enforce exactly one StockLocation owner by kind (Branch, Warehouse, or in-transit StockTransfer), with separate partial unique indexes per owner type. Payment and Invoice currency must match through a scoped composite FK; Order and its issued Invoice must also agree on currency. An idempotency record for a financial operation is not deleted merely because a normal HTTP retry window elapsed.
- `deleted_at` is permitted for drafts, catalog items, customer groups, and marketing content; keep business identifiers reserved unless an explicit reuse policy exists. Users are suspended or anonymized under a retention policy. Financial documents, payment events, returns, stock movements, usage records, and audit logs are never soft- or hard-deleted through application workflows; use void/reversal entries. Legal retention is a policy decision.
- Use `ON DELETE RESTRICT` for referenced financial and inventory history. Parent tenant deletion is an explicit retention/anonymization job, not a database cascade over ledgers. `ON UPDATE RESTRICT` protects ownership keys with dependents. Keep high-volume ledgers unpartitioned until measured volume warrants time partitioning and the FK/unique-key implications are tested.

Representative PostgreSQL constraint shape (the table catalog above is the complete logical schema, not executable migration SQL):

```sql
CREATE TABLE inventory (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  business_id text NOT NULL,
  stock_location_id text NOT NULL,
  variant_id text NOT NULL,
  on_hand numeric(20,6) NOT NULL DEFAULT 0,
  reserved numeric(20,6) NOT NULL DEFAULT 0,
  version bigint NOT NULL DEFAULT 1,
  created_at timestamptz(3) NOT NULL DEFAULT now(),
  updated_at timestamptz(3) NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, business_id, id),
  UNIQUE (tenant_id, business_id, stock_location_id, variant_id),
  CHECK (on_hand >= 0 AND reserved >= 0 AND reserved <= on_hand),
  FOREIGN KEY (tenant_id, business_id, stock_location_id)
    REFERENCES stock_location (tenant_id, business_id, id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  FOREIGN KEY (tenant_id, business_id, variant_id)
    REFERENCES product_variant (tenant_id, business_id, id) ON UPDATE RESTRICT ON DELETE RESTRICT
);

CREATE UNIQUE INDEX payment_event_provider_key
  ON payment_event (provider_account_id, provider_event_id)
  WHERE provider_account_id IS NOT NULL AND provider_event_id IS NOT NULL;
```

The referenced composite keys on StockLocation and ProductVariant must exist first. A conditional inventory decrement uses `numeric` parameters and `WHERE on_hand - reserved >= requested`; it checks affected-row count and writes its movement in the same transaction. Application code must serialize decimals as strings at API boundaries.

## 4. Transaction and concurrency contracts

1. **Sale:** acquire/guard each Inventory row in stable `(location_id, variant_id)` order; validate entitlement, price and branch; decrement exact `numeric` quantities with a conditional `UPDATE ... WHERE on_hand - reserved >= requested`; insert Order/OrderItem, Invoice/InvoiceLine, InventoryTransaction/Movement, Payment attempt or receivable, AuditLog, IdempotencyRequest, and OutboxEvent in one short transaction. A zero-row stock update is a conflict, not a negative balance. Replaying the same operation hash returns the original result.
2. **Purchase receipt/adjustment/transfer:** validate approval and tenant-scoped references; update each affected Inventory row and append corresponding movements in one transaction. A transfer ships to an in-transit location and receives at destination in a later transaction. Partial receipts cannot exceed ordered quantity; adjustments require a reason and approval policy.
3. **Payment/callback:** verify provider signature outside the transaction, then insert a provider event with a unique key, transition Payment, update Invoice settlement projection, write AuditLog and OutboxEvent atomically. Retry/duplicate callbacks return the prior result. Manual MFS reference submission remains pending until authorized verification. Captured minus settled refunds must never become negative.
4. **Return/refund:** lock OrderItem returned-quantity state and original Payment, validate approved quantity and stock disposition, write Return/ReturnItem, Refund attempt and any restock movements. Provider refund completion is a separate verified event. Failed provider calls never pretend that cash was returned.
5. **Subscription:** issue an immutable period Invoice referencing a Plan price version; payment settlement transitions Subscription and effective FeatureEntitlement rows in one transaction. UsageRecord operation IDs make metering replay-safe. Never modify an issued invoice when plan pricing changes.

Use optimistic `version` checks for editable catalog, settings, and builder drafts; guarded row updates/locks for stock, coupon limits, returned quantity, and captured payment totals. Retry only identified serialization/deadlock failures with bounded attempts and the same idempotency key. No external network call occurs while a business transaction holds locks.

## 5. Migration strategy from the current Prisma schema

1. **Baseline and gates.** Snapshot the current 13 migrations, production-size table counts/indexes, query latency, backups, and restore time. Audit cross-tenant nested references, duplicate identifiers, UTC assumptions, `Product.stock` versus summed `InventoryBalance`, and order/payment/customer/supplier projections. Replace existing `Number`/floating-point money and quantity calculations with decimal-safe operations before financial cutover. Stop on unexplained differences; do not auto-correct money or stock.
2. **Expand organization and access.** Add global BusinessType/Module/Plan/Permission catalogs, Business, Membership, UserRole, BranchAccess, and new nullable FKs. Backfill one Business per Tenant using stable IDs, map existing `Tenant.businessType`, `User.role`, and branch assignment, then compare authorization decisions before switching reads. Preserve User IDs and existing sessions during rollout.
3. **Expand catalog and stock.** Add Category, Brand, ProductVariant (one default variant per Product), StockLocation (one branch location per existing Branch), transfer/adjustment/receipt tables. Evolve `InventoryBalance` into Inventory and extend the existing `InventoryMovement` instead of creating a second authoritative ledger. Backfill in resumable tenant batches, reconcile quantities/precision and source references, then switch writers in one release. Retain `Product.stock` as a checked legacy projection until removed.
4. **Expand commerce and billing.** Add versioned Plan/PlanFeature, Invoice/InvoiceLine, Payment/PaymentEvent, Refund, ReturnItem, UsageRecord, and entitlement provenance. Backfill existing SubscriptionPayment and OrderPayment with source IDs and verified statuses; never infer gateway capture from a manual reference. Make new transactions write the new ledger and legacy projections together inside one database transaction, reconcile daily, then switch readers. Keep historical rows immutable.
5. **Expand storefront.** Convert each existing Storefront draft/published JSON snapshot into Page/PageRevision/Section/SectionConfiguration and a complete SiteRevision with Theme, navigation, and settings snapshot. Compare rendered published output and slug resolution before pointer cutover; preserve old snapshot for rollback. Domain rows are inactive until ownership and TLS are verified.
6. **Constrain online.** Build new indexes with `CREATE INDEX CONCURRENTLY` in separately reviewed migrations outside transaction blocks. Add composite FKs/checks as `NOT VALID`, verify pre-existing rows, then `VALIDATE CONSTRAINT`; make required columns non-null only after all writers and backfills are complete. Convert legacy timestamp-without-time-zone columns to `timestamptz` only after confirming stored values are UTC, using an explicit UTC conversion. PostgreSQL documents lower-impact validation for new constraints. [PostgreSQL ALTER TABLE guidance](https://www.postgresql.org/docs/16/sql-altertable.html). Prisma schema and hand-written SQL migrations must be diff-checked together; raw constraints are intentional, not accidental drift.
7. **Cut over and contract.** Gate each module with tenant/branch denial tests, currency/stock reconciliation, idempotency and concurrency tests, production-size migration rehearsal, and a backup restore drill. Deploy API readers/writers before dropping legacy columns; wait at least one stable release with monitoring. Roll back code through compatible old columns; database rollback for posted financial data is restore/replay, never destructive down-migration.

**Migration order is risk-driven, not a promise that all new tables launch at once.** The current `TenantModule`, `StaffMember`, `InventoryBalance`, `SubscriptionPayment`, `OrderPayment`, storefront snapshots, and restaurant tables remain live until their replacement contracts are proven. Existing composite tenant foreign keys cover critical required links, but nullable customer/table and item-product links still need explicit tenant-safe migrations. The product is not ready for real payment-provider settlement or offline POS until the related adapters, reconciliation, and conflict workflows pass sandbox/device tests.

### Applied foundation

Migration `20261010120000_business_foundation` adds `BusinessTypeDefinition` (the physical name avoids the existing Prisma `BusinessType` enum), `Business`, and an optional `Branch.businessId`. It seeds the ten existing type codes, backfills one Business per Tenant and links every existing Branch. New tenant onboarding creates the Business and Branch in the same transaction. A composite foreign key rejects cross-tenant Branch-to-Business references; the current `UNIQUE (tenantId)` on Business deliberately limits each Tenant to one Business until downstream operational tables carry and enforce `businessId`.

The Branch link remains nullable for a rolling deployment with old writers. Do not treat it as a completed business-scope cutover: a later release must verify every branch writer, backfill any new nulls, then enforce `NOT NULL` online. `Tenant.businessType` and current authentication/RBAC remain authoritative until the catalog and membership cutovers are complete. The migration does not change the existing monetary arithmetic, inventory balance authority, or payment settlement behavior.
