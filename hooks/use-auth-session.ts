'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Member } from '@/lib/types';
import { clearTokens, ensureValidAccessToken } from '@/lib/auth';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000').replace(/\/$/, '');

type AuthSession = {
  member: Member | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  refresh: () => Promise<void>;
  logout: () => void;
  isOfficialMember:boolean;
};

export function useAuthSession(): AuthSession {
  const [member, setMember] = useState<Member | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isOfficialMember, setIsOfficialMember] = useState(false);

  const loadSession = useCallback(async () => {
    setIsLoading(true);
    const access = await ensureValidAccessToken();
    if (!access) {
      setMember(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/members/me/`, {
        headers: { Authorization: `Bearer ${access}` },
      });

      if (!response.ok) {
        if (response.status === 401) {
          clearTokens();
        }
        setMember(null);
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      const data = (await response.json()) as Member;
      setMember(data);
      setIsAuthenticated(true);
      if(data.is_staff || data.is_superuser) {
        setIsOfficialMember(true);
      }
    } catch {
      setMember(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSession();
  }, [loadSession]);

  const logout = useCallback(() => {
    clearTokens();
    setMember(null);
    setIsAuthenticated(false);
  }, []);

  return { member, isAuthenticated, isLoading, refresh: loadSession, logout, isOfficialMember };
}
