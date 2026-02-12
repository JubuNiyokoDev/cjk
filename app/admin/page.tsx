/* eslint-disable react/no-unescaped-entities */
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/admin/gallery');
    }, [router]);

    return null;
}

