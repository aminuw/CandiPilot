import { AuthForm } from "@/components/auth-form";
import { Rocket, Target, Sparkles, BarChart3, Check } from "lucide-react";

export const dynamic = "force-dynamic";

export default function LandingPage() {
  const features = [
    {
      icon: Target,
      title: "Kanban intuitif",
      description: "Visualise tes candidatures en 6 colonnes. Drag & drop facile.",
    },
    {
      icon: Sparkles,
      title: "Relances IA",
      description: "Génère des emails de relance professionnels en 1 clic.",
    },
    {
      icon: BarChart3,
      title: "Stats détaillées",
      description: "Suis ton taux de réponse et optimise ta stratégie.",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <main className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-transparent to-purple-900/20 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Hero content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-2 mb-6">
                <Rocket className="h-4 w-4 text-indigo-400" />
                <span className="text-sm text-indigo-300">100% gratuit pour démarrer</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Track tes{" "}
                <span className="gradient-text">candidatures</span>
                <br />
                comme un pro
              </h1>

              <p className="text-lg text-slate-400 mb-8 max-w-xl mx-auto lg:mx-0">
                Fini les tableaux Excel bordéliques. CandiPilot t&apos;aide à organiser
                ta recherche de stage avec un Kanban visuel et des relances IA.
              </p>

              {/* Feature list */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-8">
                {["20 candidatures gratuites", "Relances IA", "Kanban drag & drop"].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                    <Check className="h-4 w-4 text-green-400" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Auth form */}
            <div className="animate-fade-in">
              <AuthForm />
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="py-20 border-t border-slate-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Tout ce qu&apos;il te faut pour décrocher un stage
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-indigo-500/30 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-800">
        <div className="container mx-auto px-4 text-center text-slate-500 text-sm">
          <p>© 2024 CandiPilot. Fait avec ❤️ pour les étudiants français.</p>
        </div>
      </footer>
    </div>
  );
}
