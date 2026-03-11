'use client';

import Link from 'next/link';
import { useAuthSession } from '@/hooks/use-auth-session';

type ContentCtaButtonProps = {
  loginLabel: string;
  createLabel: string;
  createHref: string;
  loginHref?: string;
  unauthorizedLabel?: string;
  className?: string;
};

export default function ContentCtaButton({
  loginLabel,
  createLabel,
  createHref,
  loginHref = '/auth',
  unauthorizedLabel = 'Acces reserve',
  className = '',
}: ContentCtaButtonProps) {
  const { isAuthenticated, isOfficialMember, isLoading } = useAuthSession();

  if (isLoading) {
    return (
      <span className={`${className} opacity-60 cursor-default`}>
        Chargement...
      </span>
    );
  }

  if (!isAuthenticated) {
    return (
      <Link href={loginHref} className={className}>
        {loginLabel}
      </Link>
    );
  }

  if (isOfficialMember) {
    return (
      <Link href={createHref} className={className}>
        {createLabel}
      </Link>
    );
  }

  return (
    <span className={`${className} opacity-70 cursor-default`}>
      {unauthorizedLabel}
    </span>
  );
}
