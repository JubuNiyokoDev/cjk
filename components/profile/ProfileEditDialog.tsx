'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, Lock, Save, Upload, User } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { AdminApiError } from '@/lib/admin-api';
import { changeMyPassword, updateMyProfile } from '@/lib/profile-api';
import type { Member } from '@/lib/types';

type ProfileEditDialogProps = {
  member: Member;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => Promise<void> | void;
};

type FeedbackState = { type: 'success' | 'error'; message: string } | null;

export default function ProfileEditDialog({ member, open, onOpenChange, onSaved }: ProfileEditDialogProps) {
  const [email, setEmail] = useState(member.email ?? '');
  const [firstName, setFirstName] = useState(member.first_name ?? '');
  const [lastName, setLastName] = useState(member.last_name ?? '');
  const [phone, setPhone] = useState(member.phone ?? '');
  const [quartier, setQuartier] = useState(member.quartier ?? '');
  const [dateNaissance, setDateNaissance] = useState(member.date_naissance ?? '');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  // Resynchronise le formulaire quand le dialog s'ouvre.
  useEffect(() => {
    if (!open) return;
    setEmail(member.email ?? '');
    setFirstName(member.first_name ?? '');
    setLastName(member.last_name ?? '');
    setPhone(member.phone ?? '');
    setQuartier(member.quartier ?? '');
    setDateNaissance(member.date_naissance ?? '');
    setPhotoFile(null);
    setPhotoPreview(null);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setFeedback(null);
  }, [open, member]);

  useEffect(() => {
    if (!photoFile) {
      setPhotoPreview(null);
      return;
    }
    const url = URL.createObjectURL(photoFile);
    setPhotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photoFile]);

  const handleProfileSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    setFeedback(null);
    try {
      await updateMyProfile({
        email,
        first_name: firstName,
        last_name: lastName,
        phone,
        quartier,
        ...(dateNaissance ? { date_naissance: dateNaissance } : {}),
        ...(photoFile ? { photo: photoFile } : {}),
      });
      await onSaved();
      setFeedback({ type: 'success', message: 'Profil mis à jour avec succès.' });
      setPhotoFile(null);
    } catch (error: unknown) {
      const message = error instanceof AdminApiError ? error.message : 'Impossible de mettre à jour le profil.';
      setFeedback({ type: 'error', message });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      setFeedback({ type: 'error', message: 'Les deux mots de passe ne correspondent pas.' });
      return;
    }
    setIsSaving(true);
    setFeedback(null);
    try {
      await changeMyPassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setFeedback({ type: 'success', message: 'Mot de passe modifié avec succès.' });
    } catch (error: unknown) {
      const message = error instanceof AdminApiError ? error.message : 'Impossible de changer le mot de passe.';
      setFeedback({ type: 'error', message });
    } finally {
      setIsSaving(false);
    }
  };

  const currentPhoto = photoPreview ?? member.photo;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier mon profil</DialogTitle>
          <DialogDescription>
            Mettez à jour vos informations personnelles ou votre mot de passe.
          </DialogDescription>
        </DialogHeader>

        {feedback && (
          <div
            className={`rounded-lg px-4 py-3 text-sm font-medium ${
              feedback.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
            role="status"
          >
            {feedback.message}
          </div>
        )}

        <Tabs defaultValue="infos" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="infos" className="gap-2">
              <User className="w-4 h-4" /> Informations
            </TabsTrigger>
            <TabsTrigger value="password" className="gap-2">
              <Lock className="w-4 h-4" /> Mot de passe
            </TabsTrigger>
          </TabsList>

          <TabsContent value="infos" className="mt-4">
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-slate-100 overflow-hidden flex items-center justify-center border border-slate-200">
                  {currentPhoto ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={currentPhoto} alt="Photo de profil" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-2xl font-light text-orange-500">
                      {(firstName || member.username).charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => setPhotoFile(event.target.files?.[0] ?? null)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4" /> Changer la photo
                  </Button>
                  {photoFile && (
                    <p className="text-xs text-slate-500 mt-1 truncate max-w-[200px]">{photoFile.name}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="profile-first-name">Prénom</Label>
                  <Input
                    id="profile-first-name"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    placeholder="Prénom"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="profile-last-name">Nom</Label>
                  <Input
                    id="profile-last-name"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    placeholder="Nom"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="profile-email">Email</Label>
                <Input
                  id="profile-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="email@exemple.com"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="profile-phone">Téléphone</Label>
                  <Input
                    id="profile-phone"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="+257 ..."
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="profile-quartier">Quartier</Label>
                  <Input
                    id="profile-quartier"
                    value={quartier}
                    onChange={(event) => setQuartier(event.target.value)}
                    placeholder="Kamenge"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="profile-birthdate">Date de naissance</Label>
                <Input
                  id="profile-birthdate"
                  type="date"
                  value={dateNaissance ?? ''}
                  onChange={(event) => setDateNaissance(event.target.value)}
                />
              </div>

              <Button
                type="submit"
                disabled={isSaving}
                className="w-full gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Enregistrer
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="password" className="mt-4">
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="profile-current-password">Mot de passe actuel</Label>
                <Input
                  id="profile-current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="profile-new-password">Nouveau mot de passe</Label>
                <Input
                  id="profile-new-password"
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  autoComplete="new-password"
                  required
                  minLength={8}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="profile-confirm-password">Confirmer le nouveau mot de passe</Label>
                <Input
                  id="profile-confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  autoComplete="new-password"
                  required
                  minLength={8}
                />
              </div>

              <Button
                type="submit"
                disabled={isSaving}
                className="w-full gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                Changer le mot de passe
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
