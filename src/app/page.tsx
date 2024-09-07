import { randomUUID } from "crypto";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="grid grid-rows-1 items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-1 items-center sm:items-start">
        <Link href={`/${randomUUID()}`}>New game</Link>
      </main>
    </div>
  );
}
