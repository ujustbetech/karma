export default function TableHeader({ columns }) {
  return (
    <thead>
      <tr className="border-b border-slate-100">
        {columns.map((col) => (
          <th
            key={col.key}
            className="px-4 py-4 text-left text-sm font-medium text-slate-400"
          >
            {col.label}
          </th>
        ))}
      </tr>
    </thead>
  );
}