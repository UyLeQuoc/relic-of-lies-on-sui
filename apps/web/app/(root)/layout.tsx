import { Toaster } from "sonner";
import AppProvider from "./_components/app-provider";
import Header from "@/components/common/header";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AppProvider>
      <div className="flex flex-col min-h-screen overflow-x-hidden">
        <Header />
        <main className="flex-1">{children}</main>
        <Toaster position="top-right" richColors />
      </div>
    </AppProvider>
  );
}
