'use client';
import useSWR from 'swr';
import { StatusBadge } from './StatusBadge';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function ComponentList() {
    const { data: components, error } = useSWR('/api/status/components', fetcher, { refreshInterval: 60000 });

    if (error) return <div className="text-red-500">Failed to load components</div>;
    if (!components || !Array.isArray(components)) return <div className="animate-pulse h-40 bg-gray-100 rounded-lg"></div>;

    return (
        <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
            <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">System Components</h3>
            </div>
            <ul className="divide-y divide-gray-200">
                {components.map((component: any) => (
                    <li key={component.id} className="px-4 py-4 sm:px-6 flex items-center justify-between hover:bg-gray-50">
                        <span className="text-sm font-medium text-gray-900">{component.name}</span>
                        <div className="flex items-center">
                            {component.updatedAt && (
                                <span className="mr-4 text-xs text-gray-500 hidden sm:block">
                                    Updated: {new Date(component.updatedAt).toLocaleTimeString()}
                                </span>
                            )}
                            <StatusBadge status={component.status} />
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
