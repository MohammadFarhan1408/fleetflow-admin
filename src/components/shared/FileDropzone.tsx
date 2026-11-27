"use client";

import { CircleAlertIcon, CircleCheckIcon, FileIcon, UploadIcon, XIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
import {
  checkUploadFile,
  describeUploadError,
  isAbort,
  UPLOAD_ACCEPT,
  UPLOAD_LIMITS,
  uploadFile,
} from "@/lib/api/uploads";
import { cn } from "@/lib/cn";
import { formatFileSize } from "@/lib/format";

type State =
  | { phase: "idle" }
  | { phase: "uploading"; file: File; progress: number }
  | { phase: "done"; file: File }
  | { phase: "error"; file: File; message: string; retryable: boolean };

type FileDropzoneProps = {
  // Not the label's `id`: a `<label for>` would rename the button "File" and hide what it does ("Choose file").
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
  /** The confirmed upload's id, or "" while there is none (nothing chosen, uploading, failed, removed). */
  onChange: (uploadId: string) => void;
  /** True while a file is being sent: the form holds its Save until it is done. */
  onBusyChange?: (busy: boolean) => void;
};

const HINT = `PDF up to ${UPLOAD_LIMITS["application/pdf"].maxBytes / 1024 / 1024} MB, JPEG or PNG up to ${
  UPLOAD_LIMITS["image/jpeg"].maxBytes / 1024 / 1024
} MB.`;

/**
 * design.md §6 File upload: one file, sent as soon as it is chosen (or dropped). Progress, Cancel while it runs, Retry
 * after a failure and Remove afterwards, all named after the file. The checks here are UX only; the API and the
 * storage signature decide (rules.md §4).
 */
export const FileDropzone = ({ onChange, onBusyChange, ...control }: FileDropzoneProps) => {
  const [state, setState] = useState<State>({ phase: "idle" });
  const [dragging, setDragging] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const running = useRef<AbortController | null>(null);

  // Leaving the form (the dialog closes) ends a transfer in flight.
  useEffect(() => () => running.current?.abort(), []);

  const start = async (file: File) => {
    running.current?.abort();
    const refusal = checkUploadFile(file);
    if (refusal) {
      running.current = null;
      onChange("");
      onBusyChange?.(false);
      return setState({ phase: "error", file, message: refusal, retryable: false });
    }
    const controller = new AbortController();
    running.current = controller;
    onChange("");
    onBusyChange?.(true);
    setState({ phase: "uploading", file, progress: 0 });
    try {
      const uploadId = await uploadFile(file, {
        signal: controller.signal,
        onProgress: (progress) => {
          if (running.current === controller) setState({ phase: "uploading", file, progress });
        },
      });
      if (running.current !== controller) return;
      onChange(uploadId);
      onBusyChange?.(false);
      setState({ phase: "done", file });
    } catch (error) {
      if (running.current !== controller || isAbort(error)) return;
      onBusyChange?.(false);
      setState({ phase: "error", file, ...describeUploadError(error) });
    }
  };

  const clear = () => {
    running.current?.abort();
    running.current = null;
    onChange("");
    onBusyChange?.(false);
    setState({ phase: "idle" });
  };

  const choose = (file: File | undefined) => {
    if (file) void start(file);
  };

  const picker = (
    <>
      <input
        ref={input}
        type="file"
        aria-label="Choose a file" // hidden from assistive tech; the "Choose file" button is the control
        accept={UPLOAD_ACCEPT}
        tabIndex={-1}
        aria-hidden
        className="sr-only"
        onChange={(event) => {
          choose(event.target.files?.[0]);
          event.target.value = ""; // choosing the same file again must fire a change
        }}
      />
      <Button type="button" variant="secondary" onClick={() => input.current?.click()} {...control}>
        <UploadIcon />
        Choose file
      </Button>
    </>
  );

  if (state.phase === "idle") {
    return (
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          choose(event.dataTransfer.files[0]);
        }}
        className={cn(
          "flex flex-col items-center gap-2 rounded-lg border border-dashed border-border-strong px-4 py-4 text-center",
          dragging && "border-primary bg-primary-subtle",
        )}
      >
        <p className="text-body text-text-secondary">Drop a file here or</p>
        {picker}
        <p className="text-caption text-text-secondary">{HINT}</p>
      </div>
    );
  }

  const { file } = state;
  const failed = state.phase === "error";
  const Icon = state.phase === "done" ? CircleCheckIcon : failed ? CircleAlertIcon : FileIcon;
  const percent = state.phase === "uploading" ? Math.round(state.progress * 100) : 0;

  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-lg border bg-surface px-3 py-3",
        failed ? "border-error" : "border-border",
      )}
    >
      <div className="flex items-center gap-3">
        <Icon
          aria-hidden
          className={cn(
            "size-5 shrink-0",
            state.phase === "done" && "text-success",
            failed ? "text-error" : "text-text-secondary",
          )}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <p className="truncate text-body-strong text-text">{file.name}</p>
          <p className="text-caption text-text-secondary">
            {formatFileSize(file.size)}
            {state.phase === "uploading" && ` · ${percent}%`}
            {state.phase === "done" && " · Uploaded"}
          </p>
        </div>
        {state.phase === "uploading" && (
          <Button type="button" variant="ghost" size="sm" onClick={clear} aria-label={`Cancel uploading ${file.name}`}>
            Cancel
          </Button>
        )}
        {failed && state.retryable && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => void start(file)}
            aria-label={`Retry uploading ${file.name}`}
          >
            Retry
          </Button>
        )}
        {state.phase !== "uploading" && (
          <Button type="button" variant="ghost" size="icon-sm" onClick={clear} aria-label={`Remove ${file.name}`}>
            <XIcon />
          </Button>
        )}
      </div>
      {state.phase === "uploading" && (
        <div
          role="progressbar"
          aria-label={`Uploading ${file.name}`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          className="h-1.5 overflow-hidden rounded-full bg-surface-sunken"
        >
          <div className="h-full bg-primary transition-[width]" style={{ width: `${percent}%` }} />
        </div>
      )}
      {failed && (
        <p role="alert" className="flex items-center gap-1 text-caption text-error">
          <CircleAlertIcon aria-hidden className="size-4 shrink-0" />
          {state.message}
        </p>
      )}
      {state.phase === "done" && <p role="status" className="sr-only">{`${file.name} uploaded`}</p>}
    </div>
  );
};
