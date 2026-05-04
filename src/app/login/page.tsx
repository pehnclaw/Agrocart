import PhoneLoginForm from "@/components/auth/PhoneLoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-light opacity-50 blur-[100px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent-light opacity-50 blur-[100px]"></div>

      <div className="card glass p-8 w-full max-w-md relative z-10 animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Agrocart</h1>
          <p className="text-muted">Sign in to your Hub or HQ dashboard</p>
        </div>

        <PhoneLoginForm />
      </div>
    </main>
  );
}
