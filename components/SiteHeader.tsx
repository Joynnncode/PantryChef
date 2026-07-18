import Link from "next/link";

const navLinks = [
  { href: "/discover", label: "Discover" },
  { href: "/ask", label: "Ask" },
  { href: "/scan", label: "Scan" },
  { href: "/meal-prep", label: "Meal Prep" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-surface/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-primary-800">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500 text-white">
            🍲
          </span>
          PantryChef
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 font-medium text-foreground-muted transition-colors hover:bg-primary-50 hover:text-primary-700"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
