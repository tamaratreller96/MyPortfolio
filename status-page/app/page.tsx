'use client';
import useSWR from 'swr';
import { ComponentList } from '@/components/ComponentList';
import { IncidentsList } from '@/components/IncidentsList';
import { MaintenanceList } from '@/components/MaintenanceList';
import { StatusBadge } from '@/components/StatusBadge';
import clsx from 'clsx';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Home() {
  const { data: summary, error } = useSWR('/api/status/summary', fetcher, { refreshInterval: 60000 });

  const overall = summary?.overallStatus || 'loading';

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header / Overall Status */}
        <div className={clsx(
          "rounded-lg shadow-lg p-6 text-center text-white transition-colors duration-500",
          {
            'bg-green-600': overall === 'operational',
            'bg-yellow-500': overall === 'degraded',
            'bg-red-600': overall === 'major_outage' || overall === 'down',
            'bg-gray-400': overall === 'loading'
          }
        )}>
          <h1 className="text-3xl font-bold mb-2">System Status</h1>
          {overall === 'loading' ? (
            <div className="animate-pulse bg-white/20 h-8 w-32 mx-auto rounded"></div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <span className="text-xl font-medium uppercase tracking-wider">
                {overall.replace(/_/g, ' ')}
              </span>
              {summary?.lastSyncedAt && (
                <div className="text-xs opacity-75 absolute top-4 right-4 text-right" suppressHydrationWarning>
                  Last updated: <br />{new Date(summary.lastSyncedAt).toLocaleTimeString()}
                </div>
              )}
            </div>
          )}
        </div>

        <MaintenanceList />
        <ComponentList />
        <IncidentsList />

        <div className="text-center text-gray-400 text-xs mt-10">
          Powered by StatusSync &copy; {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}
