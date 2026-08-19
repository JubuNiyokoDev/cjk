'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ImagePlus,
  Loader2,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { AdminApiError, type ContentKind } from '@/lib/admin-api';
import {
  MAX_IMAGES_PER_POST,
  MAX_IMAGES_PER_UPLOAD,
  MAX_IMAGE_SIZE_MB,
  deleteContentImage,
  reorderImages,
  updateImageCaption,
  validateFiles,
  type UploadProgress,
} from '@/lib/upload';
import type { ContentImage } from '@/lib/types';

/** Fichier sélectionné, pas encore envoyé. */
export type PendingImage = {
  key: string;
  file: File;
  caption: string;
  previewUrl: string;
};

let pendingKeySeq = 0;

/** Construit les PendingImage (avec URL d'aperçu) à partir de fichiers. */
export function toPendingImages(files: File[]): PendingImage[] {
  return files.map((file) => ({
    key: `pending-${++pendingKeySeq}`,
    file,
    caption: '',
    previewUrl: URL.createObjectURL(file),
  }));
}

export function releasePendingImages(pending: PendingImage[]) {
  pending.forEach((item) => URL.revokeObjectURL(item.previewUrl));
}

function formatMb(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

type GalleryManagerProps = {
  kind: ContentKind;
  /** `null` en création : la galerie existante n'est pas gérable avant le 1er enregistrement. */
  contentId: number | null;
  images: ContentImage[];
  onImagesChange: (images: ContentImage[]) => void;
  pending: PendingImage[];
  onPendingChange: (pending: PendingImage[]) => void;
  /** Progression d'envoi en cours (pilotée par le parent au submit), sinon null. */
  uploadProgress: UploadProgress | null;
  disabled?: boolean;
};

/**
 * Galerie multi-images du back-office : sélection par lot avec aperçus et
 * légendes, barre de progression réelle à l'envoi, puis gestion des images
 * en ligne (légende, réordonnancement, suppression).
 */
export default function GalleryManager({
  kind,
  contentId,
  images,
  onImagesChange,
  pending,
  onPendingChange,
  uploadProgress,
  disabled = false,
}: GalleryManagerProps) {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busyImageId, setBusyImageId] = useState<number | null>(null);
  const [captionDrafts, setCaptionDrafts] = useState<Record<number, string>>({});

  // Synchronise les brouillons de légende quand la galerie change (ouverture, upload...).
  useEffect(() => {
    setCaptionDrafts(
      Object.fromEntries(images.map((image) => [image.id, image.caption]))
    );
  }, [images]);

  const showError = useCallback(
    (error: unknown, fallback: string) => {
      const message = error instanceof AdminApiError ? error.message : fallback;
      toast({ title: 'Erreur', description: message, variant: 'destructive' });
    },
    [toast]
  );

  const handleFilesSelected = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    const error = validateFiles(files, images.length + pending.length);
    if (error) {
      toast({ title: 'Images refusées', description: error, variant: 'destructive' });
      return;
    }
    onPendingChange([...pending, ...toPendingImages(files)]);
  };

  const removePending = (key: string) => {
    const target = pending.find((item) => item.key === key);
    if (target) URL.revokeObjectURL(target.previewUrl);
    onPendingChange(pending.filter((item) => item.key !== key));
  };

  const setPendingCaption = (key: string, caption: string) => {
    onPendingChange(
      pending.map((item) => (item.key === key ? { ...item, caption } : item))
    );
  };

  const saveCaption = async (image: ContentImage) => {
    const draft = captionDrafts[image.id] ?? '';
    if (contentId === null || draft === image.caption) return;
    setBusyImageId(image.id);
    try {
      const updated = await updateImageCaption(kind, contentId, image.id, draft);
      onImagesChange(images.map((item) => (item.id === image.id ? updated : item)));
    } catch (error) {
      showError(error, 'Impossible de modifier la légende.');
    } finally {
      setBusyImageId(null);
    }
  };

  const removeImage = async (image: ContentImage) => {
    if (contentId === null) return;
    setBusyImageId(image.id);
    try {
      await deleteContentImage(kind, contentId, image.id);
      onImagesChange(images.filter((item) => item.id !== image.id));
      toast({ title: 'Image supprimée' });
    } catch (error) {
      showError(error, "Impossible de supprimer l'image.");
    } finally {
      setBusyImageId(null);
    }
  };

  const moveImage = async (index: number, direction: -1 | 1) => {
    if (contentId === null) return;
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    const reordered = [...images];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    onImagesChange(reordered); // optimiste
    try {
      onImagesChange(
        await reorderImages(kind, contentId, reordered.map((item) => item.id))
      );
    } catch (error) {
      onImagesChange(images); // rollback
      showError(error, "Impossible de réordonner la galerie.");
    }
  };

  const isUploading = uploadProgress !== null;
  const totalCount = images.length + pending.length;

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <Label className="block">Galerie photos</Label>
        <span className="text-xs text-gray-400">
          {totalCount}/{MAX_IMAGES_PER_POST} — {MAX_IMAGE_SIZE_MB} Mo max/image
        </span>
      </div>

      {/* Images déjà en ligne (mode édition) */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="rounded-xl border border-gray-200 overflow-hidden bg-white"
            >
              <div className="relative aspect-video bg-gray-100">
                <Image
                  src={image.image}
                  alt={image.caption || `Image ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="200px"
                />
                <span className="absolute top-1.5 left-1.5 rounded-full bg-black/60 text-white text-[11px] px-2 py-0.5">
                  {index + 1}
                </span>
                <div className="absolute top-1 right-1 flex gap-1">
                  <Button
                    type="button"
                    size="icon"
                    variant="secondary"
                    className="h-7 w-7 bg-white/85 hover:bg-white"
                    disabled={disabled || index === 0 || busyImageId !== null}
                    onClick={() => moveImage(index, -1)}
                    aria-label="Déplacer vers la gauche"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="secondary"
                    className="h-7 w-7 bg-white/85 hover:bg-white"
                    disabled={disabled || index === images.length - 1 || busyImageId !== null}
                    onClick={() => moveImage(index, 1)}
                    aria-label="Déplacer vers la droite"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="h-7 w-7 bg-red-600/90 hover:bg-red-700"
                    disabled={disabled || busyImageId !== null}
                    onClick={() => removeImage(image)}
                    aria-label="Supprimer l'image"
                  >
                    {busyImageId === image.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </Button>
                </div>
              </div>
              <Input
                value={captionDrafts[image.id] ?? ''}
                onChange={(event) =>
                  setCaptionDrafts((current) => ({
                    ...current,
                    [image.id]: event.target.value,
                  }))
                }
                onBlur={() => saveCaption(image)}
                placeholder="Légende…"
                disabled={disabled || busyImageId !== null}
                className="border-0 rounded-none text-xs h-8 focus-visible:ring-1"
              />
            </div>
          ))}
        </div>
      )}

      {/* Fichiers sélectionnés, en attente d'envoi */}
      {pending.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
          {pending.map((item) => (
            <div
              key={item.key}
              className="rounded-xl border-2 border-dashed border-orange-300 overflow-hidden bg-orange-50/40"
            >
              <div className="relative aspect-video bg-gray-100">
                <Image
                  src={item.previewUrl}
                  alt={item.file.name}
                  fill
                  className="object-cover"
                  sizes="200px"
                />
                <span className="absolute bottom-1.5 left-1.5 rounded-full bg-orange-500 text-white text-[11px] px-2 py-0.5">
                  {formatMb(item.file.size)}
                </span>
                {!isUploading && (
                  <Button
                    type="button"
                    size="icon"
                    variant="secondary"
                    className="absolute top-1 right-1 h-7 w-7 bg-white/85 hover:bg-white"
                    disabled={disabled}
                    onClick={() => removePending(item.key)}
                    aria-label="Retirer ce fichier"
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
              <Input
                value={item.caption}
                onChange={(event) => setPendingCaption(item.key, event.target.value)}
                placeholder="Légende…"
                disabled={disabled || isUploading}
                className="border-0 rounded-none text-xs h-8 bg-transparent focus-visible:ring-1"
              />
            </div>
          ))}
        </div>
      )}

      {/* Barre de progression réelle de l'envoi */}
      {isUploading && uploadProgress && (
        <div className="mb-3 rounded-xl border border-orange-200 bg-orange-50 p-3">
          <div className="flex items-center gap-2 text-sm text-orange-700 mb-2">
            <UploadCloud className="w-4 h-4 animate-pulse" />
            <span className="font-medium">
              Envoi de {pending.length} image{pending.length > 1 ? 's' : ''}…{' '}
              {uploadProgress.percent}%
            </span>
            {uploadProgress.total > 0 && (
              <span className="ml-auto text-xs text-orange-600">
                {formatMb(uploadProgress.loaded)} / {formatMb(uploadProgress.total)}
              </span>
            )}
          </div>
          <Progress
            value={uploadProgress.percent}
            className="h-2 bg-orange-100 [&>div]:bg-gradient-to-r [&>div]:from-orange-500 [&>div]:to-red-500"
          />
        </div>
      )}

      {/* Zone de sélection */}
      {!isUploading && totalCount < MAX_IMAGES_PER_POST && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-1.5 w-full h-24 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 hover:border-orange-400 hover:text-orange-600 transition-colors disabled:opacity-50"
        >
          <ImagePlus className="w-5 h-5" />
          <span className="text-sm">
            Ajouter des photos ({MAX_IMAGES_PER_UPLOAD} max par envoi)
          </span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="sr-only"
        onChange={(event) => {
          handleFilesSelected(event.target.files);
          event.target.value = '';
        }}
      />

      {contentId === null && pending.length > 0 && (
        <p className="mt-2 text-xs text-gray-500">
          Les photos seront envoyées après la création de la publication.
        </p>
      )}
    </div>
  );
}
