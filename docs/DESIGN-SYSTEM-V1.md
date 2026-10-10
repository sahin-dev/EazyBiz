# BusinessOS design system v1

Status: implemented foundations and reusable React components. Scope is the application workspace, not a new business workflow. The current dashboard, POS, storefront, and administration pages remain intact while they adopt these primitives incrementally.

## Character

Quiet and operational. One clear primary action per working area, dense but legible records, restrained color, and minimal decoration. Business data is the visual priority. Green-teal identifies actions and selection; amber, blue, and red communicate different kinds of information rather than making the interface monochrome. Use real business labels, never ornamental cards or instructional marketing copy inside workspaces.

## Foundations

| Foundation | Rule |
| --- | --- |
| Typography | `--ds-font-sans`: Inter, Noto Sans Bengali, Hind Siliguri, Nirmala UI, system UI. Body 14px/1.5; labels 13px; table headers 12px; section headings 16-18px; page headings 25-28px. Never size text with viewport width. Use 600-750 weight for hierarchy. |
| Bangla | Apply `lang="bn"` to Bangla passages or the document when fully localized. Bengali line-height 1.65; no uppercase transform or letter spacing. Allow a second line in compact controls. Keep Latin SKU, email, account references, and formatted amounts in isolated `bdi` elements when adjacent to Bangla text. |
| Spacing | 4px base scale: `--ds-space-1/2/3/4/5/6/8/10` = 4/8/12/16/20/24/32/40px. Form rows 12-16px; section spacing 24-32px. |
| Grid | 12 columns on desktop, 8 on tablet, 4 on mobile; 16px gutters, 12px on mobile. Main workspaces max 1660px. Tables scroll horizontally; never shrink financial columns into unreadable text. |
| Radius | 4px small, 6px controls, 8px cards/dialogs. No decorative pill cards. |
| Shadows | Surfaces use a border or minimal 1px shadow. Popovers and dialogs alone use `--ds-shadow-popover` and `--ds-shadow-dialog`. |
| Icons | Lucide, 16-18px for controls, 20-24px for state illustrations. Icon-only buttons require a label and tooltip/title. Icons never carry status alone. |
| Motion | 150ms interaction feedback. Shimmer and transitions stop for `prefers-reduced-motion`. No motion may delay a transaction. |

Color tokens live in `apps/web/app/design-system.css`. Use semantic names rather than page-specific hex values:

| Role | Light | Dark | Use |
| --- | --- | --- | --- |
| Canvas | `#f4f7f7` | `#141d20` | Workspace background |
| Surface | `#ffffff` | `#1d292d` | Panels and controls |
| Text | `#1d2b2e` | `#edf3f2` | Primary content |
| Muted text | `#52646b` | `#b8c7c8` | Secondary content |
| Border | `#d8e2e4` | `#405258` | Boundaries |
| Primary | `#08756b` | `#69cfb8` | Selection and links |
| Success | `#176c46` | `#9bd9aa` | Completed/healthy |
| Warning | `#89540e` | `#f1bd70` | Pending/review |
| Danger | `#ad342d` | `#f3a39d` | Error/destructive |
| Info | `#236886` | `#9ccfe6` | Neutral guidance |

Light/dark tokens include soft status surfaces, overlays, focus, and five chart series. Theme follows the operating system on first visit and a user's explicit choice afterward. The preference is local to the browser; it is not a tenant setting. Receipt printing remains black on white.

## Component contract

| Family | Components and behavior |
| --- | --- |
| Actions | `Button` has primary, secondary, quiet, danger, disabled, and loading states. `IconButton` enforces an accessible name and hover title. One primary action per workflow section. |
| Forms | `Input`, `Select`, `Textarea`, `Checkbox`, `Switch`, `SegmentedControl`. Errors and hints are linked through `aria-describedby`; use native input types, validation, and disabled states. Keep BDT amount labels explicit and align numbers with tabular figures. |
| Data | `DataTable` requires a label and stable row key, supports numeric alignment, and owns an empty state. `Card` frames individual metrics/items only. `StatusBadge` always includes text. `Pagination` has labelled previous/next controls and a live page count. |
| Navigation | `NavigationList` and `SidebarFrame` are generic shells. The app's permission-filtered sidebar remains the working instance. `CommandPalette` is reusable and receives only already-authorized items; it supports search, arrow keys, Enter, and Escape. |
| Disclosure | `Tabs` link tab and panel IDs and support arrow keys. `DropdownMenu` supports pointer, arrows, Escape, and outside click. `Tooltip` names unfamiliar controls. `Modal` and `Drawer` trap focus, close on Escape/backdrop, lock scrolling, and restore prior focus. |
| Feedback | `Alert`, `Notice`, `ToastProvider`/`useToast`, `EmptyState`, `Skeleton`, `LoadingState`, and `ErrorState`. Errors explain what failed and provide a retry only when one is meaningful. Toasts are transient; critical errors stay inline. |
| Charts | `ChartFrame` supplies a title, text description, and legend. Every chart still needs an accessible table or equivalent textual values from the feature using it. Use the chart token series consistently; never rely on color alone. |

## Responsive behavior

| Width | Layout and interaction |
| --- | --- |
| Desktop, 1024px+ | Persistent sidebar; 12-column grid; dense tables; contextual commands beside the relevant heading. Keep the top bar stable. |
| Tablet, 700-1023px | 8-column grid; sidebar becomes an overlay as space requires; two-column forms only where labels remain clear; popovers stay inside the viewport. |
| Mobile, up to 699px | 4-column grid; one-column forms; drawer/dialog uses nearly full viewport width with reachable actions; tables scroll; minimum 40px target size for primary controls. Do not hide amounts, status, or a required action just to fit. |

Use content-driven wrapping and `minmax(0, 1fr)`. Bengali labels may be longer than English, so navigation and buttons must allow wrapping or truncation with a full accessible name. Currency values use a nonbreaking `৳` + amount presentation where needed, but the stored decimal value remains independent of locale. Dates should use the active locale and `Asia/Dhaka` only at presentation boundaries. `formatBDT` in `apps/web/lib/design-locale.ts` accepts an exact decimal string without floating-point conversion; `formatLocalDate` applies the selected locale and Dhaka display timezone. Isolate mixed-script amount labels with `bdi`.

## Interaction rules

- Put the action nearest to the record or form it affects. Use a dialog for short decisions and a drawer for multi-field editing. Destructive actions require explicit confirmation and plain-language consequences.
- Preserve focus and input after recoverable failures. Disable only the action currently waiting for a response; show a loading state while navigation or data fetches are pending.
- Empty states distinguish no data from no search results and denied access. Do not imply a feature is available when subscription or permission rules block it.
- Keep navigation permission-filtered before passing entries to the command palette. Visual hiding is not authorization; APIs continue to enforce tenant, branch, role, and module scope.
- Use semantic statuses and separate operational, payment, and sync states. A green badge must not imply that a manual payment reference was verified.

## Adoption and limits

Existing pages have many legacy hardcoded color declarations. Semantic tokens and dark overrides cover the shared shell, tables, cards, forms, overlays, and new components, but each business workspace should be visually reviewed as it moves to token-only styling. The font stack uses device-provided Bengali fonts; a licensed self-hosted Bengali font should be bundled if controlled cross-device metrics are required. Full language switching and translated business copy are separate localization work, not part of this design-system change.
