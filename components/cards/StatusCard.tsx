import { Calendar } from "lucide-react";

interface StatusCardProps {
    title: string;
    icon?: React.ReactNode;
    mainLabel: string;
    mainValue: string;
    statusLabel: string;
    statusValue: string;
    statusColor?: string;
}

export default function StatusCard({
    title,
    icon,
    mainLabel,
    mainValue,
    statusLabel,
    statusValue,
    statusColor = "orange-500",
}: StatusCardProps) {
    return (
        <div className="bg-gray-800 rounded-[12px] p-8 text-white shadow-2xl shadow-slate-200">
            <div className="flex items-center gap-3 opacity-60 mb-6">
                {icon || <Calendar className="w-5 h-5" />}
                <span className="text-sm font-medium">{title}</span>
            </div>
            <p className="text-slate-400 text-sm">{mainLabel}</p>
            <p className="text-base font-semibold mt-1">{mainValue}</p>

            <div className="mt-8 pt-8 border-t border-slate-600">
                <div className="flex justify-between items-end">
                    <div>
                        <p className={`text-${statusColor} text-xs`}>{statusLabel}</p>
                        <p className="text-base font-medium">{statusValue}</p>
                    </div>
                    <div className={`h-9 w-9 bg-${statusColor}/20 rounded-lg flex items-center justify-center`}>
                        <div className={`h-2 w-2 bg-${statusColor} rounded-full animate-ping`} />
                    </div>
                </div>
            </div>
        </div>
    );
}
