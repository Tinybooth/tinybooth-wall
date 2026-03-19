import { AdminAuthGate } from "@/components/admin/AdminAuthGate";
import { AdminEventDetail } from "@/components/admin/AdminEventDetail";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Event Admin - TinyWall",
};

interface AdminEventPageProps {
  params: Promise<{ eventId: string }>;
}

/**
 * Admin event detail page, protected by client-side password.
 */
export default async function AdminEventPage({
  params,
}: AdminEventPageProps): Promise<React.ReactElement> {
  const { eventId } = await params;

  return (
    <AdminAuthGate>
      <AdminEventDetail eventId={eventId} />
    </AdminAuthGate>
  );
}
