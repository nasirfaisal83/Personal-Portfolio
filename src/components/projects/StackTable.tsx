import type { StackRow } from "@/content/projects";

/** The case study's layer-by-layer stack, set in a white card with hairline rows. */
export function StackTable({ rows }: { rows: StackRow[] }) {
  return (
    <div className="stack-table">
      <table className="stack-table__table">
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
    </div>
  );
}
