import Header from "@/components/common/header";
import Footer from "@/components/common/footer";

export default function Layout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div className="flex flex-col min-h-screen overflow-x-hidden">
			<Header />
			<div>
				{children}
			</div>
			<Footer />
		</div>
	);
}
