import { Toaster } from "sonner";
import AppProvider from "./_components/app-provider";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AppProvider>
      <div className="flex flex-col min-h-screen overflow-x-hidden">
        <div>{children}</div>
        <Toaster position="top-right" richColors />
      </div>
    </AppProvider>
  );
}
