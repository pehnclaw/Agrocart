import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center animate-fade-in relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary-light opacity-30 blur-[120px] -z-10"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent-light opacity-30 blur-[120px] -z-10"></div>

      <h1 className="text-5xl md:text-7xl font-bold text-primary mb-6">Agrocart</h1>
      <p className="text-xl text-muted max-w-2xl mb-12">
        The Hub & Spoke agro-logistics platform connecting Nigerian farmers, transporters, and buyers.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        <Link href="/hub" className="card glass p-8 hover:-translate-y-2 transition-transform cursor-pointer">
          <div className="w-16 h-16 bg-primary-light rounded-2xl mb-6 flex items-center justify-center">
            <span className="text-2xl">🏭</span>
          </div>
          <h2 className="text-2xl font-bold mb-2">Smart Hub</h2>
          <p className="text-muted">Offline-first intake, weighing, and digital waybill generation.</p>
        </Link>

        <Link href="/hq" className="card glass p-8 hover:-translate-y-2 transition-transform cursor-pointer">
          <div className="w-16 h-16 bg-accent-light rounded-2xl mb-6 flex items-center justify-center">
            <span className="text-2xl">📡</span>
          </div>
          <h2 className="text-2xl font-bold mb-2">HQ Control Tower</h2>
          <p className="text-muted">National tracking, FEFO inventory, and live heatmap.</p>
        </Link>

        <Link href="/loadboard" className="card glass p-8 hover:-translate-y-2 transition-transform cursor-pointer">
          <div className="w-16 h-16 bg-primary-light rounded-2xl mb-6 flex items-center justify-center">
            <span className="text-2xl">🚛</span>
          </div>
          <h2 className="text-2xl font-bold mb-2">Transporter</h2>
          <p className="text-muted">Find backhaul loads and get paid via Escrow.</p>
        </Link>
      </div>

      <div className="mt-16">
        <Link href="/login" className="btn btn-primary px-8 py-4 text-lg shadow-lg shadow-primary/30">
          Sign In to Your Account
        </Link>
      </div>
    </main>
  );
}
