import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ExternalLink, Trash2 } from 'lucide-react';
import { contractsService } from '../services/contracts.service';
import { getContractTypeLabel } from '../constants/contractTypes';
import { formatDate, formatCurrency } from '../utils/format';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import Alert from '../components/ui/Alert';
import FileDropzone from '../components/ui/FileDropzone';

export default function ContractDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['contract', id],
    queryFn: () => contractsService.getById(id),
  });

  const contract = data?.data;

  const uploadMutation = useMutation({
    mutationFn: (file) => contractsService.uploadPdf(id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contract', id] });
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      setUploadSuccess('PDF uploadé avec succès');
      setUploadError('');
    },
    onError: (err) => {
      setUploadError(err.response?.data?.message || 'Erreur lors de l\'upload');
      setUploadSuccess('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => contractsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      navigate('/contracts');
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="space-y-4">
        <Link to="/contracts" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline">
          <ArrowLeft className="h-4 w-4" />
          Retour aux contrats
        </Link>
        <Alert variant="error">
          {error?.response?.data?.message || 'Contrat introuvable'}
        </Alert>
      </div>
    );
  }

  const coverages = contract.Coverages ?? contract.coverages ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/contracts" className="mb-2 inline-flex items-center gap-1 text-sm text-blue-600 hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Retour aux contrats
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">{contract.name}</h1>
            <Badge variant="primary">{getContractTypeLabel(contract.type)}</Badge>
          </div>
          <p className="text-slate-500">{contract.insurer || 'Assureur non renseigné'}</p>
        </div>
        <Button
          variant="danger"
          onClick={() => {
            if (window.confirm('Supprimer ce contrat ?')) deleteMutation.mutate();
          }}
          loading={deleteMutation.isPending}
        >
          <Trash2 className="h-4 w-4" />
          Supprimer
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Informations">
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">N° de police</dt>
              <dd className="font-medium">{contract.policyNumber || '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Début</dt>
              <dd>{formatDate(contract.startDate)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Fin</dt>
              <dd>{formatDate(contract.endDate)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Renouvellement</dt>
              <dd>{formatDate(contract.renewalDate)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Prime annuelle</dt>
              <dd className="font-medium">{formatCurrency(contract.premium)}</dd>
            </div>
            {contract.fileUrl && (
              <div className="flex justify-between">
                <dt className="text-slate-500">Document</dt>
                <dd>
                  <a
                    href={contract.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                  >
                    Voir le PDF
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </Card>

        <Card title="Importer un PDF">
          {uploadSuccess && <Alert variant="success" className="mb-4" onClose={() => setUploadSuccess('')}>{uploadSuccess}</Alert>}
          {uploadError && <Alert variant="error" className="mb-4" onClose={() => setUploadError('')}>{uploadError}</Alert>}
          <FileDropzone
            disabled={uploadMutation.isPending}
            onFileSelect={(file) => uploadMutation.mutate(file)}
          />
          {uploadMutation.isPending && (
            <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
              <Spinner size="sm" />
              Upload en cours…
            </div>
          )}
          <p className="mt-3 text-xs text-slate-400">
            L&apos;extraction automatique des garanties par IA s&apos;active avec une clé ANTHROPIC_API_KEY valide.
          </p>
        </Card>
      </div>

      <Card title={`Garanties (${coverages.length})`}>
        {coverages.length === 0 ? (
          <p className="text-sm text-slate-500">
            Aucune garantie extraite. Importez un PDF pour lancer l&apos;analyse IA.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-slate-500">
                  <th className="pb-2 font-medium">Garantie</th>
                  <th className="pb-2 font-medium">Détails</th>
                  <th className="pb-2 font-medium">Plafond</th>
                  <th className="pb-2 font-medium">Franchise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {coverages.map((c) => (
                  <tr key={c.id}>
                    <td className="py-2 font-medium text-slate-900">{c.name}</td>
                    <td className="py-2 text-slate-600">{c.details || '—'}</td>
                    <td className="py-2">{formatCurrency(c.limit)}</td>
                    <td className="py-2">{formatCurrency(c.deductible)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
