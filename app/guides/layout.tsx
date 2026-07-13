import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";

export default function GuidesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteNav />
      <main className="bg-white">{children}</main>
      <SiteFooter />
    </>
  );
}
