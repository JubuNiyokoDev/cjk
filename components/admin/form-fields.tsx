'use client';

import Image from 'next/image';
import { useEffect, useId, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

/** Erreurs DRF pour un champ donné (issues de AdminApiError.fieldErrors). */
export function FieldErrors({ errors }: { errors?: string[] }) {
  if (!errors || errors.length === 0) return null;
  return (
    <ul className="mt-1 space-y-0.5">
      {errors.map((error) => (
        <li key={error} className="text-sm text-red-600">
          {error}
        </li>
      ))}
    </ul>
  );
}

type FormFieldProps = {
  label: string;
  htmlFor?: string;
  required?: boolean;
  errors?: string[];
  children: ReactNode;
};

/** Label + contenu + erreurs de champ : structure commune des formulaires admin. */
export function FormField({ label, htmlFor, required, errors, children }: FormFieldProps) {
  return (
    <div>
      <Label htmlFor={htmlFor} className="mb-1.5 block">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      {children}
      <FieldErrors errors={errors} />
    </div>
  );
}

type ImageFieldProps = {
  label?: string;
  /** URL de l'image déjà enregistrée (mode édition). */
  existingUrl?: string | null;
  /**
   * `File` = nouveau fichier, `null` = suppression demandée,
   * `undefined` = inchangé (sémantique de toFormData dans lib/admin-api).
   */
  value: File | null | undefined;
  onChange: (value: File | null | undefined) => void;
  errors?: string[];
};

/** Sélecteur d'image avec aperçu, remplacement et suppression explicite. */
export function ImageField({ label = 'Image', existingUrl, value, onChange, errors }: ImageFieldProps) {
  const inputId = useId();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!(value instanceof File)) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(value);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  // null = suppression demandée → on n'affiche plus l'image existante.
  const displayedUrl = useMemo(() => {
    if (previewUrl) return previewUrl;
    if (value === null) return null;
    return existingUrl ?? null;
  }, [previewUrl, value, existingUrl]);

  return (
    <div>
      <Label htmlFor={inputId} className="mb-1.5 block">
        {label}
      </Label>

      {displayedUrl ? (
        <div className="relative w-full h-44 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
          <Image src={displayedUrl} alt="Aperçu de l'image" fill className="object-cover" sizes="400px" />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 bg-red-600 hover:bg-red-700"
            onClick={() => onChange(value instanceof File ? undefined : null)}
            aria-label="Retirer l'image"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          className="flex flex-col items-center justify-center gap-2 w-full h-32 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 cursor-pointer hover:border-orange-400 hover:text-orange-600 transition-colors"
        >
          <ImagePlus className="w-6 h-6" />
          <span className="text-sm">Choisir une image</span>
        </label>
      )}

      <input
        id={inputId}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onChange(file);
          event.target.value = '';
        }}
      />
      <FieldErrors errors={errors} />
    </div>
  );
}
