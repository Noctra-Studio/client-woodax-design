export function TrustStrip({ items }: { items: readonly string[] }) {
  if (items.length === 0) return null;

  return (
    <section className="border-cnc-line overflow-hidden rounded-sm border-y">
      <ul className="mx-auto grid w-full max-w-[1200px] grid-cols-2 md:grid-cols-4">
        {items.map((item) => (
          <li
            key={item}
            className="text-cnc-muted border-cnc-line flex min-h-16 items-center justify-center border-r border-b px-4 py-3 text-center font-mono text-[11px] leading-[1.45] tracking-[0.08em] uppercase md:border-b-0 md:text-xs [&:nth-child(2n)]:border-r-0 md:[&:nth-child(2n)]:border-r md:[&:nth-child(4n)]:border-r-0"
          >
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
