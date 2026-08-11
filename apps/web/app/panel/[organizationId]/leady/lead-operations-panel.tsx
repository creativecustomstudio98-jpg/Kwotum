"use client";

import type { LeadPriority, LeadStatus, LeadTaskKind } from "@wyceno/database";
import { Button, Input, Select, Textarea } from "@wyceno/ui";
import { useRouter } from "next/navigation";
import { useActionState, useCallback, useEffect, useId, useRef, useState } from "react";

import type { LeadDetail, LeadOperationTask } from "../../../../lib/leads/service";
import { PanelIcon } from "../../panel-icon";
import {
  closeLeadTaskAction,
  createLeadTaskAction,
  setLeadAssigneeAction,
  setLeadPriorityAction,
  type LeadActionState,
} from "./actions";
import { LeadNoteForm, LeadStartForm, LeadStatusSelect } from "./lead-actions";

const initialState: LeadActionState = { error: null, success: null };

const priorityLabels: Readonly<Record<LeadPriority, string>> = {
  high: "Wysoki",
  low: "Niski",
  medium: "Średni",
};

const taskKindLabels: Readonly<Record<LeadTaskKind, string>> = {
  contact: "Kontakt",
  task: "Zadanie",
};

type Operation = LeadDetail["operation"];
type Notes = LeadDetail["notes"];
type CreatedNote = NonNullable<LeadActionState["createdNote"]>;
type CreatedTask = NonNullable<LeadActionState["createdTask"]>;

export function LeadOperationsPanel({
  canAssign,
  canManageAllTasks,
  contactEmail,
  contactPhone,
  currentUserId,
  leadId,
  notes,
  operation,
  organizationId,
  status,
}: Readonly<{
  canAssign: boolean;
  canManageAllTasks: boolean;
  contactEmail: string | null;
  contactPhone: string | null;
  currentUserId: string;
  leadId: string;
  notes: Notes;
  operation: Operation;
  organizationId: string;
  status: LeadStatus;
}>) {
  const [closedTaskIds, setClosedTaskIds] = useState<ReadonlySet<string>>(() => new Set());
  const [localNotes, setLocalNotes] = useState<Notes>([]);
  const [localTasks, setLocalTasks] = useState<ReadonlyArray<LeadOperationTask>>([]);
  const [localLastActivityAt, setLocalLastActivityAt] = useState<string | null>(null);

  const handleNoteCreated = useCallback(
    (note: CreatedNote) => {
      const createdByName =
        operation.members.find((member) => member.userId === note.createdBy)?.name ?? "Użytkownik";
      setLocalNotes((current) => [
        { ...note, createdByName },
        ...current.filter((currentNote) => currentNote.id !== note.id),
      ]);
      setLocalLastActivityAt(note.createdAt);
    },
    [operation.members],
  );

  const handleTaskCreated = useCallback(
    (task: CreatedTask) => {
      const assignedToName =
        operation.members.find((member) => member.userId === task.assignedTo)?.name ?? "Użytkownik";
      const createdByName =
        operation.members.find((member) => member.userId === task.createdBy)?.name ?? "Użytkownik";
      const projectedTask: LeadOperationTask = {
        ...task,
        assignedToName,
        closedAt: null,
        createdByName,
        status: "open",
      };
      setLocalTasks((current) => [
        projectedTask,
        ...current.filter((currentTask) => currentTask.id !== task.id),
      ]);
      setLocalLastActivityAt(task.createdAt);
    },
    [operation.members],
  );

  const handleTaskClosed = useCallback((taskId: string) => {
    setLocalTasks((current) => current.filter((task) => task.id !== taskId));
    setClosedTaskIds((current) => new Set(current).add(taskId));
    setLocalLastActivityAt(new Date().toISOString());
  }, []);

  const displayedNotes = [
    ...localNotes,
    ...notes.filter((note) => !localNotes.some((localNote) => localNote.id === note.id)),
  ];
  const displayedTasks = [
    ...localTasks,
    ...operation.tasks.filter(
      (task) =>
        !closedTaskIds.has(task.id) && !localTasks.some((localTask) => localTask.id === task.id),
    ),
  ];
  const openTasks = displayedTasks.filter((task) => task.status === "open");
  const nextTask = findNextOpenTask(openTasks);
  const nextContact = findNextOpenTask(openTasks, "contact");
  const lastActivityAt = localLastActivityAt ?? operation.lastActivityAt;

  return (
    <aside aria-label="Obsługa leada" className="lead-reference-summary__side lead-operations">
      <section className="lead-operations__overview">
        <div className="lead-operations__heading">
          <h2>Obsługa leada</h2>
          <span>{openTasks.length > 0 ? `${openTasks.length} otwarte` : "Brak zaległości"}</span>
        </div>

        <div className="lead-operations__fields">
          <OperationField label="Status">
            <LeadStatusSelect
              currentStatus={status}
              leadId={leadId}
              organizationId={organizationId}
            />
          </OperationField>
          <OperationField label="Właściciel">
            {canAssign ? (
              <LeadAssigneeSelect
                assigneeUserId={operation.assignee?.userId ?? null}
                leadId={leadId}
                members={operation.members}
                organizationId={organizationId}
              />
            ) : (
              <span className="lead-operations__read-only">
                <PanelIcon name="user" />
                {operation.assignee?.name ?? "Nieprzypisany"}
              </span>
            )}
          </OperationField>
          <OperationField label="Priorytet">
            <LeadPrioritySelect
              leadId={leadId}
              organizationId={organizationId}
              priority={operation.priority}
            />
          </OperationField>
          <OperationField label="Następny krok">
            <OperationTaskSummary emptyLabel="Nie zaplanowano" task={nextTask} />
          </OperationField>
          <OperationField label="Zaplanowany kontakt">
            <OperationTaskSummary emptyLabel="Nie zaplanowano" task={nextContact} />
          </OperationField>
        </div>

        <p className="lead-operations__last-activity">
          Ostatnia aktywność:
          <time dateTime={lastActivityAt}>{formatDateTime(lastActivityAt)}</time>
        </p>
      </section>

      <section className="lead-operations__notes">
        <h2>Notatki</h2>
        <LeadNoteForm
          compact
          leadId={leadId}
          onCreated={handleNoteCreated}
          organizationId={organizationId}
        />
        {displayedNotes.length > 0 ? (
          <ol aria-label="Ostatnie notatki" className="lead-reference-note-list">
            {displayedNotes.slice(0, 2).map((note) => (
              <li key={note.id}>
                <div className="lead-reference-note-meta">
                  <span aria-hidden="true">{initials(note.createdByName)}</span>
                  <div>
                    <strong>{note.createdByName}</strong>
                    <time dateTime={note.createdAt}>{formatDateTime(note.createdAt)}</time>
                  </div>
                </div>
                <p>{note.body}</p>
              </li>
            ))}
          </ol>
        ) : (
          <p className="lead-reference-note-empty">Brak notatek zespołu.</p>
        )}
        {displayedNotes.length > 2 ? (
          <a className="lead-operations__history-link" href="#history-panel">
            Zobacz wszystkie notatki
            <PanelIcon name="chevron-right" />
          </a>
        ) : null}
      </section>

      {openTasks.length > 0 ? (
        <section className="lead-operations__tasks">
          <h2>Otwarte działania</h2>
          <ol>
            {openTasks.map((task) => (
              <li key={task.id}>
                <div>
                  <span>{taskKindLabels[task.kind]}</span>
                  <strong>{task.title}</strong>
                  <small>
                    {formatDateTime(task.dueAt)} · {task.assignedToName}
                  </small>
                </div>
                {canManageAllTasks ||
                task.assignedTo === currentUserId ||
                task.createdBy === currentUserId ? (
                  <LeadTaskCloseForm
                    leadId={leadId}
                    onClosed={handleTaskClosed}
                    organizationId={organizationId}
                    taskId={task.id}
                  />
                ) : null}
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <section className="lead-operations__actions">
        {status === "new" ? (
          <LeadStartForm leadId={leadId} organizationId={organizationId} />
        ) : (
          <a
            className="lead-reference-primary-action"
            href={contactEmail ? `mailto:${contactEmail}` : `tel:${contactPhone ?? ""}`}
          >
            Skontaktuj się z klientem
          </a>
        )}
        <div>
          <LeadTaskDialog
            currentUserId={currentUserId}
            kind="contact"
            leadId={leadId}
            members={operation.members}
            onCreated={handleTaskCreated}
            organizationId={organizationId}
          />
          <LeadTaskDialog
            currentUserId={currentUserId}
            kind="task"
            leadId={leadId}
            members={operation.members}
            onCreated={handleTaskCreated}
            organizationId={organizationId}
          />
        </div>
      </section>
    </aside>
  );
}

function OperationField({
  children,
  label,
}: Readonly<{ children: React.ReactNode; label: string }>) {
  return (
    <div className="lead-operations__field">
      <span>{label}</span>
      <div>{children}</div>
    </div>
  );
}

function OperationTaskSummary({
  emptyLabel,
  task,
}: Readonly<{ emptyLabel: string; task: LeadOperationTask | null }>) {
  if (!task) return <span className="lead-operations__empty-value">{emptyLabel}</span>;
  return (
    <span className="lead-operations__task-summary">
      <PanelIcon name={task.kind === "contact" ? "phone" : "check"} />
      <span>
        <strong>{task.title}</strong>
        <time dateTime={task.dueAt}>{formatDateTime(task.dueAt)}</time>
      </span>
    </span>
  );
}

function findNextOpenTask(
  tasks: ReadonlyArray<LeadOperationTask>,
  kind?: LeadTaskKind,
): LeadOperationTask | null {
  return (
    tasks
      .filter((task) => !kind || task.kind === kind)
      .toSorted((left, right) => Date.parse(left.dueAt) - Date.parse(right.dueAt))[0] ?? null
  );
}

function LeadAssigneeSelect({
  assigneeUserId,
  leadId,
  members,
  organizationId,
}: Readonly<{
  assigneeUserId: string | null;
  leadId: string;
  members: Operation["members"];
  organizationId: string;
}>) {
  const [state, action, pending] = useActionState(setLeadAssigneeAction, initialState);
  useRefreshAfterSuccess(state);
  return (
    <form action={action} className="lead-operations__select-form">
      <input name="organizationId" type="hidden" value={organizationId} />
      <input name="leadId" type="hidden" value={leadId} />
      <label className="wy-sr-only" htmlFor="lead-operation-assignee">
        Właściciel leada
      </label>
      <Select
        defaultValue={assigneeUserId ?? ""}
        disabled={pending}
        id="lead-operation-assignee"
        name="assigneeUserId"
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
      >
        <option value="">Nieprzypisany</option>
        {members.map((member) => (
          <option key={member.userId} value={member.userId}>
            {member.name}
          </option>
        ))}
      </Select>
      <ActionMessage state={state} />
    </form>
  );
}

function LeadPrioritySelect({
  leadId,
  organizationId,
  priority,
}: Readonly<{ leadId: string; organizationId: string; priority: LeadPriority }>) {
  const [state, action, pending] = useActionState(setLeadPriorityAction, initialState);
  useRefreshAfterSuccess(state);
  return (
    <form action={action} className="lead-operations__select-form">
      <input name="organizationId" type="hidden" value={organizationId} />
      <input name="leadId" type="hidden" value={leadId} />
      <label className="wy-sr-only" htmlFor="lead-operation-priority">
        Priorytet leada
      </label>
      <span className={`lead-operations__priority-dot is-${priority}`} aria-hidden="true" />
      <Select
        defaultValue={priority}
        disabled={pending}
        id="lead-operation-priority"
        name="priority"
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
      >
        {(Object.keys(priorityLabels) as LeadPriority[]).map((value) => (
          <option key={value} value={value}>
            {priorityLabels[value]}
          </option>
        ))}
      </Select>
      <ActionMessage state={state} />
    </form>
  );
}

function LeadTaskDialog({
  currentUserId,
  kind,
  leadId,
  members,
  onCreated,
  organizationId,
}: Readonly<{
  currentUserId: string;
  kind: LeadTaskKind;
  leadId: string;
  members: Operation["members"];
  onCreated: (task: CreatedTask) => void;
  organizationId: string;
}>) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const requestIdRef = useRef<HTMLInputElement>(null);
  const dueAtRef = useRef<HTMLInputElement>(null);
  const dueAtLocalRef = useRef<HTMLInputElement>(null);
  const [state, action, pending] = useActionState(createLeadTaskAction, initialState);
  const headingId = useId();
  const isContact = kind === "contact";

  useEffect(() => {
    if (!state.success) return;
    if (state.createdTask) onCreated(state.createdTask);
    dialogRef.current?.close();
    formRef.current?.reset();
    if (requestIdRef.current) requestIdRef.current.value = "";
    if (dueAtRef.current) dueAtRef.current.value = "";
  }, [onCreated, state]);

  return (
    <>
      <Button
        className="lead-operations__secondary-action"
        onClick={() => dialogRef.current?.showModal()}
        type="button"
        variant="secondary"
      >
        <PanelIcon name={isContact ? "calendar" : "check"} />
        {isContact ? "Zaplanuj kontakt" : "Utwórz zadanie"}
      </Button>
      <dialog aria-labelledby={headingId} className="lead-task-dialog" ref={dialogRef}>
        <div className="lead-task-dialog__heading">
          <div>
            <span>{isContact ? "Kontakt z klientem" : "Działanie zespołu"}</span>
            <h2 id={headingId}>{isContact ? "Zaplanuj kontakt" : "Utwórz zadanie"}</h2>
          </div>
          <button
            aria-label="Zamknij okno"
            onClick={() => dialogRef.current?.close()}
            type="button"
          >
            <PanelIcon name="close" />
          </button>
        </div>
        <form
          action={action}
          className="lead-task-dialog__form"
          onSubmit={(event) => {
            const localValue = dueAtLocalRef.current?.value;
            if (!localValue || !dueAtRef.current || !requestIdRef.current) {
              event.preventDefault();
              return;
            }
            const parsedDate = new Date(localValue);
            if (Number.isNaN(parsedDate.getTime())) {
              event.preventDefault();
              return;
            }
            dueAtRef.current.value = parsedDate.toISOString();
            requestIdRef.current.value ||= crypto.randomUUID();
          }}
          ref={formRef}
        >
          <input name="organizationId" type="hidden" value={organizationId} />
          <input name="leadId" type="hidden" value={leadId} />
          <input name="kind" type="hidden" value={kind} />
          <input name="requestId" ref={requestIdRef} type="hidden" />
          <input name="dueAt" ref={dueAtRef} type="hidden" />
          <label>
            Nazwa
            <Input
              defaultValue={isContact ? "Kontakt wstępny" : "Następne działanie"}
              maxLength={160}
              minLength={2}
              name="title"
              required
            />
          </label>
          <label>
            Termin
            <Input name="dueAtLocal" ref={dueAtLocalRef} required type="datetime-local" />
          </label>
          <label>
            Osoba odpowiedzialna
            <Select defaultValue={currentUserId} name="assignedTo">
              {members.map((member) => (
                <option key={member.userId} value={member.userId}>
                  {member.name}
                </option>
              ))}
            </Select>
          </label>
          <label>
            Szczegóły <span>opcjonalne</span>
            <Textarea maxLength={2000} name="description" rows={3} />
          </label>
          <ActionMessage state={state} />
          <div className="lead-task-dialog__actions">
            <Button onClick={() => dialogRef.current?.close()} type="button" variant="secondary">
              Anuluj
            </Button>
            <Button disabled={pending} loading={pending} type="submit">
              {isContact ? "Zaplanuj kontakt" : "Utwórz zadanie"}
            </Button>
          </div>
        </form>
      </dialog>
    </>
  );
}

function LeadTaskCloseForm({
  leadId,
  onClosed,
  organizationId,
  taskId,
}: Readonly<{
  leadId: string;
  onClosed: (taskId: string) => void;
  organizationId: string;
  taskId: string;
}>) {
  const [state, action, pending] = useActionState(closeLeadTaskAction, initialState);
  useEffect(() => {
    if (!state.success || !state.closedTaskId) return;
    onClosed(state.closedTaskId);
  }, [onClosed, state]);
  return (
    <form action={action} className="lead-operations__close-task">
      <input name="organizationId" type="hidden" value={organizationId} />
      <input name="leadId" type="hidden" value={leadId} />
      <input name="taskId" type="hidden" value={taskId} />
      <button
        aria-label="Oznacz działanie jako wykonane"
        disabled={pending}
        name="taskStatus"
        title="Oznacz jako wykonane"
        type="submit"
        value="completed"
      >
        <PanelIcon name="check" />
      </button>
      <button
        aria-label="Anuluj działanie"
        disabled={pending}
        name="taskStatus"
        title="Anuluj działanie"
        type="submit"
        value="cancelled"
      >
        <PanelIcon name="close" />
      </button>
      <ActionMessage state={state} />
    </form>
  );
}

function ActionMessage({ state }: Readonly<{ state: LeadActionState }>) {
  if (!state.error && !state.success) return null;
  return (
    <p className={state.error ? "lead-action-error" : "lead-action-success"} role="status">
      {state.error ?? state.success}
    </p>
  );
}

function useRefreshAfterSuccess(state: LeadActionState): void {
  const router = useRouter();
  useEffect(() => {
    if (!state.success) return;
    const refreshTimeout = window.setTimeout(() => router.refresh(), 250);
    return () => window.clearTimeout(refreshTimeout);
  }, [router, state]);
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Europe/Warsaw",
  }).format(new Date(value));
}

function initials(value: string): string {
  return (
    value
      .trim()
      .split(/\s+|@/)
      .slice(0, 2)
      .map((part) => part[0]?.toLocaleUpperCase("pl-PL") ?? "")
      .join("") || "U"
  );
}
