"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  BarChart3,
  TrendingUp,
  Globe,
  List,
  Filter,
  Briefcase,
  ArrowLeftRight,
} from "lucide-react";

export default function Navbar() {
  const [search, setSearch] = useState("");
  const [time, setTime] = useState("");
  const router = useRouter();

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/stock/${search.trim().toUpperCase()}`);
      setSearch("");
    }
  };

  return (
    <nav className="h-10 bg-[var(--bg-secondary)] border-b border-[var(--border)] flex items-center px-3 gap-4 text-xs shrink-0">
      <Link
        href="/"
        className="text-[var(--accent-orange)] font-bold tracking-wider text-sm"
      >
        TRADINGHUB
      </Link>

      <div className="flex items-center gap-3 text-[var(--text-secondary)]">
        <Link
          href="/"
          className="flex items-center gap-1 hover:text-[var(--text-primary)] transition-colors"
        >
          <BarChart3 size={13} />
          Markets
        </Link>
        <Link
          href="/screener"
          className="flex items-center gap-1 hover:text-[var(--text-primary)] transition-colors"
        >
          <Filter size={13} />
          Screener
        </Link>
        <Link
          href="/economic"
          className="flex items-center gap-1 hover:text-[var(--text-primary)] transition-colors"
        >
          <Globe size={13} />
          Economy
        </Link>
        <Link
          href="/watchlist"
          className="flex items-center gap-1 hover:text-[var(--text-primary)] transition-colors"
        >
          <List size={13} />
          Watchlist
        </Link>
        <Link
          href="/portfolio"
          className="flex items-center gap-1 hover:text-[var(--text-primary)] transition-colors"
        >
          <Briefcase size={13} />
          Portfolio
        </Link>
        <Link
          href="/compare"
          className="flex items-center gap-1 hover:text-[var(--text-primary)] transition-colors"
        >
          <ArrowLeftRight size={13} />
          Compare
        </Link>
      </div>

      <form onSubmit={handleSearch} className="ml-auto flex items-center">
        <div className="flex items-center bg-[var(--bg-tertiary)] border border-[var(--border)] rounded px-2 py-1 gap-1">
          <Search size={12} className="text-[var(--text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value.toUpperCase())}
            placeholder="Symbol (e.g. AAPL)"
            className="bg-transparent text-[var(--text-primary)] text-xs w-32 outline-none placeholder:text-[var(--text-muted)] font-mono"
          />
        </div>
      </form>

      <div className="flex items-center gap-3 text-[var(--text-muted)] font-mono text-[11px]">
        <span className="text-[var(--accent-orange)]">{time}</span>
        <span>ET</span>
      </div>
    </nav>
  );
}
