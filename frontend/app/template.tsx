// app/template.tsx
"use client";
import { MainLayout } from "@/components/layouts/MainLayout";

export default function Template({ children }: { children: React.ReactNode }) {
  return <MainLayout>{children}</MainLayout>;
}
