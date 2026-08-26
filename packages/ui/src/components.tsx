"use client";

import {
  cloneElement,
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type ChangeEventHandler,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type LabelHTMLAttributes,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";

const cx = (...values: Array<string | false | null | undefined>): string =>
  values.filter(Boolean).join(" ");

type ButtonVariant = "primary" | "secondary" | "quiet" | "danger";
type ButtonSize = "small" | "medium";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingLabel?: string;
  size?: ButtonSize;
  variant?: ButtonVariant;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      "aria-label": ariaLabel,
      children,
      className,
      disabled,
      loading = false,
      loadingLabel = "Proszę czekać…",
      size = "medium",
      type = "button",
      variant = "primary",
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      aria-busy={loading || undefined}
      aria-label={loading ? loadingLabel : ariaLabel}
      data-loading={loading || undefined}
      className={cx("wy-button", `wy-button--${variant}`, `wy-button--${size}`, className)}
      disabled={disabled || loading}
      type={type}
      {...props}
    >
      <span
        aria-hidden={loading || undefined}
        className="wy-button__label"
        data-hidden={loading || undefined}
      >
        {children}
      </span>
      {loading ? (
        <span className="wy-button__loading">
          <span aria-hidden="true" className="wy-spinner" />
          <span>{loadingLabel}</span>
        </span>
      ) : null}
    </button>
  ),
);
Button.displayName = "Button";

export interface IconButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "aria-label"
> {
  label: string;
  size?: ButtonSize;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ children, className, label, size = "medium", type = "button", ...props }, ref) => (
    <button
      ref={ref}
      aria-label={label}
      className={cx("wy-icon-button", `wy-icon-button--${size}`, className)}
      title={label}
      type={type}
      {...props}
    >
      {children}
    </button>
  ),
);
IconButton.displayName = "IconButton";

export interface LinkButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  size?: ButtonSize;
  variant?: Exclude<ButtonVariant, "danger">;
}

export const LinkButton = forwardRef<HTMLAnchorElement, LinkButtonProps>(
  ({ children, className, size = "medium", variant = "secondary", ...props }, ref) => (
    <a
      ref={ref}
      className={cx("wy-button", `wy-button--${variant}`, `wy-button--${size}`, className)}
      {...props}
    >
      {children}
    </a>
  ),
);
LinkButton.displayName = "LinkButton";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cx("wy-input", className)} {...props} />
  ),
);
Input.displayName = "Input";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cx("wy-input wy-textarea", className)} {...props} />
));
Textarea.displayName = "Textarea";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ children, className, ...props }, ref) => (
    <select ref={ref} className={cx("wy-input wy-select", className)} {...props}>
      {children}
    </select>
  ),
);
Select.displayName = "Select";

interface FieldControlProps {
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
  id?: string;
}

export interface FormFieldProps {
  children: ReactElement<FieldControlProps>;
  className?: string;
  error?: string;
  hint?: string;
  id?: string;
  label: string;
  optional?: boolean;
  success?: string;
}

export const FormField = ({
  children,
  className,
  error,
  hint,
  id: providedId,
  label,
  optional = false,
  success,
}: FormFieldProps) => {
  const generatedId = useId();
  const id = providedId ?? generatedId;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const successId = success && !error ? `${id}-success` : undefined;
  const describedBy = [hintId, errorId, successId].filter(Boolean).join(" ") || undefined;
  const controlProps: FieldControlProps = { id };
  if (describedBy) controlProps["aria-describedby"] = describedBy;
  if (error) controlProps["aria-invalid"] = true;

  return (
    <div
      className={cx("wy-field", className)}
      data-state={error ? "error" : success ? "success" : undefined}
    >
      <label className="wy-field__label" htmlFor={id}>
        {label}
        {optional ? <span className="wy-field__optional">opcjonalne</span> : null}
      </label>
      {hint ? (
        <span className="wy-field__hint" id={hintId}>
          {hint}
        </span>
      ) : null}
      {cloneElement(children, controlProps)}
      {error ? <FieldError id={errorId}>{error}</FieldError> : null}
      {success && !error ? (
        <FieldMessage id={successId} tone="success">
          {success}
        </FieldMessage>
      ) : null}
    </div>
  );
};

export interface FieldErrorProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
}

export const FieldError = ({ children, className, ...props }: FieldErrorProps) => (
  <span className={cx("wy-field__message", "wy-field__message--error", className)} {...props}>
    <span aria-hidden="true">!</span>
    {children}
  </span>
);

export interface FieldMessageProps extends HTMLAttributes<HTMLParagraphElement> {
  tone?: "neutral" | "success" | "error";
}

export const FieldMessage = ({
  children,
  className,
  role,
  tone = "neutral",
  ...props
}: FieldMessageProps) => (
  <p
    className={cx("wy-field__message", `wy-field__message--${tone}`, className)}
    role={role ?? (tone === "error" ? "alert" : tone === "success" ? "status" : undefined)}
    {...props}
  >
    {tone !== "neutral" ? <span aria-hidden="true">{tone === "success" ? "✓" : "!"}</span> : null}
    {children}
  </p>
);

interface ChoiceProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  description?: string;
  label: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
}

const Choice = forwardRef<HTMLInputElement, ChoiceProps & { type: "checkbox" | "radio" }>(
  ({ className, description, id: providedId, label, type, ...props }, ref) => {
    const generatedId = useId();
    const id = providedId ?? generatedId;
    const descriptionId = description ? `${id}-description` : undefined;
    return (
      <label className={cx("wy-choice", className)} htmlFor={id}>
        <input
          ref={ref}
          aria-describedby={descriptionId}
          className="wy-choice__control"
          id={id}
          type={type}
          {...props}
        />
        <span>
          <span className="wy-choice__label">{label}</span>
          {description ? (
            <span className="wy-choice__description" id={descriptionId}>
              {description}
            </span>
          ) : null}
        </span>
      </label>
    );
  },
);
Choice.displayName = "Choice";

export const Checkbox = forwardRef<HTMLInputElement, ChoiceProps>((props, ref) => (
  <Choice ref={ref} type="checkbox" {...props} />
));
Checkbox.displayName = "Checkbox";

export const Radio = forwardRef<HTMLInputElement, ChoiceProps>((props, ref) => (
  <Choice ref={ref} type="radio" {...props} />
));
Radio.displayName = "Radio";

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  description?: string;
  label: string;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, description, disabled, id: providedId, label, ...props }, ref) => {
    const generatedId = useId();
    const id = providedId ?? generatedId;
    const labelId = `${id}-label`;
    const descriptionId = description ? `${id}-description` : undefined;

    return (
      <label className={cx("wy-switch", disabled && "is-disabled", className)} htmlFor={id}>
        <span className="wy-switch__copy">
          <span className="wy-switch__label" id={labelId}>
            {label}
          </span>
          {description ? (
            <span className="wy-switch__description" id={descriptionId}>
              {description}
            </span>
          ) : null}
        </span>
        <input
          ref={ref}
          aria-describedby={descriptionId}
          aria-labelledby={labelId}
          className="wy-switch__control"
          disabled={disabled}
          id={id}
          role="switch"
          type="checkbox"
          {...props}
        />
      </label>
    );
  },
);
Switch.displayName = "Switch";

export interface SegmentedControlItem {
  disabled?: boolean;
  label: string;
  value: string;
}

export interface SegmentedControlProps {
  items: readonly SegmentedControlItem[];
  label: string;
  onChange: (value: string) => void;
  value: string;
}

export const SegmentedControl = ({ items, label, onChange, value }: SegmentedControlProps) => {
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const move = (currentIndex: number, direction: 1 | -1) => {
    for (let offset = 1; offset <= items.length; offset += 1) {
      const index = (currentIndex + direction * offset + items.length) % items.length;
      const item = items[index];
      if (item && !item.disabled) {
        onChange(item.value);
        buttonRefs.current[index]?.focus();
        return;
      }
    }
  };

  return (
    <div aria-label={label} className="wy-segmented-control" role="group">
      {items.map((item, index) => (
        <button
          key={item.value}
          ref={(element) => {
            buttonRefs.current[index] = element;
          }}
          aria-pressed={item.value === value}
          disabled={item.disabled}
          onClick={() => onChange(item.value)}
          onKeyDown={(event) => {
            if (event.key === "ArrowRight" || event.key === "ArrowDown") {
              event.preventDefault();
              move(index, 1);
            } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
              event.preventDefault();
              move(index, -1);
            } else if (event.key === "Home") {
              event.preventDefault();
              const firstEnabled = items.findIndex((candidate) => !candidate.disabled);
              const itemToActivate = items[firstEnabled];
              if (itemToActivate) {
                onChange(itemToActivate.value);
                buttonRefs.current[firstEnabled]?.focus();
              }
            } else if (event.key === "End") {
              event.preventDefault();
              const lastEnabled = items.findLastIndex((candidate) => !candidate.disabled);
              const itemToActivate = items[lastEnabled];
              if (itemToActivate) {
                onChange(itemToActivate.value);
                buttonRefs.current[lastEnabled]?.focus();
              }
            }
          }}
          type="button"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
};

export interface MenuItem {
  disabled?: boolean;
  id: string;
  label: string;
  onSelect: () => void;
  tone?: "default" | "danger";
}

export interface MenuProps {
  items: readonly MenuItem[];
  label: string;
}

export const Menu = ({ items, label }: MenuProps) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const enabledIndices = items.flatMap((item, index) => (item.disabled ? [] : [index]));

  const focusItem = (position: number) => {
    if (enabledIndices.length === 0) return;
    const normalized = (position + enabledIndices.length) % enabledIndices.length;
    itemRefs.current[enabledIndices[normalized] ?? 0]?.focus();
  };

  const close = () => {
    setOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  };

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: Event) => {
      if (event.target instanceof Node && !menuRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("focusin", closeOutside);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("focusin", closeOutside);
    };
  }, [open]);

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen(true);
      requestAnimationFrame(() => focusItem(0));
    }
  };

  const onMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const activeIndex = itemRefs.current.findIndex((item) => item === document.activeElement);
    const activePosition = enabledIndices.indexOf(activeIndex);
    if (event.key === "Escape") {
      event.preventDefault();
      close();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      focusItem(activePosition + 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      focusItem(activePosition - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      focusItem(0);
    } else if (event.key === "End") {
      event.preventDefault();
      focusItem(-1);
    }
  };

  return (
    <div ref={menuRef} className="wy-menu">
      <IconButton
        ref={triggerRef}
        aria-expanded={open}
        aria-haspopup="menu"
        label={label}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={onTriggerKeyDown}
        size="small"
      >
        <span aria-hidden="true">•••</span>
      </IconButton>
      {open ? (
        <div aria-label={label} className="wy-menu__surface" onKeyDown={onMenuKeyDown} role="menu">
          {items.map((item, index) => (
            <button
              key={item.id}
              ref={(element) => {
                itemRefs.current[index] = element;
              }}
              className={cx(item.tone === "danger" && "is-danger")}
              disabled={item.disabled}
              onClick={(event: MouseEvent<HTMLButtonElement>) => {
                event.preventDefault();
                item.onSelect();
                close();
              }}
              role="menuitem"
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};

type Tone = "neutral" | "success" | "warning" | "error" | "info";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export const Badge = ({ children, className, tone = "neutral", ...props }: BadgeProps) => (
  <span className={cx("wy-badge", `wy-badge--${tone}`, className)} {...props}>
    {children}
  </span>
);

export const StatusBadge = ({ children, tone = "neutral", ...props }: BadgeProps) => (
  <Badge tone={tone} {...props}>
    <span aria-hidden="true" className="wy-status-dot" />
    {children}
  </Badge>
);

interface DialogProps {
  actions?: ReactNode;
  children: ReactNode;
  description?: string;
  onClose: () => void;
  open: boolean;
  title: string;
  variant?: "dialog" | "drawer";
}

export const Dialog = ({
  actions,
  children,
  description,
  onClose,
  open,
  title,
  variant = "dialog",
}: DialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-describedby={description ? descriptionId : undefined}
      aria-labelledby={titleId}
      className={cx("wy-dialog", variant === "drawer" && "wy-drawer")}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      onClose={onClose}
    >
      <div className="wy-dialog__surface">
        <div className="wy-dialog__header">
          <div>
            <h2 id={titleId}>{title}</h2>
            {description ? <p id={descriptionId}>{description}</p> : null}
          </div>
          <IconButton label="Zamknij okno" onClick={onClose}>
            <span aria-hidden="true">×</span>
          </IconButton>
        </div>
        <div className="wy-dialog__content">{children}</div>
        {actions ? <div className="wy-dialog__actions">{actions}</div> : null}
      </div>
    </dialog>
  );
};

export const Drawer = (props: Omit<DialogProps, "variant">) => (
  <Dialog variant="drawer" {...props} />
);

export interface TabItem {
  content: ReactNode;
  id: string;
  label: string;
}

export interface TabsProps {
  defaultTab?: string;
  label: string;
  tabs: TabItem[];
}

export const Tabs = ({ defaultTab, label, tabs }: TabsProps) => {
  const [activeId, setActiveId] = useState(defaultTab ?? tabs[0]?.id ?? "");
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const baseId = useId();

  const activateByIndex = (index: number) => {
    const normalized = (index + tabs.length) % tabs.length;
    const tab = tabs[normalized];
    if (!tab) return;
    setActiveId(tab.id);
    buttonRefs.current[normalized]?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      activateByIndex(index + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      activateByIndex(index - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      activateByIndex(0);
    } else if (event.key === "End") {
      event.preventDefault();
      activateByIndex(tabs.length - 1);
    }
  };

  return (
    <div className="wy-tabs">
      <div aria-label={label} className="wy-tabs__list" role="tablist">
        {tabs.map((tab, index) => {
          const selected = tab.id === activeId;
          return (
            <button
              key={tab.id}
              ref={(element) => {
                buttonRefs.current[index] = element;
              }}
              aria-controls={`${baseId}-${tab.id}-panel`}
              aria-selected={selected}
              className="wy-tabs__tab"
              id={`${baseId}-${tab.id}-tab`}
              onClick={() => setActiveId(tab.id)}
              onKeyDown={(event) => onKeyDown(event, index)}
              role="tab"
              tabIndex={selected ? 0 : -1}
              type="button"
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {tabs.map((tab) => (
        <div
          key={tab.id}
          aria-labelledby={`${baseId}-${tab.id}-tab`}
          className="wy-tabs__panel"
          hidden={tab.id !== activeId}
          id={`${baseId}-${tab.id}-panel`}
          role="tabpanel"
          tabIndex={0}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
};

export interface TableColumn {
  header: string;
  key: string;
}

export interface TableRow {
  cells: Record<string, ReactNode>;
  id: string;
}

export interface TableProps {
  caption: string;
  columns: TableColumn[];
  rows: TableRow[];
}

export const Table = ({ caption, columns, rows }: TableProps) => (
  <div className="wy-table-scroll" tabIndex={0}>
    <table className="wy-table">
      <caption className="wy-sr-only">{caption}</caption>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.key} scope="col">
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            {columns.map((column, index) => {
              const Cell = index === 0 ? "th" : "td";
              return (
                <Cell key={column.key} {...(index === 0 ? { scope: "row" } : {})}>
                  {row.cells[column.key]}
                </Cell>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

interface StateProps {
  action?: ReactNode;
  description: string;
  title: string;
}

const StateContent = ({
  action,
  description,
  error = false,
  title,
}: StateProps & { error?: boolean }) => {
  const titleId = useId();
  return (
    <section
      aria-labelledby={titleId}
      className={cx("wy-state", error && "wy-state--error")}
      role={error ? "alert" : undefined}
    >
      <span aria-hidden="true" className="wy-state__mark">
        {error ? "Błąd" : "Brak danych"}
      </span>
      <h3 id={titleId}>{title}</h3>
      <p>{description}</p>
      {action}
    </section>
  );
};

export const EmptyState = (props: StateProps) => <StateContent {...props} />;

export const ErrorState = (props: StateProps) => <StateContent error {...props} />;

export interface SkeletonProps {
  label?: string;
  lines?: number;
}

export const Skeleton = ({ label = "Ładowanie zawartości", lines = 3 }: SkeletonProps) => (
  <div aria-label={label} className="wy-skeleton" role="status">
    {Array.from({ length: lines }, (_, index) => (
      <span key={index} aria-hidden="true" className="wy-skeleton__line" />
    ))}
  </div>
);

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  tone?: Exclude<Tone, "neutral" | "success"> | "success";
}

export const Alert = ({ children, className, title, tone = "info", ...props }: AlertProps) => (
  <div
    className={cx("wy-alert", `wy-alert--${tone}`, className)}
    role={tone === "error" ? "alert" : "status"}
    {...props}
  >
    <strong>{title}</strong>
    <div>{children}</div>
  </div>
);

export interface ToastProps {
  message: string;
  onDismiss: () => void;
  open: boolean;
}

export const Toast = ({ message, onDismiss, open }: ToastProps) =>
  open ? (
    <div aria-atomic="true" className="wy-toast" role="status">
      <span>{message}</span>
      <IconButton label="Zamknij powiadomienie" onClick={onDismiss} size="small">
        <span aria-hidden="true">×</span>
      </IconButton>
    </div>
  ) : null;

export interface Step {
  label: string;
  status: "complete" | "current" | "upcoming" | "error";
}

export const Stepper = ({ steps }: { steps: Step[] }) => (
  <ol className="wy-stepper" aria-label="Postęp">
    {steps.map((step, index) => (
      <li
        key={step.label}
        aria-current={step.status === "current" ? "step" : undefined}
        className={cx("wy-stepper__item", `wy-stepper__item--${step.status}`)}
      >
        <span aria-hidden="true" className="wy-stepper__number">
          {step.status === "complete" ? "✓" : index + 1}
        </span>
        <span>{step.label}</span>
        {step.status === "error" ? <span className="wy-sr-only"> — błąd</span> : null}
      </li>
    ))}
  </ol>
);

export interface BreadcrumbItem {
  href?: string;
  label: string;
}

export const Breadcrumb = ({ items }: { items: BreadcrumbItem[] }) => (
  <nav aria-label="Okruszki" className="wy-breadcrumb">
    <ol>
      {items.map((item, index) => {
        const current = index === items.length - 1;
        return (
          <li key={`${item.label}-${index}`}>
            {current || !item.href ? (
              <span aria-current={current ? "page" : undefined}>{item.label}</span>
            ) : (
              <a href={item.href}>{item.label}</a>
            )}
          </li>
        );
      })}
    </ol>
  </nav>
);

export interface NavigationItem {
  active?: boolean;
  href: string;
  label: string;
}

export interface SidebarProps {
  items: NavigationItem[];
  productName?: string;
}

export const Sidebar = ({ items, productName = "Kwotum" }: SidebarProps) => (
  <aside className="wy-sidebar">
    <a className="wy-brand" href="#main">
      <span>{productName}</span>
    </a>
    <nav aria-label="Główna nawigacja">
      <ul className="wy-sidebar__nav">
        {items.map((item) => (
          <li key={item.href}>
            <a
              aria-current={item.active ? "page" : undefined}
              className={cx(item.active && "is-active")}
              href={item.href}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  </aside>
);

export interface AppHeaderProps {
  context: string;
  onMenuOpen: () => void;
  title: string;
}

export const AppHeader = ({ context, onMenuOpen, title }: AppHeaderProps) => (
  <header className="wy-app-header">
    <IconButton className="wy-menu-button" label="Otwórz menu" onClick={onMenuOpen}>
      <span aria-hidden="true">☰</span>
    </IconButton>
    <div>
      <span className="wy-app-header__context">{context}</span>
      <strong>{title}</strong>
    </div>
    <StatusBadge tone="neutral">Tryb demonstracyjny</StatusBadge>
  </header>
);

interface AppShellContextValue {
  closeMenu: () => void;
}

const AppShellContext = createContext<AppShellContextValue | null>(null);

export const useAppShell = (): AppShellContextValue => {
  const context = useContext(AppShellContext);
  if (!context) throw new Error("useAppShell wymaga AppShell");
  return context;
};

export interface AppShellProps {
  children: ReactNode;
  navigation: NavigationItem[];
  title: string;
}

export const AppShell = ({ children, navigation, title }: AppShellProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  return (
    <AppShellContext.Provider value={{ closeMenu }}>
      <a className="wy-skip-link" href="#main">
        Przejdź do treści
      </a>
      <div className="wy-app-shell">
        <div className="wy-app-shell__desktop-nav">
          <Sidebar items={navigation} />
        </div>
        <div className="wy-app-shell__body">
          <AppHeader
            context="Biblioteka interfejsu"
            onMenuOpen={() => setMenuOpen(true)}
            title={title}
          />
          <main id="main" tabIndex={-1}>
            {children}
          </main>
        </div>
      </div>
      <Drawer
        description="Nawigacja wersji mobilnej."
        onClose={closeMenu}
        open={menuOpen}
        title="Menu"
      >
        <Sidebar items={navigation} />
      </Drawer>
    </AppShellContext.Provider>
  );
};

export const Section = ({
  children,
  description,
  id,
  title,
}: {
  children: ReactNode;
  description?: string;
  id: string;
  title: string;
}) => (
  <section className="wy-section" id={id}>
    <div className="wy-section__heading">
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
    </div>
    {children}
  </section>
);

export const Fieldset = ({
  children,
  legend,
  ...props
}: HTMLAttributes<HTMLFieldSetElement> & { legend: string }) => (
  <fieldset className="wy-fieldset" {...props}>
    <legend>{legend}</legend>
    {children}
  </fieldset>
);

export const Label = ({ children, className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={cx("wy-field__label", className)} {...props}>
    {children}
  </label>
);
