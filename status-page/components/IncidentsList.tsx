'use client';
import useSWR from 'swr';
import { StatusBadge } from './StatusBadge';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function IncidentsList() {
    const { data: incidents, error } = useSWR('/api/status/incidents', fetcher, { refreshInterval: 60000 });

    if (error) return <div className="text-red-500">Failed to load incidents</div>;
    if (!incidents) return null; // Don't show skeleton if empty? Or maybe check length

    if (!Array.isArray(incidents)) return null;

    if (incidents.length === 0) {
        return (
            <div className="bg-white shadow rounded-lg p-6 text-center border border-gray-200">
                <p className="text-gray-500">No active incidents reported.</p>
            </div>
        )
    }

    return (
        <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
            <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Past Incidents</h3>
            </div>
            <ul className="divide-y divide-gray-200">
                {incidents.map((incident: any) => (
                    <li key={incident.id} className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-gray-900">{incident.title}</h4>
                            <StatusBadge status={incident.status} />
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                            Reported: {new Date(incident.createdAt).toLocaleString()}
                            {/* resolvedAt is removed from schema for now, logic needs update if needed */}
                        </div>
                        {incident.body && (
                            <div className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
                                {incident.body}
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}
