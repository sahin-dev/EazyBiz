// @ts-check

import { escapeHtml, formatMoney } from "../utils/format.js";

/**
 * @param {{variant?:'primary'|'secondary'|'danger'|'warning', label:string, action?:string, attrs?:string, type?:'button'|'submit'}} props
 */
export function Button({ variant = "primary", label, action = "", attrs = "", type = "button" }) {
  return `<button type="${type}" class="btn ${variant === "primary" ? "" : variant}" ${action} ${attrs}>${escapeHtml(label)}</button>`;
}

/**
 * @param {{name:string, label:string, value?:string|number, type?:string, required?:boolean, placeholder?:string, min?:number, step?:string}} props
 */
export function Input({ name, label, value = "", type = "text", required = false, placeholder = "", min, step }) {
  return `
    <label class="field">
      <span>${escapeHtml(label)}</span>
      <input name="${name}" type="${type}" value="${escapeHtml(String(value))}" placeholder="${escapeHtml(placeholder)}" ${required ? "required" : ""} ${min !== undefined ? `min="${min}"` : ""} ${step ? `step="${step}"` : ""} />
    </label>
  `;
}

/**
 * @param {{name:string, label:string, value?:string, options:{value:string,label:string}[], required?:boolean}} props
 */
export function Select({ name, label, value = "", options, required = false }) {
  return `
    <label class="field">
      <span>${escapeHtml(label)}</span>
      <select name="${name}" ${required ? "required" : ""}>
        ${options.map((option) => `<option value="${escapeHtml(option.value)}" ${option.value === value ? "selected" : ""}>${escapeHtml(option.label)}</option>`).join("")}
      </select>
    </label>
  `;
}

/**
 * @param {{name:string, label:string, value?:string, placeholder?:string}} props
 */
export function Textarea({ name, label, value = "", placeholder = "" }) {
  return `
    <label class="field full">
      <span>${escapeHtml(label)}</span>
      <textarea name="${name}" placeholder="${escapeHtml(placeholder)}">${escapeHtml(value)}</textarea>
    </label>
  `;
}

/**
 * @param {{title:string, description?:string, action?:string, body:string, className?:string}} props
 */
export function Card({ title, description = "", action = "", body, className = "" }) {
  return `
    <article class="card ${className}">
      <div class="card-header">
        <div>
          <h2>${escapeHtml(title)}</h2>
          ${description ? `<p>${escapeHtml(description)}</p>` : ""}
        </div>
        ${action}
      </div>
      ${body}
    </article>
  `;
}

/**
 * @param {{label:string, value:string|number, note:string, tone?:'success'|'warning'|'danger'|'info'}} props
 */
export function KPI({ label, value, note, tone = "success" }) {
  return `
    <article class="card metric">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(String(value))}</strong>
      <small class="${tone}">${escapeHtml(note)}</small>
    </article>
  `;
}

/**
 * @param {{label:string, tone?:'active'|'warn'|'danger'|'neutral'}} props
 */
export function StatusBadge({ label, tone = "neutral" }) {
  return `<span class="chip ${tone === "neutral" ? "" : tone}">${escapeHtml(label)}</span>`;
}

/**
 * @template {object} T
 * @param {{columns:{key:string,label:string, render?:(row:T)=>string}[], rows:T[], emptyTitle:string, emptyAction?:string}} props
 */
export function DataTable({ columns, rows, emptyTitle, emptyAction = "" }) {
  if (!rows.length) return EmptyState({ title: emptyTitle, description: "Use the primary action to create your first record.", action: emptyAction });
  return `
    <div class="table-shell">
      <table class="table">
        <thead><tr>${columns.map((column) => `<th>${escapeHtml(column.label)}</th>`).join("")}</tr></thead>
        <tbody>
          ${rows
            .map((row) => `<tr>${columns.map((column) => {
              const value = Object.entries(row).find(([key]) => key === column.key)?.[1];
              return `<td>${column.render ? column.render(row) : escapeHtml(String(value ?? ""))}</td>`;
            }).join("")}</tr>`)
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

/**
 * @param {{title:string, description:string, action?:string}} props
 */
export function EmptyState({ title, description, action = "" }) {
  return `
    <div class="empty-state">
      <strong>${escapeHtml(title)}</strong>
      <p>${escapeHtml(description)}</p>
      ${action}
    </div>
  `;
}

/**
 * @param {{label?:string}} props
 */
export function LoadingState({ label = "Loading business data..." } = {}) {
  return `<div class="state-panel"><span class="skeleton"></span><span>${escapeHtml(label)}</span></div>`;
}

/**
 * @param {{message:string, retryAction?:string}} props
 */
export function ErrorState({ message, retryAction = "" }) {
  return `<div class="state-panel error"><strong>Something went wrong</strong><p>${escapeHtml(message)}</p>${retryAction}</div>`;
}

/**
 * @param {{products: import('../domain/types.js').Product[], action:string}} props
 */
export function ProductSelector({ products, action }) {
  return `
    <div class="product-grid">
      ${products
        .map(
          (product) => `
            <button class="product-button" data-action="${action}" data-product-id="${product.id}" aria-label="Add ${escapeHtml(product.name)}">
              <span>
                <strong>${escapeHtml(product.name)}</strong>
                <span class="muted">${escapeHtml(product.category)} - ${product.stock} ${escapeHtml(product.unit)} left</span>
              </span>
              <span class="button-row">
                ${StatusBadge({ label: formatMoney(product.salePrice), tone: "active" })}
                ${product.stock <= product.minimumStock ? StatusBadge({ label: "Low", tone: "danger" }) : ""}
              </span>
            </button>
          `,
        )
        .join("")}
    </div>
  `;
}

/**
 * @param {{customers: import('../domain/types.js').Customer[], selectedId:string|null}} props
 */
export function CustomerSelector({ customers, selectedId }) {
  return Select({
    name: "customerId",
    label: "Customer",
    value: selectedId || "",
    options: [{ value: "", label: "Walk-in customer" }, ...customers.map((customer) => ({ value: customer.id, label: `${customer.name} - ${customer.phone}` }))],
  });
}

/**
 * @param {{methods: import('../domain/types.js').PaymentMethod[]}} props
 */
export function PaymentSelector({ methods }) {
  return Select({
    name: "paymentMethod",
    label: "Payment method",
    value: methods[0],
    options: methods.map((method) => ({ value: method, label: method })),
  });
}

/**
 * @param {{id:string, title:string, body:string}} props
 */
export function Modal({ id, title, body }) {
  return `
    <div class="modal-backdrop" data-modal="${escapeHtml(id)}">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="${escapeHtml(id)}Title">
        <div class="modal-header">
          <h2 id="${escapeHtml(id)}Title">${escapeHtml(title)}</h2>
          <button class="icon-button" data-action="close-modal" aria-label="Close">x</button>
        </div>
        <div class="modal-body">${body}</div>
      </div>
    </div>
  `;
}

/**
 * @param {{id:string, title:string, body:string}} props
 */
export function Drawer({ id, title, body }) {
  return `
    <div class="modal-backdrop" data-modal="${escapeHtml(id)}">
      <aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="${escapeHtml(id)}Title">
        <div class="modal-header">
          <h2 id="${escapeHtml(id)}Title">${escapeHtml(title)}</h2>
          <button class="icon-button" data-action="close-modal" aria-label="Close">x</button>
        </div>
        <div class="modal-body">${body}</div>
      </aside>
    </div>
  `;
}

/**
 * @param {{message:string, tone:'success'|'error'|'info'}|null} toast
 */
export function Toast(toast) {
  return `<div class="toast ${toast ? "show" : ""} ${toast?.tone || ""}" role="status" aria-live="polite">${toast ? escapeHtml(toast.message) : ""}</div>`;
}
