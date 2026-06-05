import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Shield } from 'lucide-react';
import { useAuthStore } from '../store/auth.store';
import { authService } from '../services/auth.service';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Alert from '../components/ui/Alert';

export default function RegisterPage() {
  const { token } = useAuthStore();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  if (token) return <Navigate to="/" replace />;

  const onSubmit = async (data) => {
    setError('');
    setLoading(true);
    try {
      await authService.register(data);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <Shield className="mx-auto mb-3 h-12 w-12 text-blue-600" />
          <h1 className="text-2xl font-bold text-slate-900">Inscription</h1>
          <p className="mt-1 text-sm text-slate-500">Créez votre compte AssurMe</p>
        </div>

        {error && (
          <Alert variant="error" onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Prénom"
              error={errors.firstName?.message}
              {...register('firstName', { required: 'Prénom requis' })}
            />
            <Input
              label="Nom"
              error={errors.lastName?.message}
              {...register('lastName', { required: 'Nom requis' })}
            />
          </div>
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email', { required: 'Email requis' })}
          />
          <Input
            label="Mot de passe"
            type="password"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register('password', {
              required: 'Mot de passe requis',
              minLength: { value: 6, message: '6 caractères minimum' },
            })}
          />
          <Button type="submit" className="w-full" loading={loading}>
            Créer mon compte
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Déjà un compte ?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
