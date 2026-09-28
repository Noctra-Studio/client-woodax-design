export default function CncLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-site="cnc" className="flex flex-1 flex-col">
      {children}
    </div>
  );
}
