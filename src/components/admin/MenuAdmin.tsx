"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function MenuAdmin({ items }: { items: { href: string; label: string }[] }) {
  const ruta = usePathname();
  return (
    <nav aria-label="Panel" className="adm-nav chips">
      {items.map((m) => {
        const activo = m.href === "/admin" ? ruta === "/admin" : ruta.startsWith(m.href);
        return (
          <Link key={m.href} href={m.href} className="admlink" aria-current={activo ? "page" : undefined}>
            {m.label}
          </Link>
        );
      })}
    </nav>
  );
}
