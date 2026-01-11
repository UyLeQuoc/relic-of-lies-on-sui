export const Logo = () => {
	return <div className="w-10 h-10 flex items-center gap-2">
		<img src="/images/logo/main.png" alt="Logo" width={40} height={40} />
		<span className="text-2xl font-bold whitespace-nowrap">Relic of Lies</span>
	</div>;
}

export default function Header() {
	return <div className="w-full h-16 bg-green-300">
		<Logo />
	</div>;
}
