import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { contractsService } from '../services/contracts.service';
import { CONTRACT_TYPES, getContractTypeLabel } from '../constants/contractTypes';
import { formatDate, formatCurrency } from '../utils/format';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';
import Alert from '../components/ui/Alert';

export default function ContractsPage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [formError, setFormError] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['contracts'],
    queryFn: contractsService.getAll,
  });

  const contracts = data?.data ?? [];

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { type: 'OTHER' },
  });

  const createMutation = useMutation({
    mutationFn: contractsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      setShowModal(false);
      reset();
      setFormError('');
    },
    onError: (err) => {
      setFormError(err.response?.data?.message || 'Erreur lors de la création');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: contractsService.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contracts'] }),
  });

  const onSubmit = (formData) => createMutation.mutate(formData);

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
          <h1 className="text-2xl font-bold text-slate-900">Mes contrats</h1>
          <p className="text-slate-500">{contracts.length} contrat(s) enregistré(s)</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4" />
          Nouveau contrat
        </Button>
      </div>

      {error && (
        <Alert variant="error">
          {error.response?.data?.message || error.message}
        </Alert>
      )}

      {contracts.length === 0 ? (
        <Card>
          <div className="py-8 text-center">
            <p className="text-slate-500">Aucun contrat pour le moment.</p>
            <Button className="mt-4" onClick={() => setShowModal(true)}>
              <Plus className="h-4 w-4" />
              Créer mon premier contrat
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {contracts.map((contract) => (
            <Card key={contract.id} className="!p-0">
              <div className="p-5">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <Link
                      to={`/contracts/${contract.id}`}
                      className="font-semibold text-slate-900 hover:text-blue-600"
                    >
                      {contract.name}
                    </Link>
                    <p className="text-sm text-slate-500">{contract.insurer || '—'}</p>
                  </div>
                  <Badge variant="primary">{getContractTypeLabel(contract.type)}</Badge>
                </div>
                <dl className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Prime</dt>
                    <dd className="font-medium">{formatCurrency(contract.premium)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Renouvellement</dt>
                    <dd>{formatDate(contract.renewalDate)}</dd>
                  </div>
                </dl>
                <div className="mt-4 flex gap-2">
                  <Link to={`/contracts/${contract.id}`} className="flex-1">
                    <Button variant="secondary" className="w-full" size="sm">
                      Voir le détail
                    </Button>
                  </Link>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      if (window.confirm('Supprimer ce contrat ?')) {
                        deleteMutation.mutate(contract.id);
                      }
                    }}
                    loading={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nouveau contrat">
        {formError && <Alert variant="error" className="mb-4">{formError}</Alert>}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nom du contrat"
            error={errors.name?.message}
            {...register('name', { required: 'Nom requis' })}
          />
          <div className="space-y-1">
            <label htmlFor="type" className="block text-sm font-medium text-slate-700">
              Type
            </label>
            <select
              id="type"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              {...register('type')}
            >
              {CONTRACT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <Input label="Assureur" {...register('insurer')} />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>
              Annuler
            </Button>
            <Button type="submit" loading={createMutation.isPending}>
              Créer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
