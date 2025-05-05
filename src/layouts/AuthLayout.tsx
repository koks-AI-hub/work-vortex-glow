
import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">{title}</h1>
          {subtitle && <p className="mt-2 text-gray-400">{subtitle}</p>}
        </div>
        <div className="glass-panel p-6 md:p-8">{children}</div>
      </div>
    </div>
  );
}
