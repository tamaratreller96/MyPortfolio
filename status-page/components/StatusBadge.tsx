import clsx from 'clsx';

type Status = 'operational' | 'degraded' | 'major_outage' | 'maintenance' | string;

interface StatusBadgeProps {
    status: Status;
    className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const normalizedStatus = status.toLowerCase().replace(/ /g, '_');

    const colorClass = clsx({
        'bg-green-100 text-green-800': normalizedStatus === 'operational',
        'bg-yellow-100 text-yellow-800': normalizedStatus === 'degraded',
        'bg-red-100 text-red-800': normalizedStatus === 'major_outage' || normalizedStatus === 'down',
        'bg-blue-100 text-blue-800': normalizedStatus === 'maintenance' || normalizedStatus === 'scheduled',
        'bg-gray-100 text-gray-800': !['operational', 'degraded', 'major_outage', 'down', 'maintenance', 'scheduled'].includes(normalizedStatus)
    });

    const label = status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

    return (
        <span className={clsx('px-2.5 py-0.5 rounded-full text-xs font-medium', colorClass, className)}>
            {label}
        </span>
    );
}
