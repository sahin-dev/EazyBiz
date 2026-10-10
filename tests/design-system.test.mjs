import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { test } from "node:test";
import { Input, Button } from "../apps/web/components/ui/primitives.tsx";
import { Tabs } from "../apps/web/components/ui/controls.tsx";
import { CommandPalette } from "../apps/web/components/ui/overlays.tsx";
import { formatBDT, formatLocalDate } from "../apps/web/lib/design-locale.ts";

const webRequire = createRequire(new URL("../apps/web/package.json", import.meta.url));
const React = webRequire("react");
const { renderToStaticMarkup } = webRequire("react-dom/server");
const { Search } = webRequire("lucide-react");

test("fields expose errors and help text to assistive technology", () => {
  const markup = renderToStaticMarkup(React.createElement(Input, { label: "Mobile number", hint: "Bangladesh number", error: "Enter a valid number" }));
  assert.match(markup, /aria-invalid="true"/);
  assert.match(markup, /aria-describedby="[^"]+-help [^"]+-error"/);
  assert.match(markup, /Bangladesh number/);
  assert.match(markup, /Enter a valid number/);
});

test("loading buttons are unavailable while work is pending", () => {
  const markup = renderToStaticMarkup(React.createElement(Button, { loading: true }, "Save"));
  assert.match(markup, /disabled/);
  assert.match(markup, /aria-busy="true"/);
});

test("tabs render one selected panel with linked roles", () => {
  const markup = renderToStaticMarkup(React.createElement(Tabs, { label: "Views", selectedId: "orders", onChange: () => {}, tabs: [{ id: "orders", label: "Orders", content: "Order list" }, { id: "stock", label: "Stock", content: "Stock list" }] }));
  assert.match(markup, /role="tablist"/);
  assert.match(markup, /aria-selected="true"/);
  assert.match(markup, /role="tabpanel"/);
  assert.match(markup, /Order list/);
  assert.doesNotMatch(markup, /Stock list/);
});

test("command palette exposes searchable permitted items", () => {
  const markup = renderToStaticMarkup(React.createElement(CommandPalette, { items: [{ id: "orders", label: "Orders", group: "Sales", icon: Search }], onSelect: () => {}, onClose: () => {} }));
  assert.match(markup, /role="dialog"/);
  assert.match(markup, /role="combobox"/);
  assert.match(markup, /role="listbox"/);
  assert.match(markup, /Orders/);
});

test("BDT display keeps decimal strings exact in English and Bangla", () => {
  assert.equal(formatBDT("12345678901234567890.50"), "৳\u00a01,23,45,67,89,01,23,45,67,890.50");
  assert.equal(formatBDT("1234567.5", "bn"), "৳\u00a0১২,৩৪,৫৬৭.৫০");
  assert.throws(() => formatBDT("12.345"), RangeError);
  assert.match(formatLocalDate("2026-10-10T00:00:00Z", "bn"), /২০২৬/);
});
