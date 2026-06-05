import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileText, Upload } from 'lucide-react';

export default function FileDropzone({ onFileSelect, disabled = false }) {
  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles[0]) onFileSelect(acceptedFiles[0]);
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    disabled,
  });

  return (
    <div
      {...getRootProps()}
      className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
        isDragActive
          ? 'border-blue-500 bg-blue-50'
          : 'border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/50'
      } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
    >
      <input {...getInputProps()} />
      <Upload className="mx-auto mb-3 h-10 w-10 text-slate-400" />
      {acceptedFiles[0] ? (
        <div className="flex items-center justify-center gap-2 text-sm text-slate-700">
          <FileText className="h-4 w-4" />
          {acceptedFiles[0].name}
        </div>
      ) : (
        <>
          <p className="text-sm font-medium text-slate-700">
            {isDragActive ? 'Déposez le PDF ici' : 'Glissez un PDF ou cliquez pour sélectionner'}
          </p>
          <p className="mt-1 text-xs text-slate-500">PDF uniquement, 10 Mo max</p>
        </>
      )}
    </div>
  );
}
