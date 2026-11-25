import { Button } from "@/components/ui/Button";

type FormFooterProps = {
  dirty: boolean;
  submitting: boolean;
  submitLabel: string;
  onCancel: () => void;
};

// Pressing a button blurs the focused field, and blur validation can insert an error line that pushes the button
// down before the click completes, so the click misses. Keeping focus where it is lets the click land; submitting
// still validates every field.
const keepFieldFocus = (event: React.MouseEvent) => event.preventDefault();

/** The form action row: a quiet unsaved-changes signal on the left, Cancel then the one primary action. */
export const FormFooter = ({ dirty, submitting, submitLabel, onCancel }: FormFooterProps) => (
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
      <Button type="button" variant="secondary" disabled={submitting} onMouseDown={keepFieldFocus} onClick={onCancel}>
        Cancel
      </Button>
      <Button type="submit" loading={submitting} onMouseDown={keepFieldFocus}>
        {submitLabel}
      </Button>
    </div>
  </div>
);
