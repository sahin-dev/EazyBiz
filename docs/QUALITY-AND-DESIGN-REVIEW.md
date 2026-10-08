# SaaS quality and design review

Scope: the active Next.js/NestJS platform and the two product-owner requirement documents. This is a code and workflow review, not a certification or a claim that every requested module is complete.

## Quality standard

| Dimension | Commercial quality bar | Current position |
| --- | --- | --- |
| Tenant security | Every tenant resource is scoped by verified identity; permissions are checked on each request; credentials and recovery flows are auditable. See [OWASP Multi-Tenant Security](https://cheatsheetseries.owasp.org/cheatsheets/Multi_Tenant_Security_Cheat_Sheet.html) and [ASVS](https://owasp.org/projects/asvs). | Tenant guards and module roles exist. Platform admin access now requires explicit routes. Tenant isolation still needs a complete negative-path audit, MFA/recovery, and a reviewed authorization matrix. |
| Account lifecycle | An owner can invite, assign access, suspend, and review accounts; invitations expire and cannot be reused. See [OWASP token guidance](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html). | Delivered: 48-hour single-use invitations, renewal, role/branch changes, suspension, audit entries, and a Users UI. Invitations are shared manually; email delivery, recovery, MFA, and custom permissions remain. |
| Transaction correctness | Orders, payments, returns, stock, and cash closing reconcile under retries and concurrent use. | Atomic stock deduction exists. Returns, split tender, cash closing, offline reconciliation, gateway capture, and receipt-number policy remain release blockers. |
| Scale and availability | Large lists use server pagination/search; expensive tenant operations are bounded; migrations, backups, alerts, and restores are tested. | Many endpoints still return full collections. In-process rate limits are unsuitable for multi-instance deployment. Backup/restore and production load tests are missing. |
| Accessibility | Keyboard access, visible focus, readable contrast, clear labels/errors, and touch targets meet [WCAG 2.2 AA](https://www.w3.org/TR/wcag/) where applicable. | New account controls have labels and keyboard focus; table text and form text were enlarged. Full screen-reader, contrast, zoom, and cross-browser testing is still required. |
| Operational UX | Navigation only shows real destinations; branch context affects the data users see; actions give immediate feedback and recovery paths. | Placeholder admin/returns links were removed. Branch preference now updates operational pages. Search is correctly described as page/tool search; workspace status replaces simulated notification counts. |
| Bangladesh localization | BDT, Bangla/English output, compliant tax setup, and verified local payment settlement. | BDT and manual MFS records exist. Tax policy needs review, Bangla receipt/localization work remains, and MFS records are not gateway settlement. |

## Design direction applied

- A compact operational shell: dark charcoal navigation, neutral work surfaces, teal actions, and distinct blue/amber/red status accents.
- Clear type hierarchy and larger table/form text for repeated daily use.
- An unframed Users & access workspace with searchable status views, branch and role assignment, in-row actions, and a focused invitation drawer.
- An owner/admin Audit log with bounded pages, category filters, and readable event details.
- A separate account activation page where invited users set their own password.
- Active branch selection persisted in an HTTP-only cookie and applied to dashboard, orders, inventory, purchases, POS, reports, tables, and kitchen views. Catalog, customers, staff, and suppliers remain tenant-wide datasets.

## Release decision

Do not onboard paying businesses yet. First close the P0 items in [PRODUCTION-AUDIT.md](PRODUCTION-AUDIT.md), then run a production-like CI build, tenant/branch authorization integration tests, load tests, backup and restore drill, and mobile/desktop visual accessibility review. The 10,000-business target cannot be substantiated until pagination, indexing, load testing, and operational monitoring are in place.
