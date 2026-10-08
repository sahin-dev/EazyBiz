# BusinessOS Product Blueprint

## Information Architecture

- Dashboard
- Sales: POS, Orders, Returns, Invoices, Held Bills
- Products: Products, Categories, Variants, Pricing, Barcode
- Inventory: Stock, Purchases, Adjustments, Transfers, Wastage, Stock Count
- Customers: Customers, Groups, Loyalty
- Suppliers: Suppliers, Purchase Orders, Payments, Due
- Reports: Sales, Products, Inventory, Profit, Customers, Suppliers
- Storefront: Overview, Website Builder, Products, Orders, Pages, Themes, Domain
- Marketing: Promotions, Coupons, Campaigns
- Staff: Employees, Roles, Attendance, Payroll
- Settings: Business, Branches, Users, Roles, Payments, Tax/VAT, Integrations, Subscription

The browser prototype filters navigation by module availability. The active API additionally enforces authentication, tenant isolation, roles, and module entitlements; fine-grained permission scopes and complete CRUD coverage remain incomplete.

## User Flows

1. Onboard business
   - Select business type
   - Add business details
   - Choose recommended modules
   - Create first branch
   - Add first products
   - Open dashboard

2. Make a sale
   - Open POS
   - Search/scan product
   - Select customer
   - Choose payment method
   - Complete sale
   - Stock is deducted and order is synced or queued

3. Launch storefront
   - Enable storefront module
   - Add products
   - Add/reorder sections
   - Preview desktop/tablet/mobile
   - Publish

4. Add stock
   - Open inventory
   - Receive purchase or adjust stock
   - Supplier payable updates
   - Audit log is created in production API

5. Manage subscription
   - Select Starter or Business plan and monthly or yearly billing
   - Enable business-compatible paid modules, priced as add-ons
   - Submit manual payment information
   - Platform administrator reviews and records the payment result

## Delivery Status

- Implemented: tenant onboarding foundations, shared POS checkout, products/inventory/suppliers/staff, module catalog and pricing, tenant subscription controls, manual payment review, platform-admin tenant management, and API-side tenant/module guards.
- Partial: storefront section editor and public catalog exist, but section editing is not a persisted drag-and-drop builder and public cart/checkout/order tracking is incomplete.
- Planned: offline POS queue/sync, automated payment providers and recurring billing, pharmacy batch/expiry/prescription handling, grocery weight/barcode operations, delivery, full branch administration, and advanced vertical workflows.

## Design System

Components implemented:

- Button
- Input
- Select
- Textarea
- DataTable
- Drawer
- Modal
- Card
- KPI widget
- Product selector
- Customer selector
- Payment selector
- Status badge
- Toast
- Empty state
- Loading state
- Error state

Charts are represented by KPI/report cards in the dependency-free version. In production, chart primitives should be added as reusable components backed by report DTOs.

## Business-Type Configuration

Each business type controls:

- Recommended modules
- Dashboard widgets
- Product attributes
- Order statuses
- Storefront theme
- Setup checklist

This avoids hardcoding restaurant/pharmacy/grocery logic throughout screens.

## Permission Model

Default roles:

- Owner
- Admin
- Manager
- Cashier
- Inventory Manager
- Sales Staff
- Accountant
- Kitchen Staff
- Pharmacist
- Delivery Staff

Navigation is filtered by module availability and role permissions. In production, the API must enforce the same permissions server-side.

## Storefront Builder Architecture

The builder uses:

- Section library
- Live canvas
- Properties panel
- Draft/published state
- Business-specific recommended theme
- Product sync from POS catalog

Storefront data should eventually be stored as normalized sections plus JSON properties.
