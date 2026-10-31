import { useId, type ComponentProps } from "react";

const control =
  "w-full rounded-xl border border-border bg-surface px-3 text-base text-text " +
  "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary aria-invalid:border-favorite";

type Common = { label: string; hint?: string; error?: string };

function Wrapper({ id, label, hint, error, children }: Common & { id: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-sm text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-sm text-favorite">
          {error}
        </p>
      )}
    </div>
  );
}

function describedBy(id: string, hint?: string, error?: string) {
  return error ? `${id}-error` : hint ? `${id}-hint` : undefined;
}

export function Field({ label, hint, error, ...props }: Common & ComponentProps<"input">) {
  const id = useId();
  return (
    <Wrapper id={id} label={label} hint={hint} error={error}>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={`${control} min-h-11`}
        {...props}
      />
    </Wrapper>
  );
}

export function TextArea({ label, hint, error, ...props }: Common & ComponentProps<"textarea">) {
  const id = useId();
  return (
    <Wrapper id={id} label={label} hint={hint} error={error}>
      <textarea
        id={id}
        rows={4}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={`${control} py-2`}
        {...props}
      />
    </Wrapper>
  );
}

export function Select({
  label,
  hint,
  error,
  children,
  ...props
}: Common & ComponentProps<"select">) {
  const id = useId();
  return (
    <Wrapper id={id} label={label} hint={hint} error={error}>
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={`${control} min-h-11`}
        {...props}
      >
        {children}
      </select>
    </Wrapper>
  );
}
