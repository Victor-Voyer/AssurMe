import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FileText, Bell, Euro, Calendar } from 'lucide-react';
import { contractsService } from '../services/contracts.service';
import { alertsService } from '../services/alerts.service';
import { getContractTypeLabel } from '../constants/contractTypes';
import { formatDate, formatCurrency } from '../utils/format';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import Alert from '../components/ui/Alert';

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['contracts'],
    queryFn: contractsService.getAll,
  });

  const { data: alertsData } = useQuery({
    queryKey: ['alerts'],
    queryFn: alertsService.getAll,
  });

  const contracts = data?.data ?? [];
  const alertCount = (alertsData?.data ?? []).filter((a) => !a.isRead).length;

  const totalPremium = contracts.reduce((sum, c) => sum + (c.premium || 0), 0);
  const withPdf = contracts.filter((c) => c.fileUrl).length;

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="error">
        Impossible de charger les données : {error.response?.data?.message || error.message}
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tableau de bord</h1>
        <p className="text-slate-500">Vue d&apos;ensemble de vos assurances</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="!p-0">
          <div className="flex items-center gap-4 p-5">
            <div className="rounded-lg bg-blue-100 p-3">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Contrats</p>
              <p className="text-2xl font-bold text-slate-900">{contracts.length}</p>
            </div>
          </div>
        </Card>
        <Card className="!p-0">
          <div className="flex items-center gap-4 p-5">
            <div className="rounded-lg bg-green-100 p-3">
              <Euro className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Primes annuelles</p>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalPremium)}</p>
            </div>
          </div>
        </Card>
        <Card className="!p-0">
          <div className="flex items-center gap-4 p-5">
            <div className="rounded-lg bg-amber-100 p-3">
              <Bell className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Alertes</p>
              <p className="text-2xl font-bold text-slate-900">{alertCount}</p>
            </div>
          </div>
        </Card>
        <Card className="!p-0">
          <div className="flex items-center gap-4 p-5">
            <div className="rounded-lg bg-purple-100 p-3">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">PDF importés</p>
              <p className="text-2xl font-bold text-slate-900">{withPdf}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card
        title="Contrats récents"
        action={
          <Link to="/contracts" className="text-sm font-medium text-blue-600 hover:underline">
            Voir tout
          </Link>
        }
      >
        {contracts.length === 0 ? (
          <p className="text-center text-sm text-slate-500 py-4">
            Aucun contrat pour le moment.{' '}
            <Link to="/contracts" className="text-blue-600 hover:underline">
              Ajouter un contrat
            </Link>
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {contracts.slice(0, 5).map((contract) => (
              <Link
                key={contract.id}
                to={`/contracts/${contract.id}`}
                className="flex items-center justify-between py-3 first:pt-0 last:pb-0 hover:text-blue-600"
              >
                <div>
                  <p className="font-medium text-slate-900">{contract.name}</p>
                  <p className="text-sm text-slate-500">
                    {contract.insurer || 'Assureur non renseigné'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="primary">{getContractTypeLabel(contract.type)}</Badge>
                  {contract.renewalDate && (
                    <span className="text-xs text-slate-400">
                      Renouv. {formatDate(contract.renewalDate)}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
