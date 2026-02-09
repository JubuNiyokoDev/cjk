'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Pencil, Save } from 'lucide-react';
import {
  createComment,
  deleteComment,
  getComments,
  isUnauthorized,
  updateComment,
  type SocialComment,
} from '@/lib/social';
import { formatDate } from '@/lib/content';

const emptyState = {
  title: 'Aucun commentaire',
  description: 'Soyez le premier à commenter cette publication.',
};

type CommentsPanelProps = {
  contentType: number | string;
  objectId: number;
  title?: string;
};

type Draft = {
  id: number;
  value: string;
};

export default function CommentsPanel({ contentType, objectId, title }: CommentsPanelProps) {
  const router = useRouter();
  const [comments, setComments] = useState<SocialComment[]>([]);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);

  const header = useMemo(() => title ?? 'Commentaires', [title]);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    const hasContentType =
      (typeof contentType === 'number' && contentType > 0) ||
      (typeof contentType === 'string' && contentType.trim().length > 0);

    if (!hasContentType) {
      setStatus(
        "Type de contenu manquant. Vérifiez que l'API renvoie content_type ou configurez NEXT_PUBLIC_BLOG_CONTENT_TYPE_ID."
      );
      setComments([]);
      setIsLoading(false);
      return () => {
        isMounted = false;
      };
    }
    getComments({ content_type: contentType, object_id: objectId })
      .then((data) => {
        if (isMounted) setComments(data);
      })
      .catch(() => {
        if (isMounted) setStatus('Impossible de charger les commentaires.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [contentType, objectId]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!message.trim()) return;
    setStatus(null);

    try {
      const newComment = await createComment({
        content_type: contentType,
        object_id: objectId,
        text: message.trim(),
      });
      setComments((prev) => [newComment, ...prev]);
      setMessage('');
    } catch (error) {
      if (isUnauthorized(error)) {
        router.push('/auth');
        return;
      }
      setStatus("Impossible d'envoyer le commentaire.");
    }
  };

  const startEdit = (comment: SocialComment) => {
    const value = comment.text ?? comment.content ?? '';
    setDraft({ id: comment.id, value });
  };

  const cancelEdit = () => {
    setDraft(null);
  };

  const handleUpdate = async (commentId: number) => {
    if (!draft || !draft.value.trim()) return;
    setStatus(null);

    try {
      const updated = await updateComment({ id: commentId, text: draft.value.trim() });
      setComments((prev) => prev.map((item) => (item.id === commentId ? updated : item)));
      setDraft(null);
    } catch (error) {
      if (isUnauthorized(error)) {
        router.push('/auth');
        return;
      }
      setStatus('Impossible de modifier le commentaire.');
    }
  };

  const handleDelete = async (commentId: number) => {
    setStatus(null);

    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((item) => item.id !== commentId));
    } catch (error) {
      if (isUnauthorized(error)) {
        router.push('/auth');
        return;
      }
      setStatus('Impossible de supprimer le commentaire.');
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{header}</h2>
        <span className="text-sm font-semibold text-gray-500">
          {comments.length} commentaire{comments.length > 1 ? 's' : ''}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 mb-6">
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={4}
          className="w-full rounded-2xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
          placeholder="Écrire un commentaire..."
        />
        <button
          type="submit"
          className="px-6 py-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
        >
          Publier
        </button>
      </form>

      {status && <p className="text-sm text-red-500 mb-4">{status}</p>}

      {isLoading ? (
        <p className="text-gray-500">Chargement...</p>
      ) : comments.length === 0 ? (
        <div className="bg-orange-50 rounded-2xl p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{emptyState.title}</h3>
          <p className="text-gray-600">{emptyState.description}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="border border-gray-100 rounded-2xl p-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div>
                  <p className="font-semibold text-gray-900">
                    {comment.author_name ?? 'Membre CJK'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(comment.created_at ?? undefined)}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <button
                    type="button"
                    onClick={() => startEdit(comment)}
                    className="inline-flex items-center gap-1 hover:text-orange-500"
                  >
                    <Pencil className="w-3 h-3" /> Modifier
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(comment.id)}
                    className="inline-flex items-center gap-1 hover:text-red-500"
                  >
                    <Trash2 className="w-3 h-3" /> Supprimer
                  </button>
                </div>
              </div>

              {draft?.id === comment.id ? (
                <div className="mt-3 space-y-2">
                  <textarea
                    value={draft.value}
                    onChange={(event) => setDraft({ id: comment.id, value: event.target.value })}
                    rows={3}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleUpdate(comment.id)}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-orange-600"
                    >
                      <Save className="w-4 h-4" /> Enregistrer
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="text-sm text-gray-500"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-gray-700 whitespace-pre-line">
                  {comment.text ?? comment.content ?? ''}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
