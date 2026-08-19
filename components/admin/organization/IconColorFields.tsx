'use client';

import { FormField } from '@/components/admin/form-fields';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ORG_COLOR_OPTIONS, ORG_ICON_OPTIONS } from '@/lib/organization-api';
import { orgColor, orgIcon } from '@/lib/org-visuals';

type IconColorFieldsProps = {
  icon: string;
  color: string;
  onIconChange: (value: string) => void;
  onColorChange: (value: string) => void;
  errors?: Record<string, string[]>;
};

/**
 * Sélecteurs icône + couleur avec aperçu en direct, pour les valeurs
 * et distinctions (choix alignés sur organization.models côté Django).
 */
export default function IconColorFields({
  icon,
  color,
  onIconChange,
  onColorChange,
  errors,
}: IconColorFieldsProps) {
  const PreviewIcon = orgIcon(icon);

  return (
    <div className="flex items-start gap-4">
      <div
        className={`shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br ${orgColor(color)} flex items-center justify-center text-white shadow-md`}
        aria-hidden
      >
        <PreviewIcon className="w-7 h-7" />
      </div>

      <div className="grid grid-cols-2 gap-4 flex-1">
        <FormField label="Icône" errors={errors?.icon}>
          <Select value={icon} onValueChange={onIconChange}>
            <SelectTrigger>
              <SelectValue placeholder="Icône" />
            </SelectTrigger>
            <SelectContent>
              {ORG_ICON_OPTIONS.map((option) => {
                const OptionIcon = orgIcon(option.value);
                return (
                  <SelectItem key={option.value} value={option.value}>
                    <span className="flex items-center gap-2">
                      <OptionIcon className="w-4 h-4 text-gray-500" />
                      {option.label}
                    </span>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="Couleur" errors={errors?.color}>
          <Select value={color} onValueChange={onColorChange}>
            <SelectTrigger>
              <SelectValue placeholder="Couleur" />
            </SelectTrigger>
            <SelectContent>
              {ORG_COLOR_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <span className="flex items-center gap-2">
                    <span
                      className={`w-4 h-4 rounded-full bg-gradient-to-br ${orgColor(option.value)}`}
                    />
                    {option.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </div>
    </div>
  );
}
