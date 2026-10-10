import type { ReactNode } from "react";

export function DataTable<T>({
  rows,
  columns,
  empty,
  label,
  rowKey,
}: {
  rows: T[];
  columns: { key: string; label: string; numeric?: boolean; render?: (row: T) => ReactNode }[];
  empty: string;
  label: string;
  rowKey: (row: T) => string;
}) {
  if (!rows.length) {
    return (
      <div className="empty-state" role="status">
        <strong>{empty}</strong>
      </div>
    );
  }

  return (
    <div className="ds-table-wrap">
      <table className="ds-table">
        <caption className="sr-only">{label}</caption>
        <thead>
          <tr>{columns.map((column) => <th scope="col" className={column.numeric ? "ds-numeric" : undefined} key={column.key}>{column.label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)}>
              {columns.map((column) => (
                <td className={column.numeric ? "ds-numeric" : undefined} key={column.key}>{column.render ? column.render(row) : String((row as Record<string, unknown>)[column.key] ?? "")}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
