import { getDashboardStats } from "@/app/actions/services";
import { authClient } from "@/app/lib/auth-client";
import { useQuery } from "@tanstack/react-query";

export function useDashboard() {
    const {data} = authClient.useSession();
    const userId = data?.user.id
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const {
    data: stats,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["dashboard", userId],
    queryFn: () => getDashboardStats(userId!, timezone),
    enabled: !!userId,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  return {stats, isLoading, error};

}