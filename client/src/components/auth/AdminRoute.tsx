import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";

export default function AdminRoute() {
  const location = useLocation();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: api.auth.me,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper text-ink">
        <span className="text-[0.75rem] font-semibold uppercase tracking-[0.25em]">
          Checking access
        </span>
      </div>
    );
  }

  if (isError || !data?.admin) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
