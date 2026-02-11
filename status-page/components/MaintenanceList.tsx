'use client';
import useSWR from 'swr';
import { StatusBadge } from './StatusBadge';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function MaintenanceList() {
    const { data: maintenance, error } = useSWR('/api/status/maintenance', fetcher, { refreshInterval: 60000 });

    if (error) return null;
    if (!maintenance || !Array.isArray(maintenance) || maintenance.length === 0) return null;

    return (
        <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200 mt-6">
            <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Scheduled Maintenance</h3>
            </div>
            <ul className="divide-y divide-gray-200">
                {maintenance.map((m: any) => (
                    <li key={m.id} className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-gray-900">{m.title}</h4>
                            <StatusBadge status={m.status} />
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                            Scheduled: {new Date(m.scheduledStart).toLocaleString()} - {new Date(m.scheduledEnd).toLocaleString()}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
