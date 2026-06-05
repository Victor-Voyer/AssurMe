import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

const config = {
  success: { icon: CheckCircle, classes: 'border-green-200 bg-green-50 text-green-800' },
  warning: { icon: AlertCircle, classes: 'border-amber-200 bg-amber-50 text-amber-800' },
  error: { icon: AlertCircle, classes: 'border-red-200 bg-red-50 text-red-800' },
  info: { icon: Info, classes: 'border-blue-200 bg-blue-50 text-blue-800' },
};

export default function Alert({ children, variant = 'info', onClose, className = '' }) {
  const { icon: Icon, classes } = config[variant];

  return (
    <div className={`flex items-start gap-3 rounded-lg border p-4 ${classes} ${className}`} role="alert">
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      <div className="flex-1 text-sm">{children}</div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded p-0.5 opacity-70 hover:opacity-100"
          aria-label="Fermer"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
