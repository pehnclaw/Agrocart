import IntakeForm from "@/components/hub/IntakeForm";
import RecentIntakes from "@/components/hub/RecentIntakes";

export default function HubDashboard() {
  return (
    <main className="animate-fade-in p-6 max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl text-primary font-bold">Smart Hub Dashboard</h1>
        <p className="text-muted">Manage intake and local inventory. Works offline!</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Left Column: Intake Form */}
        <section className="card p-6 glass md:col-span-3 h-fit">
          <h2 className="text-xl mb-4">New Produce Intake</h2>
          <IntakeForm />
        </section>

        {/* Right Column: Recent Intakes */}
        <section className="card p-6 md:col-span-2 h-fit">
          <h2 className="text-xl mb-4">Recent Intakes</h2>
          <RecentIntakes />
        </section>
      </div>
    </main>
  );
}
