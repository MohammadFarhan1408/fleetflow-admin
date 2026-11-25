import { Button } from "@/components/ui/Button";

type CustomerFormFooterProps = {
  dirty: boolean;
  submitting: boolean;
  submitLabel: string;
  onCancel: () => void;
};

/** The form action row: a quiet unsaved-changes signal on the left, Cancel then the one primary action. */
export const CustomerFormFooter = ({ dirty, submitting, submitLabel, onCancel }: CustomerFormFooterProps) => (
  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-3">
    {/* Always mounted so the change is announced when it appears. */}
    <p role="status" className="flex items-center gap-2 text-caption text-text-secondary">
      {dirty && (
        <>
          <span aria-hidden className="size-1.5 rounded-full bg-warning" />
          Unsaved changes
        </>
      )}
    </p>
    <div className="flex gap-2">
      <Button type="button" variant="secondary" disabled={submitting} onClick={onCancel}>
        Cancel
      </Button>
      <Button type="submit" loading={submitting}>
        {submitLabel}
      </Button>
    </div>
  </div>
);
