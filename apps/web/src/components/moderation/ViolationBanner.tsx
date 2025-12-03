import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Ban } from "lucide-react";
import Link from "next/link";

interface ViolationBannerProps {
    isBanned: boolean;
    bannedUntil?: Date | null;
    violationCount: number;
}

export function ViolationBanner({ isBanned, bannedUntil, violationCount }: ViolationBannerProps) {
    if (isBanned) {
        return (
            <Alert variant="destructive" className="mb-4">
                <Ban className="h-4 w-4" />
                <AlertTitle>Account Suspended</AlertTitle>
                <AlertDescription>
                    Your account has been suspended {bannedUntil ? `until ${new Date(bannedUntil).toLocaleDateString()}` : 'permanently'}.
                    <Link href="/appeals" className="underline ml-2 font-medium">
                        Submit Appeal
                    </Link>
                </AlertDescription>
            </Alert>
        );
    }

    if (violationCount > 0) {
        return (
            <Alert variant="destructive" className="mb-4 bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200">
                <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>
                    You have {violationCount} active violation(s).
                    Further violations may result in account suspension.
                    <Link href="/appeals" className="underline ml-2 font-medium">
                        View Details
                    </Link>
                </AlertDescription>
            </Alert>
        );
    }

    return null;
}
