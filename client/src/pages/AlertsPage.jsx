import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Check } from 'lucide-react';
import { alertsService } from '../services/alerts.service';
import { formatDate } from '../utils/format';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import Alert from '../components/ui/Alert';

const typeConfig = {
  RENEWAL: { label: 'Renouvellement', variant: 'warning' },
  DEADLINE: { label: 'Échéance', variant: 'danger' },
  DUPLICATE: { label: 'Doublon', variant: 'primary' },
};

export default function AlertsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['alerts'],
    queryFn: alertsService.getAll,
  });

  const markReadMutation = useMutation({
    mutationFn: alertsService.markAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alerts'] }),
  });

  const alerts = data?.data ?? [];
  const unread = alerts.filter((a) => !a.isRead).length;

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Alertes</h1>
          <p className="text-slate-500">
            {unread > 0 ? `${unread} non lue(s)` : 'Tout est à jour'}
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="error">
          {error.response?.data?.message || error.message}
        </Alert>
      )}

      {alerts.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center py-12 text-center">
            <div className="mb-4 rounded-full bg-slate-100 p-4">
              <Bell className="h-8 w-8 text-slate-400" />
            </div>
            <p className="font-medium text-slate-700">Aucune alerte pour le moment</p>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              Les alertes de renouvellement et de doublons apparaîtront automatiquement.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => {
            const config = typeConfig[alert.type] ?? typeConfig.DEADLINE;
            return (
              <Card key={alert.id} className={`!p-0 ${alert.isRead ? 'opacity-70' : ''}`}>
                <div className="flex items-start justify-between gap-4 p-5">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={config.variant}>{config.label}</Badge>
                      {!alert.isRead && (
                        <span className="h-2 w-2 rounded-full bg-blue-500" />
                      )}
                    </div>
                    <p className="text-sm text-slate-800">{alert.message}</p>
                    {alert.dueDate && (
                      <p className="text-xs text-slate-400">
                        Échéance : {formatDate(alert.dueDate)}
                      </p>
                    )}
                  </div>
                  {!alert.isRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markReadMutation.mutate(alert.id)}
                      loading={markReadMutation.isPending}
                    >
                      <Check className="h-4 w-4" />
                      Lu
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
