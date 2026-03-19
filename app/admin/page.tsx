import { AdminAuthGate } from "@/components/admin/AdminAuthGate";
import { AdminEventList } from "@/components/admin/AdminEventList";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin - Crispy Waffle",
};

/**
 * Admin events list page, protected by client-side password.
 */
export default function AdminPage(): React.ReactElement {
  return (
    <AdminAuthGate>
      <AdminEventList />
    </AdminAuthGate>
  );
}
