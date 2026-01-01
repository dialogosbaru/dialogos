import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { memoryService } from '@/lib/memoryService';
import type { PersonalInfo, Conversation, UserMemory } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Brain, MessageSquare, User, Trash2 } from 'lucide-react';
import { useLocation } from 'wouter';

export default function Profile() {
  const { user, signOut } = useAuth();
  const [, setLocation] = useLocation();
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [memories, setMemories] = useState<UserMemory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLocation('/');
      return;
    }

    loadProfileData();
  }, [user]);

  const loadProfileData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [info, convos, mems] = await Promise.all([
        memoryService.getPersonalInfo(user.id),
        memoryService.getConversations(user.id),
        memoryService.getMemories(user.id),
      ]);

      setPersonalInfo(info);
      setConversations(convos);
      setMemories(mems);
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInfo = async (infoId: string) => {
    // TODO: Implement delete functionality
    console.log('Delete info:', infoId);
  };

  const handleSignOut = async () => {
    await signOut();
    setLocation('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation('/chat')}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Mi Perfil</h1>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            Cerrar Sesión
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* User Info Card */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle>{user?.email}</CardTitle>
                <CardDescription>
                  Miembro desde {new Date(user?.created_at || '').toLocaleDateString('es-ES', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal">
              <User className="h-4 w-4 mr-2" />
              Información Personal
            </TabsTrigger>
            <TabsTrigger value="memories">
              <Brain className="h-4 w-4 mr-2" />
              Memoria
            </TabsTrigger>
            <TabsTrigger value="conversations">
              <MessageSquare className="h-4 w-4 mr-2" />
              Conversaciones
            </TabsTrigger>
          </TabsList>

          {/* Personal Info Tab */}
          <TabsContent value="personal" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Lo que Leo sabe sobre ti</CardTitle>
                <CardDescription>
                  Información extraída de tus conversaciones
                </CardDescription>
              </CardHeader>
              <CardContent>
                {personalInfo.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Aún no hay información guardada. Comienza a conversar con Leo para que te conozca mejor.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {personalInfo.map((info) => (
                      <div
                        key={info.id}
                        className="flex items-start justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="capitalize">
                              {info.info_type}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              Confianza: {Math.round(info.confidence * 100)}%
                            </span>
                          </div>
                          <p className="font-medium">{info.key}</p>
                          <p className="text-sm text-muted-foreground">{info.value}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteInfo(info.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Memories Tab */}
          <TabsContent value="memories" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Memoria de Leo</CardTitle>
                <CardDescription>
                  Recuerdos de conversaciones anteriores
                </CardDescription>
              </CardHeader>
              <CardContent>
                {memories.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No hay memoria guardada aún.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {memories.map((memory) => (
                      <div
                        key={memory.id}
                        className="p-4 rounded-lg border border-border"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={memory.memory_type === 'long_term' ? 'default' : 'secondary'}>
                            {memory.memory_type === 'long_term' ? 'Largo plazo' : 'Corto plazo'}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Importancia: {memory.importance}/10
                          </span>
                        </div>
                        <p className="font-medium">{memory.key}</p>
                        <p className="text-sm text-muted-foreground">{memory.value}</p>
                        {memory.context && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Contexto: {memory.context}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Conversations Tab */}
          <TabsContent value="conversations" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Historial de Conversaciones</CardTitle>
                <CardDescription>
                  Todas tus conversaciones con Leo
                </CardDescription>
              </CardHeader>
              <CardContent>
                {conversations.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No hay conversaciones aún.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {conversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className="p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer"
                      >
                        <p className="font-medium">
                          {conversation.title || 'Conversación sin título'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(conversation.created_at).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
