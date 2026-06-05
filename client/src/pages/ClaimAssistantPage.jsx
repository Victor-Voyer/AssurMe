import { useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import Card from '../components/ui/Card';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const STEPS = [
  'Bonjour ! Je suis votre assistant sinistre AssurMe. Quel type de sinistre souhaitez-vous déclarer ? (auto, habitation, santé…)',
  'Merci. Pouvez-vous décrire brièvement ce qui s\'est passé ?',
  'À quelle date le sinistre a-t-il eu lieu ?',
  'Avez-vous déjà contacté votre assureur ?',
];

export default function ClaimAssistantPage() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: STEPS[0] },
  ]);
  const [input, setInput] = useState('');
  const [step, setStep] = useState(1);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input.trim() };
    const nextStep = step < STEPS.length ? step + 1 : step;
    const assistantReply = step < STEPS.length
      ? { role: 'assistant', content: STEPS[step] }
      : { role: 'assistant', content: 'Merci pour ces informations. L\'assistant sinistre complet avec connexion à vos contrats sera bientôt disponible. En attendant, contactez directement votre assureur.' };

    setMessages((prev) => [...prev, userMessage, assistantReply]);
    setInput('');
    setStep(nextStep);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Assistant sinistre</h1>
        <p className="text-slate-500">Déclaration guidée étape par étape</p>
      </div>

      <Alert variant="info">
        Version démo — l&apos;assistant conversationnel connecté à l&apos;API sera implémenté en Phase 4.
      </Alert>

      <Card className="!p-0 flex flex-col" style={{ minHeight: '480px' }}>
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-800'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSend} className="flex gap-2 border-t border-slate-100 p-4">
          <Input
            placeholder="Votre réponse…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={!input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </Card>

      <div className="flex items-center gap-2 text-xs text-slate-400">
        <MessageSquare className="h-4 w-4" />
        Assistant guidé — non connecté à vos contrats pour le moment
      </div>
    </div>
  );
}
