import { Activity } from "lucide-react";

export function Header() {
  return (
    <header className="bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">

          <h1 className="text-xl font-semibold tracking-tight">Civara</h1>
        </div>
        <p className="text-sm text-neutral-500 font-medium hover:text-blue-600 transition-colors cursor-pointer"><a href="https://mahros.dev" target="_blank" rel="noopener noreferrer">Who am i?</a></p>
      </div>
    </header>
  );
}
