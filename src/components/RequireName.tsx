'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getName } from '../lib/store';

/**
 * Client-side gate for pages that belong to the entered flow (/papers,
 * /paper/[id]). The site is a static export, so the check happens on the
 * device after mount: no stored name -> replace with /start (carrying the
 * intended page as ?next= so Enter can return the student to it).
 * Until the check resolves we render only a brief notice, never content.
 */
export default function RequireName({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (getName().trim()) {
      setOk(true);
    } else {
      const next =
        pathname && pathname !== '/start/'
          ? `?next=${encodeURIComponent(pathname)}`
          : '';
      router.replace(`/start/${next}`);
    }
  }, [router, pathname]);

  if (!ok) {
    return (
      <div className="flex min-h-[38vh] items-center justify-center px-4 py-16" role="status">
        <p className="text-sm text-inksoft">One moment — taking you to the start page…</p>
      </div>
    );
  }
  return <>{children}</>;
}
