import { Bell } from 'lucide-react';
import Card from '../components/ui/Card';
import Alert from '../components/ui/Alert';

export default function AlertsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Alertes</h1>
        <p className="text-slate-500">Renouvellements, échéances et doublons détectés</p>
      </div>

      <Alert variant="info">
        Les alertes automatiques (renouvellement 30 jours avant, détection de doublons) seront
        disponibles dans une prochaine version.
      </Alert>

      <Card>
        <div className="flex flex-col items-center py-12 text-center">
          <div className="mb-4 rounded-full bg-slate-100 p-4">
            <Bell className="h-8 w-8 text-slate-400" />
          </div>
          <p className="font-medium text-slate-700">Aucune alerte pour le moment</p>
          <p className="mt-1 max-w-sm text-sm text-slate-500">
            Ajoutez vos contrats et leurs dates de renouvellement pour recevoir des rappels.
          </p>
        </div>
      </Card>
    </div>
  );
}
