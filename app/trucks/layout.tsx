import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";

export default function TrucksLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteNav />
      <main className="bg-white">{children}</main>
      <SiteFooter />
    </>
  );
}
