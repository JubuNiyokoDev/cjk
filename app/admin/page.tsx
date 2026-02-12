/* eslint-disable react/no-unescaped-entities */
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthSession } from '@/hooks/use-auth-session';

export default function AdminPage() {
    const router = useRouter();
    const { isAuthenticated, isOfficialMember, isLoading } = useAuthSession();

    useEffect(() => {
        if (isLoading) return;
        if (!isAuthenticated) {
            router.push('/auth/login');
            return;
        }
        if (!isOfficialMember) {
            router.replace('/unauthorized');
            return;
        }
        router.replace('/admin/gallery');
    }, [router, isAuthenticated, isOfficialMember, isLoading]);

    return null;
}

