import AvailableLoads from "@/components/loadboard/AvailableLoads";

export default function LoadBoardPage() {
  return (
    <main className="animate-fade-in p-6 max-w-7xl mx-auto min-h-screen">
      <header className="mb-8 flex justify-between items-center bg-surface p-8 rounded-2xl shadow-sm border border-border">
        <div>
          <h1 className="text-3xl text-primary font-bold mb-2">Transporter Load Board</h1>
          <p className="text-muted text-lg">Find backhaul loads, fill your empty trucks, and get paid instantly via Escrow.</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted">Active Escrow Wallet</p>
          <p className="text-2xl font-bold">₦0.00</p>
        </div>
      </header>

      <section>
        <h2 className="text-2xl font-bold mb-2">Available Loads Nearby</h2>
        <p className="text-muted">Pooled loads optimized for your current route.</p>
        <AvailableLoads />
      </section>
    </main>
  );
}
