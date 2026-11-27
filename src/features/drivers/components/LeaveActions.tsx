"use client";

import { useState } from "react";
import { Trash2Icon } from "lucide-react";

import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useToast } from "@/components/shared/ToastProvider";
import { Button } from "@/components/ui/Button";
import { useIdempotencyKey } from "@/lib/api/idempotency";
import { describeMutationError } from "@/lib/api/mutation-errors";
import { browserToday } from "@/lib/calendar";
import { formatCalendarDate } from "@/lib/format";
import type { DriverLeave } from "../api";
import { useDeleteLeave } from "../mutations";
import { useDriverWriteError } from "../use-driver-write-error";

/**
 * Delete for a leave period that has not started. "Not started" is judged by the browser's date, so the API's
 * answer (409 `driver.leave_started`) is the authority and ends in a toast; started leave shows no button.
 */
export const LeaveActions = ({ driverId, leave }: { driverId: string; leave: DriverLeave }) => {
  const [confirming, setConfirming] = useState(false);
  const toast = useToast();
  const remove = useDeleteLeave(driverId);
  const key = useIdempotencyKey();
  const handleFatalError = useDriverWriteError(() => setConfirming(false));

  if (leave.starts_on <= browserToday()) return null;

  const period = `${formatCalendarDate(leave.starts_on)} to ${formatCalendarDate(leave.ends_on)}`;
  const confirm = async () => {
    try {
      await remove.mutateAsync({ leaveId: leave.public_id, idempotencyKey: key.keyFor(leave.public_id) });
      key.reset();
      setConfirming(false);
      toast({ tone: "success", title: "Leave deleted" });
    } catch (error) {
      if (handleFatalError(error)) return;
      const { title, detail } = describeMutationError(error);
      setConfirming(false);
      toast({ tone: "error", title, description: detail });
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={`Delete leave from ${period}`}
        onClick={() => setConfirming(true)}
      >
        <Trash2Icon />
      </Button>
      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title={`Delete leave from ${period}?`}
        description="The driver can be assigned to routes on these days again."
        confirmLabel="Delete leave"
        destructive
        loading={remove.isPending}
        onConfirm={() => void confirm()}
      />
    </>
  );
};
