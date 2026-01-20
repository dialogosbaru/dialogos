import { useAuth } from '@/contexts/AuthContext';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Flame, Calendar, Trophy, Loader2, ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Página de Logros
 * Muestra badges desbloqueados, racha actual y estadísticas de autocuidado
 */
export default function Achievements() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Obtener estadísticas del usuario
  const { data: stats, isLoading: statsLoading } = trpc.gamification.getStats.useQuery(
    {
      userId: user?.id?.toString() || '',
    },
    {
      enabled: !!user?.id,
    }
  );

  // Obtener logros desbloqueados
  const { data: achievementsData, isLoading: achievementsLoading } =
    trpc.gamification.getAchievements.useQuery(
      {
        userId: user?.id?.toString() || '',
      },
      {
        enabled: !!user?.id,
      }
    );

  const isLoading = statsLoading || achievementsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
          <p className="text-muted-foreground">Cargando tus logros...</p>
        </div>
      </div>
    );
  }

  const achievements = achievementsData?.achievements || [];
  const totalAchievements = achievements.length;
  const currentStreak = stats?.currentStreak || 0;
  const longestStreak = stats?.longestStreak || 0;
  const totalDaysActive = stats?.totalDaysActive || 0;
  const totalConversations = stats?.totalConversations || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="flex items-center justify-between p-4 max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation('/')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Mis Logros</h1>
              <p className="text-sm text-muted-foreground">
                Tu camino de autocuidado y crecimiento
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Estadísticas principales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Racha actual */}
          <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white border-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Flame className="h-4 w-4" />
                Racha Actual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{currentStreak}</div>
              <p className="text-xs text-white/80 mt-1">
                {currentStreak === 1 ? 'día' : 'días'} consecutivos
              </p>
            </CardContent>
          </Card>

          {/* Racha más larga */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-600" />
                Mejor Racha
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{longestStreak}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {longestStreak === 1 ? 'día' : 'días'} consecutivos
              </p>
            </CardContent>
          </Card>

          {/* Días totales */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                Días Activos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{totalDaysActive}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {totalDaysActive === 1 ? 'día' : 'días'} de autocuidado
              </p>
            </CardContent>
          </Card>

          {/* Conversaciones totales */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Trophy className="h-4 w-4 text-green-600" />
                Conversaciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{totalConversations}</div>
              <p className="text-xs text-muted-foreground mt-1">
                conversaciones con Leo
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Logros desbloqueados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-600" />
              Logros Desbloqueados
            </CardTitle>
            <CardDescription>
              Has desbloqueado {totalAchievements} {totalAchievements === 1 ? 'logro' : 'logros'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {achievements.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🌱</div>
                <p className="text-muted-foreground mb-2">
                  Aún no has desbloqueado ningún logro
                </p>
                <p className="text-sm text-muted-foreground">
                  Sigue conversando con Leo para desbloquear tus primeros logros
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((achievement: any) => (
                  <Card
                    key={achievement.id}
                    className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-3">
                        <div className="text-4xl">{achievement.icon}</div>
                        <div className="flex-1">
                          <CardTitle className="text-base">{achievement.title}</CardTitle>
                          <CardDescription className="text-xs mt-1">
                            {achievement.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-white/60 rounded-lg p-3 border border-amber-200">
                        <p className="text-sm text-muted-foreground italic">
                          "{achievement.message}"
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Desbloqueado el{' '}
                          {format(new Date(achievement.unlockedAt), "d 'de' MMMM, yyyy", {
                            locale: es,
                          })}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mensaje motivacional */}
        {currentStreak > 0 && (
          <Card className="bg-gradient-to-r from-amber-100 to-orange-100 border-amber-300">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="text-5xl">🔥</div>
                <div>
                  <p className="font-semibold text-foreground">
                    {currentStreak >= 7
                      ? '¡Increíble! Llevas una semana cuidándote.'
                      : currentStreak >= 3
                      ? '¡Vas muy bien! La constancia es clave.'
                      : '¡Buen comienzo! Sigue así.'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Cada día que vuelves es un acto de amor propio. Sigue adelante.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
