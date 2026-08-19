'use client';

import { Hash, Link2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/admin/form-fields';

/** Même découpage que core/hashtags.py côté API (espaces, virgules, point-virgules). */
export function parseHashtagsPreview(raw: string): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  raw
    .split(/[\s,;]+/)
    .map((tag) => tag.replace(/^#+/, '').trim())
    .filter(Boolean)
    .forEach((tag) => {
      const lower = tag.toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        result.push(tag);
      }
    });
  return result;
}

type ProPostFieldsProps = {
  hashtags: string;
  onHashtagsChange: (value: string) => void;
  externalLink: string;
  onExternalLinkChange: (value: string) => void;
  hashtagsErrors?: string[];
  externalLinkErrors?: string[];
};

/**
 * Champs « post pro » communs aux trois formulaires (blog, actualités,
 * activités) : hashtags avec aperçu en direct + lien externe (LinkedIn…).
 */
export default function ProPostFields({
  hashtags,
  onHashtagsChange,
  externalLink,
  onExternalLinkChange,
  hashtagsErrors,
  externalLinkErrors,
}: ProPostFieldsProps) {
  const preview = parseHashtagsPreview(hashtags);

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <FormField label="Hashtags" htmlFor="pro-hashtags" errors={hashtagsErrors}>
        <div className="relative">
          <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            id="pro-hashtags"
            value={hashtags}
            onChange={(event) => onHashtagsChange(event.target.value)}
            placeholder="#paix #jeunesse #kamenge"
            className="pl-9"
          />
        </div>
        {preview.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {preview.map((tag) => (
              <Badge
                key={tag.toLowerCase()}
                variant="secondary"
                className="bg-orange-50 text-orange-700 hover:bg-orange-50 font-normal"
              >
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </FormField>

      <FormField
        label="Lien externe (LinkedIn…)"
        htmlFor="pro-external-link"
        errors={externalLinkErrors}
      >
        <div className="relative">
          <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            id="pro-external-link"
            type="url"
            value={externalLink}
            onChange={(event) => onExternalLinkChange(event.target.value)}
            placeholder="https://www.linkedin.com/posts/…"
            className="pl-9"
          />
        </div>
      </FormField>
    </div>
  );
}
