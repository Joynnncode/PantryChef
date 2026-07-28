const year = new Date().getFullYear();

export function SiteFooter() {
  return (
    <footer className="border-t border-border px-6 py-6 text-sm text-foreground-muted">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 sm:flex-row">
        <p>
          &copy; {year} Joynnncode. Built with PantryChef.
        </p>
        <nav className="flex items-center gap-4">
          <a
            href="https://www.linkedin.com/in/joychennn/"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-primary-700"
          >
            LinkedIn
          </a>
          <a
            href="https://github.com/Joynnncode"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-primary-700"
          >
            GitHub
          </a>
          <a
            href="mailto:joy.jovanna.s@gmail.com"
            className="transition-colors hover:text-primary-700"
          >
            Contact
          </a>
        </nav>
      </div>
    </footer>
  );
}
