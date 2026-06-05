import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { claimsService } from '../services/claims.service';
import Card from '../components/ui/Card';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';

const INITIAL_MESSAGE = {
  role: 'assistant',
  content: 'Bonjour ! Je suis votre assistant sinistre AssurMe. Quel type de sinistre souhaitez-vous déclarer ? (auto, habitation, santé…)',
};

export default function ClaimAssistantPage() {
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input.trim() };
    const history = messages.map(({ role, content }) => ({ role, content }));

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError('');

    try {
      const res = await claimsService.chat(history, userMessage.content);
      setMessages((prev) => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur de communication avec l\'assistant');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Assistant sinistre</h1>
        <p className="text-slate-500">Déclaration guidée étape par étape</p>
      </div>

      {error && <Alert variant="error" onClose={() => setError('')}>{error}</Alert>}

      <Card className="!p-0 flex flex-col" style={{ minHeight: '480px' }}>
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-800'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2.5 text-sm text-slate-500">
                <Spinner size="sm" />
                L&apos;assistant réfléchit…
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSend} className="flex gap-2 border-t border-slate-100 p-4">
          <Input
            placeholder="Votre réponse…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1"
          />
          <Button type="submit" disabled={!input.trim() || loading}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </Card>

      <div className="flex items-center gap-2 text-xs text-slate-400">
        <MessageSquare className="h-4 w-4" />
        Assistant IA — configurez ANTHROPIC_API_KEY pour des réponses avancées
      </div>
    </div>
  );
}
