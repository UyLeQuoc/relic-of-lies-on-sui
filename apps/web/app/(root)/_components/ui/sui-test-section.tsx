import LoginComponent from '@/components/common/login'

export default function SuiTestSection() {
  return (
    <div>
        <div className="text-2xl font-bold">Sui Testnet</div>
        <div className="text-lg text-muted-foreground">
            Test your Sui wallet connection and test the Sui testnet.
        </div>
        <div>
            <h1>Enoki Wallet</h1>
            <LoginComponent />
        </div>
    </div>
  )
}
