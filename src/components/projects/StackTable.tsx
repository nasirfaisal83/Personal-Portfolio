import type { StackRow } from "@/content/projects";

export function StackTable({ rows }: { rows: StackRow[] }) {
  return (
    <table className="stack-table">
      <thead>
        <tr>
          <th scope="col">Layer</th>
          <th scope="col">Technology</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.layer}>
            <th scope="row">{row.layer}</th>
            <td>{row.tech}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
