'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import LoadingBar from 'react-top-loading-bar';

export default function TopLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(30);
    const timeout = setTimeout(() => setProgress(100), 300);
    return () => clearTimeout(timeout);
  }, [pathname, searchParams]);

  return (
    <LoadingBar
      color="#f97316"
      progress={progress}
      onLoaderFinished={() => setProgress(0)}
      shadow={false}
      height={3}
    />
  );
}
