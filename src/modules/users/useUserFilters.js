// Hook para búsqueda y filtros de usuarios
import { useState } from "react";

export function useUserFilters() {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");

  return {
    search,
    setSearch,
    role,
    setRole,
    status,
    setStatus,
  };
}
