import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/contexts/AuthContext';
import { Petition, Message } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

export default function WriterAdvancedChat() {
  const { profile } = useAuth();
  const [petitions, setPetitions] = useState<Petition[]>([]);
  const [selectedPetition, setSelectedPetition] = useState<Petition | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch petições do redator autenticado
  useEffect(() => {
    if (!profile?.id) return;
    const fetchPetitions = async () => {
      const { data, error } = await supabase
        .from('peticoes')
        .select('*')
        .eq('writer_id', profile.id);

      if (!error && data) setPetitions(data as Petition[]);
    };

    fetchPetitions();
  }, [profile?.id]);

  // Fetch mensagens da petição selecionada
  useEffect(() => {
    if (!selectedPetition) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('mensagens')
        .select('*')
        .eq('petition_id', selectedPetition.id)
        .order('timestamp', { ascending: true });

      if (!error && data) setMessages(data as Message[]);
    };

    fetchMessages();
  }, [selectedPetition]);

  // Enviar nova mensagem
  const handleSend = async () => {
  if (!newMessage.trim() || !selectedPetition) return;

  try {
    const payload = {
      conversation_id: selectedPetition.id, // ⚠️ use o campo certo que liga à petição/conversa
      sender_id: profile.id,
      sender_name: profile.name || 'Redator',
      sender_type: 'writer',
      content: newMessage.trim(),
      status: 'sent',
      attachments: null, // se quiser mandar arquivos, depois trocamos
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('app_d379dcb283_messages')
      .insert(payload);

    if (error) {
      console.error('❌ Erro ao inserir mensagem:', error);
      return;
    }

    setNewMessage('');

    // recarregar mensagens da conversa
    const { data: refreshed, error: fetchErr } = await supabase
      .from('app_d379dcb283_messages')
      .select('*')
      .eq('conversation_id', selectedPetition.id)
      .order('created_at', { ascending: true });

    if (fetchErr) {
      console.error('❌ Erro ao buscar mensagens:', fetchErr);
      return;
    }

    setMessages((refreshed || []) as Message[]);
  } catch (e) {
    console.error('❌ Exceção no handleSend:', e);
  }
};

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex h-[calc(100vh-120px)] gap-6">
      {/* Lista de petições */}
      <Card className="w-1/3">
        <CardHeader>
          <CardTitle>Petições</CardTitle>
        </CardHeader>
        <CardContent>
          {petitions.map((p) => (
            <div
              key={p.id}
              onClick={() => setSelectedPetition(p)}
              className={`cursor-pointer p-2 rounded ${selectedPetition?.id === p.id ? 'bg-blue-50' : 'hover:bg-gray-100'}`}
            >
              <div className="font-medium">{p.title}</div>
              <div className="text-xs text-gray-500">{new Date(p.deadline).toLocaleDateString()}</div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Área de mensagens */}
      <Card className="flex-1 flex flex-col">
        {selectedPetition ? (
          <>
            <CardHeader>
              <CardTitle>Chat - {selectedPetition.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`mb-4 ${msg.sender_type === 'writer' ? 'text-right' : 'text-left'}`}>
                  <div
                    className={`inline-block px-4 py-2 rounded-lg max-w-sm ${
                      msg.sender_type === 'writer' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {msg.content}
                    <div className="text-xs mt-1 opacity-70">
                      {new Date(msg.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </CardContent>

            <div className="border-t p-4 flex items-center gap-2">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="flex-1 min-h-[40px]"
                onKeyDown={async (e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    await handleSend();
                  }
                }}
              />
              <Button onClick={handleSend} disabled={!selectedPetition || !newMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Selecione uma petição para iniciar o chat
          </div>
        )}
      </Card>
    </div>
  );
}
