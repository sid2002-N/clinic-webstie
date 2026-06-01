import { AlertTriangle, Loader2 } from "lucide-react";

interface StatusViewProps {
  status: "loading" | "error" | "empty";
  message: string;
}

export function StatusView({ status, message }: StatusViewProps) {
  const isLoading = status === "loading";
  return (
    <div className="flex min-h-32 items-center justify-center rounded-lg border border-line/10 bg-panel/60 p-6 text-center font-mono text-sm text-muted">
      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin text-blue" /> : <AlertTriangle className="mr-2 h-4 w-4 text-amber" />}
      {message}
    </div>
  );
}
