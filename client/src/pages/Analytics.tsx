import { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react';
import { useAuth } from '@/_core/hooks/useAuth';
import { getLoginUrl } from '@/const';

/**
 * Panel de Análisis Emocional
 * Muestra estadísticas y gráficos de emociones del usuario
 */
export default function Analytics() {
  const { user, loading: authLoading } = useAuth();
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');

  // Obtener estadísticas según el rango de tiempo seleccionado
  const { data: stats, isLoading, error } = trpc.analytics[
    timeRange === 'week' ? 'getWeeklyStats' : 'getMonthlyStats'
  ].useQuery(
    { userId: user?.id ? String(user.id) : '' },
    { enabled: !!user?.id }
  );

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Inicia sesión para ver tu análisis</CardTitle>
            <CardDescription>
              El panel de análisis emocional te permite visualizar tus patrones emocionales y progreso.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <a href={getLoginUrl()}>Iniciar sesión</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Card className="max-w-md w-full border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              Error al cargar datos
            </CardTitle>
            <CardDescription>
              No pudimos cargar tus estadísticas. Por favor, intenta de nuevo más tarde.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Calcular tendencia de valence (positivo/negativo)
  const valence = stats?.avgValence || 0;
  const valenceTrend = valence > 0.2 ? 'positive' : valence < -0.2 ? 'negative' : 'neutral';

  // Obtener emoción dominante
  const emotionEntries = Object.entries(stats?.emotionDistribution || {});
  const dominantEmotion = emotionEntries.sort((a, b) => b[1] - a[1])[0];

  // Traducir emociones al español
  const emotionTranslations: Record<string, string> = {
    happy: 'Felicidad',
    sad: 'Tristeza',
    anxious: 'Ansiedad',
    frustrated: 'Frustración',
    crisis: 'Crisis',
    hopeful: 'Esperanza',
    tired: 'Cansancio',
    neutral: 'Neutral',
  };

  // Traducir modos conversacionales
  const modeTranslations: Record<string, string> = {
    CONTENCIÓN: 'Contención',
    ACOMPAÑAMIENTO: 'Acompañamiento',
    ORIENTACIÓN: 'Orientación',
    INFORMATIVO: 'Informativo',
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Panel de Análisis Emocional</h1>
            <p className="text-muted-foreground mt-1">
              Visualiza tus patrones emocionales y progreso
            </p>
          </div>

          {/* Time range selector */}
          <div className="flex gap-2">
            <Button
              variant={timeRange === 'week' ? 'default' : 'outline'}
              onClick={() => setTimeRange('week')}
            >
              Última semana
            </Button>
            <Button
              variant={timeRange === 'month' ? 'default' : 'outline'}
              onClick={() => setTimeRange('month')}
            >
              Último mes
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Messages */}
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Mensajes totales</CardDescription>
              <CardTitle className="text-3xl">{stats?.totalMessages || 0}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                En {timeRange === 'week' ? 'la última semana' : 'el último mes'}
              </p>
            </CardContent>
          </Card>

          {/* Valence Trend */}
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Tendencia emocional</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                {valenceTrend === 'positive' && (
                  <>
                    <TrendingUp className="w-6 h-6 text-green-500" />
                    <span className="text-green-500">Positiva</span>
                  </>
                )}
                {valenceTrend === 'negative' && (
                  <>
                    <TrendingDown className="w-6 h-6 text-red-500" />
                    <span className="text-red-500">Negativa</span>
                  </>
                )}
                {valenceTrend === 'neutral' && (
                  <>
                    <Minus className="w-6 h-6 text-gray-500" />
                    <span className="text-gray-500">Neutral</span>
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Valence: {valence.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          {/* Dominant Emotion */}
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Emoción dominante</CardDescription>
              <CardTitle className="text-2xl">
                {dominantEmotion
                  ? emotionTranslations[dominantEmotion[0]] || dominantEmotion[0]
                  : 'N/A'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {dominantEmotion ? `${dominantEmotion[1]} veces` : 'Sin datos'}
              </p>
            </CardContent>
          </Card>

          {/* Crisis Count */}
          <Card className={stats?.crisisCount ? 'border-destructive' : ''}>
            <CardHeader className="pb-2">
              <CardDescription>Alertas de crisis</CardDescription>
              <CardTitle className={`text-3xl ${stats?.crisisCount ? 'text-destructive' : ''}`}>
                {stats?.crisisCount || 0}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {stats?.crisisCount
                  ? 'Considera buscar apoyo profesional'
                  : 'Sin alertas de crisis'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Emotion Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución de emociones</CardTitle>
            <CardDescription>
              Frecuencia de cada emoción detectada
            </CardDescription>
          </CardHeader>
          <CardContent>
            {emotionEntries.length > 0 ? (
              <div className="space-y-3">
                {emotionEntries.map(([emotion, count]) => {
                  const countNum = count as number;
                  const percentage = ((countNum / (stats?.totalMessages || 1)) * 100).toFixed(1);
                  return (
                    <div key={emotion}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">
                          {emotionTranslations[emotion] || emotion}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {countNum} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No hay datos de emociones aún. Empieza a conversar con Leo para generar tu análisis.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Mode Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Modos conversacionales</CardTitle>
            <CardDescription>
              Frecuencia de cada modo utilizado por Leo
            </CardDescription>
          </CardHeader>
          <CardContent>
            {Object.entries(stats?.modeDistribution || {}).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(stats?.modeDistribution || {}).map(([mode, count]) => {
                  const countNum = count as number;
                  const percentage = ((countNum / (stats?.totalMessages || 1)) * 100).toFixed(1);
                  return (
                    <div key={mode}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">
                          {modeTranslations[mode] || mode}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {countNum} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No hay datos de modos aún. Empieza a conversar con Leo para generar tu análisis.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Intensity Info */}
        <Card>
          <CardHeader>
            <CardTitle>Intensidad emocional promedio</CardTitle>
            <CardDescription>
              Nivel promedio de intensidad de tus emociones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="w-full bg-secondary rounded-full h-4">
                  <div
                    className={`h-4 rounded-full transition-all ${
                      (stats?.avgIntensity || 0) > 0.7
                        ? 'bg-red-500'
                        : (stats?.avgIntensity || 0) > 0.4
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${((stats?.avgIntensity || 0) * 100).toFixed(0)}%` }}
                  />
                </div>
              </div>
              <span className="text-2xl font-bold">
                {((stats?.avgIntensity || 0) * 100).toFixed(0)}%
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {(stats?.avgIntensity || 0) > 0.7
                ? 'Alta intensidad - Considera buscar apoyo adicional'
                : (stats?.avgIntensity || 0) > 0.4
                ? 'Intensidad moderada - Estás manejando tus emociones'
                : 'Baja intensidad - Estás en un buen estado emocional'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
