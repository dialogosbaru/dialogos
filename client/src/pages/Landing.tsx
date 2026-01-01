import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AuthModal } from '@/components/AuthModal';
import { Brain, MessageCircle, Palette } from 'lucide-react';

export default function Landing() {
  const [showAuthModal, setShowAuthModal] = useState(false);

  const features = [
    {
      icon: Brain,
      title: 'Te recuerda',
      description: 'Leo aprende de ti y recuerda tus preferencias, nombres y detalles importantes de tus conversaciones.',
    },
    {
      icon: MessageCircle,
      title: 'Conversaciones naturales',
      description: 'Habla con Leo como lo harías con un amigo. Entiende tu tono, emociones y se adapta a tu estilo.',
    },
    {
      icon: Palette,
      title: 'Personalizable',
      description: 'Ajusta el nivel de lenguaje, la voz, el idioma y los colores para que Leo sea completamente tuyo.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Logo/Title */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold text-foreground tracking-tight">
              Diálogos
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground font-light">
              Conversations with Leo
            </p>
          </div>

          {/* Main Headline */}
          <div className="space-y-4 py-8">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground leading-tight">
              Leo está aquí para escucharte
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Tu amigo conversacional que te recuerda, aprende de ti y se adapta a tu forma de hablar. 
              Cada conversación es única, natural y significativa.
            </p>
          </div>

          {/* CTA Button */}
          <div className="pt-4">
            <Button
              size="lg"
              className="text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              onClick={() => setShowAuthModal(true)}
            >
              Comenzar a conversar
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-8 rounded-2xl bg-card/50 backdrop-blur-sm border border-border hover:border-accent transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                    <feature.icon className="w-7 h-7 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Diálogos © 2026 · Construido con amor para conversaciones significativas
          </p>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal open={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}
