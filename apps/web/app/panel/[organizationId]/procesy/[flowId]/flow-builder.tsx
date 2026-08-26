"use client";

import { Button, Dialog } from "@wyceno/ui";
import { flowPresentationIconKeys, type FlowPresentationIcon } from "@wyceno/validation";
import type {
  FlowDocument,
  FlowRule,
  FlowSection,
  FlowStep,
  FlowStepValidation,
  WidgetManifestContract,
} from "@wyceno/validation";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent,
  type SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  changeFlowEditorHistory,
  createFlowEditorHistory,
  flowEditorSnapshotSignature,
  redoFlowEditorHistory,
  undoFlowEditorHistory,
  type FlowEditorSnapshot,
} from "../../../../../lib/flows/editor-history";
import {
  listEstimationReferencesForOption,
  listEstimationReferencesForStep,
  removeEstimationQuantityReferencesForStep,
  removeEstimationReferencesForOption,
  removeEstimationReferencesForStep,
  type EstimationReference,
} from "../../../../../lib/flows/editor-estimation";
import {
  reorderFlowOption,
  type FlowOptionDropEdge,
} from "../../../../../lib/flows/editor-options";
import {
  reorderFlowQuestion,
  type FlowQuestionDropEdge,
} from "../../../../../lib/flows/editor-reorder";
import {
  addFlowQuestionToSection,
  addFlowSection,
  removeFlowSection,
  renameFlowSection,
  reorderFlowSection,
} from "../../../../../lib/flows/editor-sections";
import {
  validateFlowEditor,
  type FlowEditorIssue,
} from "../../../../../lib/flows/editor-validation";
import { LatestTaskQueue } from "../../../../../lib/flows/latest-task-queue";
import type { FlowMediaAsset } from "../../../../../lib/flows/media";
import { PanelIcon } from "../../../panel-icon";
import {
  type FlowActionState,
  publishFlowDraftRequestAction,
  saveFlowDraftRequestAction,
} from "../actions";
import {
  EstimationEditorWorkspace,
  FlowBuilderAreaTabs,
  type FlowBuilderArea,
} from "./estimation-editor";
import { ContextConfigurationEditor } from "./context-configuration-editor";
import { FlowPreview } from "./instalacja/flow-preview";

type BuilderMode = "inspector" | "preview" | "questions";
const builderPaneIds: Record<BuilderMode, string> = {
  inspector: "builder-inspector-panel",
  preview: "builder-preview-panel",
  questions: "builder-questions-panel",
};
type BuilderSaveStatus =
  "conflict" | "dirty" | "error" | "invalid" | "publishing" | "saved" | "saving";

type FlowSavePayload = Readonly<{
  document: FlowDocument;
  name: string;
  signature: string;
}>;

type PendingEstimationImpact =
  | Readonly<{
      action: "change_type";
      nextType: FlowStep["type"];
      references: readonly EstimationReference[];
      stepKey: string;
      targetLabel: string;
    }>
  | Readonly<{
      action: "remove_option";
      optionKey: string;
      references: readonly EstimationReference[];
      stepKey: string;
      targetLabel: string;
    }>
  | Readonly<{
      action: "remove_question";
      references: readonly EstimationReference[];
      stepKey: string;
      targetLabel: string;
    }>;

function buildDraftPreviewManifest(
  document: FlowDocument,
  publicId: string,
): WidgetManifestContract {
  return {
    challenge: null,
    entryStepKey: document.entryStepKey,
    experienceMode: document.experienceMode,
    intro: document.intro,
    leadCapture: document.leadCapture
      ? {
          contactPolicy:
            document.leadCapture.leadCaptureSchemaVersion === 2
              ? document.leadCapture.contactPolicy
              : "email_required",
          filesEnabled: document.leadCapture.filesEnabled,
          ...(document.leadCapture.leadCaptureSchemaVersion === 3
            ? {
                completionOrder: document.leadCapture.completionOrder,
                fields: document.leadCapture.fields,
                leadCaptureSchemaVersion: 3 as const,
              }
            : { leadCaptureSchemaVersion: 2 as const }),
          marketingEmailConsent: document.leadCapture.marketingEmailConsent ?? null,
          privacyNotice: {
            ...document.leadCapture.privacyNotice,
            policyUrl: document.leadCapture.privacyNotice.policyUrl ?? null,
          },
        }
      : null,
    manifestVersion: 3,
    publicId,
    publishedAt: "2026-08-25T00:00:00.000Z",
    result: document.result,
    rules: document.rules,
    snapshotHash: "0".repeat(64),
    steps: document.steps.map((step) => ({
      allowUnknown: step.allowUnknown,
      description: step.description ?? null,
      key: step.key,
      nextStepKey: step.nextStepKey,
      options: step.options.map((option) => ({
        key: option.key,
        label: option.label,
        nextStepKey: option.nextStepKey ?? step.nextStepKey,
        overridesNextStep: option.nextStepKey !== undefined,
        presentation: option.presentation ?? null,
      })),
      presentation: step.presentation,
      required: step.required,
      title: step.title,
      type: step.type,
      validation: step.validation ?? null,
    })),
    title: document.title,
  };
}

export function FlowBuilder({
  canPublish,
  initialDocument,
  initialMediaAssets,
  initialName,
  initialRevision,
  organizationId,
  flowId,
}: Readonly<{
  canPublish: boolean;
  initialDocument: FlowDocument;
  initialMediaAssets: readonly FlowMediaAsset[];
  initialName: string;
  initialRevision: number;
  organizationId: string;
  flowId: string;
}>) {
  const router = useRouter();
  const initialSnapshot = useMemo<FlowEditorSnapshot>(
    () => ({ document: initialDocument, name: initialName }),
    [initialDocument, initialName],
  );
  const initialSignature = useMemo(
    () => flowEditorSnapshotSignature(initialSnapshot),
    [initialSnapshot],
  );
  const [history, setHistory] = useState(() => createFlowEditorHistory(initialSnapshot));
  const [mediaAssets, setMediaAssets] = useState<readonly FlowMediaAsset[]>(initialMediaAssets);
  const [mediaUploadError, setMediaUploadError] = useState<string | null>(null);
  const [mediaUploading, setMediaUploading] = useState(false);
  const [activeStepKey, setActiveStepKey] = useState(initialDocument.entryStepKey);
  const [builderArea, setBuilderArea] = useState<FlowBuilderArea>("form");
  const [mode, setMode] = useState<BuilderMode>("questions");
  const [inspectorOpen, setInspectorOpen] = useState(true);
  const [revision, setRevision] = useState(initialRevision);
  const [savedSignature, setSavedSignature] = useState(initialSignature);
  const [saveStatus, setSaveStatus] = useState<BuilderSaveStatus>("saved");
  const [actionState, setActionState] = useState<FlowActionState | null>(null);
  const [confirmReload, setConfirmReload] = useState(false);
  const [publishPending, setPublishPending] = useState(false);
  const [draggedStepKey, setDraggedStepKey] = useState<string | null>(null);
  const [dropIndicator, setDropIndicator] = useState<{
    edge: FlowQuestionDropEdge;
    stepKey: string;
  } | null>(null);
  const [draggedOptionKey, setDraggedOptionKey] = useState<string | null>(null);
  const [optionDropIndicator, setOptionDropIndicator] = useState<{
    edge: FlowOptionDropEdge;
    optionKey: string;
  } | null>(null);
  const [reorderAnnouncement, setReorderAnnouncement] = useState("");
  const [collapsedSectionKeys, setCollapsedSectionKeys] = useState<Set<string>>(() => new Set());
  const [editingSectionKey, setEditingSectionKey] = useState<string | null>(null);
  const [editingSectionTitle, setEditingSectionTitle] = useState("");
  const [pendingSectionDeletion, setPendingSectionDeletion] = useState<string | null>(null);
  const [pendingEstimationImpact, setPendingEstimationImpact] =
    useState<PendingEstimationImpact | null>(null);
  const [sectionDeleteTarget, setSectionDeleteTarget] = useState("");
  const allowUnloadRef = useRef(false);
  const sectionTitleInputRef = useRef<HTMLInputElement>(null);
  const mountedRef = useRef(true);
  const publishPendingRef = useRef(false);
  const saveQueueRef = useRef<LatestTaskQueue<FlowSavePayload, FlowActionState> | null>(null);
  const revisionRef = useRef(initialRevision);
  const savedSignatureRef = useRef(initialSignature);
  const latestPayloadRef = useRef<FlowSavePayload>({
    document: initialDocument,
    name: initialName,
    signature: initialSignature,
  });
  const lastErrorCodeRef = useRef<FlowActionState["code"]>(null);
  const { document, name } = history.present;
  const currentSignature = useMemo(
    () => flowEditorSnapshotSignature({ document, name: name.trim() }),
    [document, name],
  );
  const currentPayload = useMemo<FlowSavePayload>(
    () => ({ document, name: name.trim(), signature: currentSignature }),
    [currentSignature, document, name],
  );

  useEffect(() => {
    const saveQueue = new LatestTaskQueue<FlowSavePayload, FlowActionState>(async (payload) => {
      if (payload.signature === savedSignatureRef.current) {
        return {
          code: null,
          error: null,
          revision: revisionRef.current,
          success: "Wszystkie zmiany zapisane.",
        };
      }

      if (mountedRef.current) {
        setSaveStatus("saving");
        setActionState(null);
      }
      const state = await saveFlowDraftRequestAction({
        document: payload.document,
        expectedDraftRevision: revisionRef.current,
        flowId,
        name: payload.name,
        organizationId,
      });
      if (state.error || state.revision === null) {
        lastErrorCodeRef.current = state.code;
        if (mountedRef.current) {
          setActionState(state);
          setSaveStatus(state.code === "CONFLICT" ? "conflict" : "error");
        }
        throw state;
      }

      revisionRef.current = state.revision;
      savedSignatureRef.current = payload.signature;
      lastErrorCodeRef.current = null;
      if (mountedRef.current) {
        setActionState(state);
        setRevision(state.revision);
        setSavedSignature(payload.signature);
        setSaveStatus(latestPayloadRef.current.signature === payload.signature ? "saved" : "dirty");
      }
      return state;
    });
    saveQueueRef.current = saveQueue;
    return () => {
      if (saveQueueRef.current === saveQueue) saveQueueRef.current = null;
    };
  }, [flowId, organizationId]);

  const activeIndex = Math.max(
    0,
    document.steps.findIndex((step) => step.key === activeStepKey),
  );
  const activeStep: FlowStep =
    document.steps[activeIndex] ?? document.steps[0] ?? initialDocument.steps[0]!;
  const questionSections = buildQuestionSections(document);
  const pendingDeleteSection = pendingSectionDeletion
    ? document.sections.find((section) => section.key === pendingSectionDeletion)
    : undefined;
  const pendingDeleteQuestionCount = pendingSectionDeletion
    ? document.steps.filter((step) => step.sectionKey === pendingSectionDeletion).length
    : 0;
  const editorValidation = useMemo(() => validateFlowEditor(document, name), [document, name]);
  const experienceIssues = editorValidation.issues.filter((issue) => issue.field === "experience");
  const previewBlockingIssues = editorValidation.issues.filter(
    (issue) => issue.field !== "graph" && issue.field !== "name",
  );
  const previewManifest = useMemo(
    () => buildDraftPreviewManifest(document, flowId),
    [document, flowId],
  );
  const previewAssetUrls = useMemo(
    () => Object.fromEntries(mediaAssets.map((asset) => [asset.id, asset.previewUrl])),
    [mediaAssets],
  );
  const canSave = editorValidation.canSave;
  const canPublishCurrent = editorValidation.canPublish;
  const activeStepIssues = editorValidation.issues.filter(
    (issue) => issue.stepKey === activeStep.key,
  );
  const saveBlockingIssue = editorValidation.issues.find((issue) => issue.field !== "graph");
  const nameIssue = editorValidation.issues.find((issue) => issue.field === "name");
  const displayedSaveStatus: BuilderSaveStatus = publishPending
    ? "publishing"
    : !canSave && currentSignature !== savedSignature
      ? "invalid"
      : currentSignature === savedSignature && saveStatus === "dirty"
        ? "saved"
        : saveStatus;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    latestPayloadRef.current = currentPayload;
  }, [currentPayload]);

  useEffect(() => {
    if (!editingSectionKey) return;
    sectionTitleInputRef.current?.focus();
    sectionTitleInputRef.current?.select();
  }, [editingSectionKey]);

  useEffect(() => {
    if (currentSignature === savedSignature || !canSave) return;
    const timeout = window.setTimeout(() => {
      const saveQueue = saveQueueRef.current;
      if (!saveQueue) return;
      if (saveQueue.isHalted()) {
        if (lastErrorCodeRef.current === "CONFLICT") return;
        saveQueue.reset();
      }
      void saveQueue.enqueue(currentPayload).catch(() => undefined);
    }, 900);
    return () => window.clearTimeout(timeout);
  }, [canSave, currentPayload, currentSignature, savedSignature]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (allowUnloadRef.current || currentSignature === savedSignature) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [currentSignature, savedSignature]);

  const setDocument = (update: SetStateAction<FlowDocument>, group?: string) => {
    setSaveStatus("dirty");
    setHistory((current) => {
      const nextDocument = typeof update === "function" ? update(current.present.document) : update;
      return changeFlowEditorHistory(
        current,
        { document: nextDocument, name: current.present.name },
        group ? { group } : {},
      );
    });
  };

  const setName = (nextName: string) => {
    setSaveStatus("dirty");
    setHistory((current) =>
      changeFlowEditorHistory(
        current,
        { document: current.present.document, name: nextName },
        { group: "flow-name" },
      ),
    );
  };

  const updateActiveStep = (nextStep: FlowStep, group?: string) => {
    setDocument(
      (current) => ({
        ...current,
        steps: current.steps.map((step) => (step.key === activeStep.key ? nextStep : step)),
      }),
      group,
    );
  };

  const linearizeQuickForm = () => {
    setDocument((current) => ({
      ...current,
      entryStepKey: current.steps[0]?.key ?? current.entryStepKey,
      rules: [],
      steps: current.steps.map((step, index) => ({
        ...step,
        nextStepKey: current.steps[index + 1]?.key ?? null,
        options: step.options.map((option) => {
          const linearOption = { ...option };
          delete linearOption.nextStepKey;
          return linearOption;
        }),
      })),
    }));
  };

  const selectExperienceMode = (experienceMode: FlowDocument["experienceMode"]) => {
    setDocument((current) => ({ ...current, experienceMode }));
  };

  const handleExperienceModeKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!["ArrowDown", "ArrowLeft", "ArrowRight", "ArrowUp", "End", "Home"].includes(event.key)) {
      return;
    }
    const options = Array.from(
      event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="radio"]') ??
        [],
    );
    const currentIndex = options.indexOf(event.currentTarget);
    if (currentIndex < 0 || options.length === 0) return;
    let nextIndex = currentIndex;
    if (["ArrowDown", "ArrowRight"].includes(event.key)) {
      nextIndex = (currentIndex + 1) % options.length;
    }
    if (["ArrowLeft", "ArrowUp"].includes(event.key)) {
      nextIndex = (currentIndex - 1 + options.length) % options.length;
    }
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = options.length - 1;
    const next = options[nextIndex];
    if (!next) return;
    const experienceMode = next.dataset.experienceMode;
    if (experienceMode !== "guided_brief" && experienceMode !== "quick_form") return;
    event.preventDefault();
    selectExperienceMode(experienceMode);
    next.focus();
  };

  const selectBuilderPane = (nextMode: BuilderMode) => {
    if (nextMode === "inspector") setInspectorOpen(true);
    setMode(nextMode);
  };

  const handleBuilderPaneKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!["ArrowLeft", "ArrowRight", "End", "Home"].includes(event.key)) return;
    const tabs = Array.from(
      event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ?? [],
    );
    const currentIndex = tabs.indexOf(event.currentTarget);
    if (currentIndex < 0 || tabs.length === 0) return;
    let nextIndex = currentIndex;
    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % tabs.length;
    if (event.key === "ArrowLeft") {
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    }
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = tabs.length - 1;
    const next = tabs[nextIndex];
    if (!next) return;
    const nextMode = next.dataset.builderMode as BuilderMode | undefined;
    if (!nextMode || !builderPaneIds[nextMode]) return;
    event.preventDefault();
    selectBuilderPane(nextMode);
    next.focus();
  };

  return (
    <div className="flow-builder flow-builder--m7" data-layout-region="builder">
      <header className="flow-builder__toolbar" data-layout-region="builder-toolbar">
        <div className="flow-builder__identity" data-no-overlap="builder-toolbar-actions">
          <Link
            aria-label="Wróć do procesów"
            className="panel-icon-action"
            href={`/panel/${organizationId}/procesy`}
            onClick={(event) => handleSafeNavigation(event, `/panel/${organizationId}/procesy`)}
          >
            <PanelIcon name="menu" />
          </Link>
          <label>
            <span className="wy-sr-only">Nazwa procesu</span>
            <input
              aria-describedby={nameIssue ? "flow-name-error" : undefined}
              aria-invalid={nameIssue ? true : undefined}
              disabled={publishPending}
              maxLength={160}
              onChange={(event) => setName(event.currentTarget.value)}
              value={name}
            />
            {nameIssue ? (
              <small className="wy-sr-only" id="flow-name-error">
                {nameIssue.message}
              </small>
            ) : null}
          </label>
          <span className="panel-status panel-status--neutral">Szkic · r{revision}</span>
        </div>
        <div
          aria-live="polite"
          className="flow-builder__save-state"
          data-state={displayedSaveStatus}
        >
          <span className="panel-check" aria-hidden="true">
            <PanelIcon name="check" />
          </span>
          <span>
            {builderSaveStatusLabel(displayedSaveStatus, actionState, saveBlockingIssue?.message)}
          </span>
          {displayedSaveStatus === "error" ? (
            <button
              onClick={actionState?.code === "PUBLISH_FAILED" ? publishCurrentDraft : retrySave}
              type="button"
            >
              Ponów
            </button>
          ) : displayedSaveStatus === "conflict" ? (
            confirmReload ? (
              <>
                <button
                  onClick={() => {
                    allowUnloadRef.current = true;
                    window.location.reload();
                  }}
                  type="button"
                >
                  Potwierdź
                </button>
                <button onClick={() => setConfirmReload(false)} type="button">
                  Anuluj
                </button>
              </>
            ) : (
              <button onClick={() => setConfirmReload(true)} type="button">
                Wczytaj aktualną wersję
              </button>
            )
          ) : null}
        </div>
        <div className="flow-builder__actions" data-no-overlap="builder-toolbar-identity">
          <button
            className="panel-secondary-button flow-builder__undo-action"
            disabled={publishPending || history.past.length === 0}
            onClick={undoCurrentChange}
            type="button"
          >
            <PanelIcon name="undo" />
            Cofnij
          </button>
          <button
            aria-label="Ponów zmianę"
            className="panel-secondary-button flow-builder__redo-action"
            disabled={publishPending || history.future.length === 0}
            onClick={redoCurrentChange}
            type="button"
          >
            Ponów
          </button>
          <button
            aria-pressed={mode === "preview"}
            className="panel-secondary-button flow-builder__preview-action"
            onClick={() => setMode("preview")}
            type="button"
          >
            Podgląd
          </button>
          {canPublish ? (
            <div className="flow-builder__publish-split">
              <button
                aria-label={
                  displayedSaveStatus === "publishing" ? "Publikowanie procesu" : "Opublikuj proces"
                }
                className="panel-primary-button"
                disabled={publishPending || displayedSaveStatus === "saving" || !canPublishCurrent}
                onClick={publishCurrentDraft}
                type="button"
              >
                <span aria-hidden="true" className="flow-builder__publish-label--full">
                  {displayedSaveStatus === "publishing" ? "Publikuję…" : "Opublikuj proces"}
                </span>
                <span aria-hidden="true" className="flow-builder__publish-label--mobile">
                  {displayedSaveStatus === "publishing" ? "Publikuję…" : "Opublikuj"}
                </span>
              </button>
              <details>
                <summary aria-label="Więcej opcji publikacji">
                  <PanelIcon name="chevron-down" />
                </summary>
                <div>
                  <button
                    disabled={publishPending || displayedSaveStatus === "saving" || !canSave}
                    onClick={(event) => {
                      void saveNow();
                      event.currentTarget.closest("details")?.removeAttribute("open");
                    }}
                    type="button"
                  >
                    {displayedSaveStatus === "saving" ? "Zapisuję…" : "Zapisz teraz"}
                  </button>
                  <button
                    className="flow-builder__mobile-history-action"
                    disabled={publishPending || history.past.length === 0}
                    onClick={(event) => {
                      undoCurrentChange();
                      event.currentTarget.closest("details")?.removeAttribute("open");
                    }}
                    type="button"
                  >
                    Cofnij zmianę
                  </button>
                  <button
                    className="flow-builder__mobile-history-action"
                    disabled={publishPending || history.future.length === 0}
                    onClick={(event) => {
                      redoCurrentChange();
                      event.currentTarget.closest("details")?.removeAttribute("open");
                    }}
                    type="button"
                  >
                    Ponów zmianę
                  </button>
                  <Link
                    href={`/panel/${organizationId}/procesy/${flowId}/instalacja`}
                    onClick={(event) =>
                      handleSafeNavigation(
                        event,
                        `/panel/${organizationId}/procesy/${flowId}/instalacja`,
                      )
                    }
                  >
                    Podgląd i udostępnianie
                  </Link>
                  <Link
                    href={`/panel/${organizationId}/procesy`}
                    onClick={(event) =>
                      handleSafeNavigation(event, `/panel/${organizationId}/procesy`)
                    }
                  >
                    Wróć do procesów
                  </Link>
                </div>
              </details>
            </div>
          ) : (
            <button
              className="panel-primary-button"
              disabled={publishPending || displayedSaveStatus === "saving" || !canSave}
              onClick={() => void saveNow()}
              type="button"
            >
              {displayedSaveStatus === "saving" ? "Zapisuję…" : "Zapisz teraz"}
            </button>
          )}
        </div>
      </header>

      <FlowBuilderAreaTabs
        area={builderArea}
        className="flow-builder__area-tabs--primary"
        onChange={selectBuilderArea}
      />

      <div
        aria-label="Widok edytora"
        className="flow-builder__mobile-tabs panel-segmented-track"
        role="tablist"
      >
        {[
          [
            "questions",
            builderArea === "form" ? "Pytania" : builderArea === "result" ? "Elementy" : "Reguły",
          ],
          ["preview", "Podgląd"],
          ["inspector", "Ustawienia"],
        ].map(([value, label]) => (
          <button
            aria-controls={builderPaneIds[value as BuilderMode]}
            aria-selected={mode === value}
            data-builder-mode={value}
            id={`builder-pane-tab-${value}`}
            key={value}
            onClick={() => selectBuilderPane(value as BuilderMode)}
            onKeyDown={handleBuilderPaneKeyDown}
            role="tab"
            tabIndex={mode === value ? 0 : -1}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>
      <p className="wy-sr-only" id="builder-option-reorder-instructions">
        Aby zmienić kolejność opcji klawiaturą, ustaw fokus na uchwycie i użyj Alt oraz strzałki w
        górę lub w dół. Na ekranie dotykowym użyj menu akcji opcji.
      </p>
      <p aria-live="polite" className="wy-sr-only" role="status">
        {reorderAnnouncement}
      </p>

      <div
        aria-labelledby={`builder-area-tab-${builderArea}`}
        className={`flow-builder__grid ${inspectorOpen ? "" : "is-inspector-closed"}`}
        id="builder-workspace-panel"
        inert={publishPending ? true : undefined}
        role="tabpanel"
      >
        <aside
          aria-label="Sekcje i pytania"
          className={`flow-builder__questions ${mode === "questions" ? "is-mobile-active" : ""}`}
          data-layout-region="builder-questions"
          hidden={builderArea !== "form"}
          id={builderArea === "form" ? "builder-questions-panel" : undefined}
        >
          <section aria-labelledby="experience-mode-title" className="builder-experience-mode">
            <div>
              <h2 id="experience-mode-title">Sposób wypełniania</h2>
              <p>Wybierz układ odpowiedni do długości i logiki procesu.</p>
            </div>
            <div
              className="builder-experience-mode__choices panel-segmented-track panel-segmented-track--descriptive"
              aria-labelledby="experience-mode-title"
              role="radiogroup"
            >
              <button
                aria-checked={document.experienceMode === "guided_brief"}
                data-experience-mode="guided_brief"
                onClick={() => selectExperienceMode("guided_brief")}
                onKeyDown={handleExperienceModeKeyDown}
                role="radio"
                tabIndex={document.experienceMode === "guided_brief" ? 0 : -1}
                type="button"
              >
                <strong>Prowadzony brief</strong>
                <span>Jedno pytanie na ekranie, także dla procesów z rozgałęzieniami.</span>
              </button>
              <button
                aria-checked={document.experienceMode === "quick_form"}
                data-experience-mode="quick_form"
                onClick={() => selectExperienceMode("quick_form")}
                onKeyDown={handleExperienceModeKeyDown}
                role="radio"
                tabIndex={document.experienceMode === "quick_form" ? 0 : -1}
                type="button"
              >
                <strong>Krótki formularz</strong>
                <span>Wszystkie pytania na jednej stronie; maks. 8 i bez rozgałęzień.</span>
              </button>
            </div>
            {experienceIssues.length > 0 ? (
              <div className="builder-experience-mode__conflict" role="alert">
                <strong>Ten proces nie jest jeszcze zgodny z krótkim formularzem.</strong>
                <ul>
                  {experienceIssues.map((issue) => (
                    <li key={issue.id}>{issue.message}</li>
                  ))}
                </ul>
                <button onClick={linearizeQuickForm} type="button">
                  Usuń rozgałęzienia i ustaw kolejność liniową
                </button>
                <small>Ta akcja usuwa reguły przejść, ale nie usuwa pytań. Możesz ją cofnąć.</small>
              </div>
            ) : null}
            <p className="builder-experience-mode__future">
              Wygląd odpowiedzi ustawiasz osobno dla każdego pytania w panelu ustawień.
            </p>
          </section>
          <ContextConfigurationEditor
            onChange={(contextSchema) => setDocument((current) => ({ ...current, contextSchema }))}
            schema={document.contextSchema}
          />
          <div className="flow-builder__panel-heading">
            <div>
              <h2>Sekcje i pytania</h2>
              <p>{document.steps.length} kroków</p>
            </div>
            <button
              className="panel-text-button"
              disabled={document.sections.length >= 20 || document.steps.length >= 40}
              onClick={addSection}
              title={
                document.sections.length >= 20
                  ? "Proces może zawierać maksymalnie 20 sekcji."
                  : document.steps.length >= 40
                    ? "Proces może zawierać maksymalnie 40 pytań."
                    : undefined
              }
              type="button"
            >
              <span aria-hidden="true">＋</span> Sekcja
            </button>
          </div>
          <p className="wy-sr-only" id="builder-reorder-instructions">
            Aby zmienić kolejność klawiaturą, ustaw fokus na uchwycie i użyj Alt oraz strzałki w
            górę lub w dół.
          </p>
          <p className="wy-sr-only" id="builder-section-reorder-instructions">
            Aby zmienić kolejność sekcji klawiaturą, ustaw fokus na przycisku sekcji i użyj Alt oraz
            strzałki w górę lub w dół.
          </p>
          {editorValidation.issues.length > 0 ? (
            <button
              className="builder-validation-overview"
              onClick={focusFirstValidationIssue}
              type="button"
            >
              <PanelIcon name="warning" />
              <span>
                <strong>
                  {editorValidation.issues.length}{" "}
                  {polishIssueCountLabel(editorValidation.issues.length)}
                </strong>
                <small>Przejdź do pierwszego miejsca wymagającego poprawy</small>
              </span>
            </button>
          ) : null}
          <div className="question-section">
            {questionSections.map((section, sectionIndex) => {
              const collapsed = collapsedSectionKeys.has(section.key);
              const questionListId = `section-questions-${section.key}`;
              const sectionHasIssue = editorValidation.issues.some(
                (issue) => issue.sectionKey === section.key && issue.stepKey === null,
              );
              return (
                <section
                  className={[
                    "question-section__group",
                    collapsed ? "is-collapsed" : "",
                    sectionHasIssue ? "has-error" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  data-section-key={section.key}
                  key={section.key}
                >
                  <div className="question-section__heading">
                    <button
                      aria-controls={questionListId}
                      aria-describedby="builder-section-reorder-instructions"
                      aria-expanded={!collapsed}
                      aria-label={`${collapsed ? "Rozwiń" : "Zwiń"} sekcję „${section.title}”. Pozycja ${sectionIndex + 1} z ${document.sections.length}.`}
                      className="question-section__toggle"
                      data-section-toggle={section.key}
                      onClick={() => toggleSection(section.key)}
                      onKeyDown={(event) =>
                        handleSectionReorderKeyDown(event, section.key, sectionIndex)
                      }
                      type="button"
                    >
                      <PanelIcon name="chevron-down" />
                      <span>{sectionIndex + 1}</span>
                    </button>
                    {editingSectionKey === section.key ? (
                      <form
                        className="question-section__rename"
                        onSubmit={(event) => submitSectionRename(event, section.key)}
                      >
                        <label className="wy-sr-only" htmlFor={`section-title-${section.key}`}>
                          Nazwa sekcji
                        </label>
                        <input
                          id={`section-title-${section.key}`}
                          maxLength={120}
                          onChange={(event) => setEditingSectionTitle(event.currentTarget.value)}
                          onKeyDown={(event) => {
                            if (event.key === "Escape") {
                              event.preventDefault();
                              cancelSectionRename(section.key);
                            }
                          }}
                          ref={sectionTitleInputRef}
                          value={editingSectionTitle}
                        />
                        <button
                          aria-label={`Zapisz nazwę sekcji „${section.title}”`}
                          disabled={editingSectionTitle.trim().length === 0}
                          type="submit"
                        >
                          <PanelIcon name="check" />
                        </button>
                        <button
                          aria-label={`Anuluj zmianę nazwy sekcji „${section.title}”`}
                          onClick={() => cancelSectionRename(section.key)}
                          type="button"
                        >
                          <PanelIcon name="close" />
                        </button>
                      </form>
                    ) : (
                      <strong className="question-section__title">{section.title}</strong>
                    )}
                    <span
                      aria-label={`${section.steps.length} ${section.steps.length === 1 ? "pytanie" : "pytań"}`}
                      className="question-section__count"
                      title={
                        sectionHasIssue ? "Sekcja wymaga co najmniej jednego pytania." : undefined
                      }
                    >
                      {sectionHasIssue ? <PanelIcon name="warning" /> : section.steps.length}
                    </span>
                    <details className="question-section__actions">
                      <summary
                        aria-label={`Akcje sekcji „${section.title}”`}
                        data-section-actions={section.key}
                      >
                        ⋮
                      </summary>
                      <div>
                        <button
                          onClick={(event) => {
                            startSectionRename(section.key, section.title);
                            event.currentTarget.closest("details")?.removeAttribute("open");
                          }}
                          type="button"
                        >
                          Zmień nazwę
                        </button>
                        <button
                          disabled={sectionIndex === 0}
                          onClick={(event) => {
                            moveSection(section.key, -1, true);
                            event.currentTarget.closest("details")?.removeAttribute("open");
                          }}
                          type="button"
                        >
                          Przenieś wyżej
                        </button>
                        <button
                          disabled={sectionIndex === document.sections.length - 1}
                          onClick={(event) => {
                            moveSection(section.key, 1, true);
                            event.currentTarget.closest("details")?.removeAttribute("open");
                          }}
                          type="button"
                        >
                          Przenieś niżej
                        </button>
                        <button
                          className="is-danger"
                          disabled={document.sections.length <= 1}
                          onClick={(event) => {
                            openSectionDeletion(section.key);
                            event.currentTarget.closest("details")?.removeAttribute("open");
                          }}
                          type="button"
                        >
                          Usuń sekcję
                        </button>
                      </div>
                    </details>
                  </div>
                  <ol className="question-list" hidden={collapsed} id={questionListId}>
                    {section.steps.map(({ index, step }, itemIndex) => {
                      const hasIssue = editorValidation.issues.some(
                        (issue) => issue.stepKey === step.key,
                      );
                      const dropClass =
                        dropIndicator?.stepKey === step.key ? `is-drop-${dropIndicator.edge}` : "";
                      return (
                        <li
                          className={[
                            step.key === activeStep.key ? "is-active" : "",
                            step.key === draggedStepKey ? "is-dragging" : "",
                            hasIssue ? "has-error" : "",
                            dropClass,
                          ]
                            .filter(Boolean)
                            .join(" ")}
                          key={step.key}
                          onDragLeave={(event) => {
                            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                              setDropIndicator((current) =>
                                current?.stepKey === step.key ? null : current,
                              );
                            }
                          }}
                          onDragOver={(event) => handleQuestionDragOver(event, step.key)}
                          onDrop={(event) => handleQuestionDrop(event, step.key)}
                        >
                          <button
                            aria-describedby="builder-reorder-instructions"
                            aria-label={`Przenieś pytanie „${step.title}”. Pozycja ${itemIndex + 1} z ${section.steps.length} w sekcji ${section.title}.`}
                            className="question-list__handle"
                            data-reorder-step={step.key}
                            draggable
                            onDragEnd={clearQuestionDrag}
                            onDragStart={(event) => handleQuestionDragStart(event, step.key)}
                            onKeyDown={(event) => handleQuestionReorderKeyDown(event, index)}
                            type="button"
                          >
                            <span aria-hidden="true">⋮⋮</span>
                          </button>
                          <button
                            aria-current={step.key === activeStep.key ? "step" : undefined}
                            className="question-list__select"
                            onClick={() => {
                              setActiveStepKey(step.key);
                              setInspectorOpen(true);
                              setMode("inspector");
                            }}
                            type="button"
                          >
                            <QuestionTypeIcon type={step.type} />
                            <span className="question-list__content">
                              <small>
                                {sectionIndex + 1}.{itemIndex + 1}
                              </small>
                              <strong>{step.title}</strong>
                            </span>
                            {hasIssue ? (
                              <span className="question-list__error" title="Pytanie wymaga poprawy">
                                <PanelIcon name="warning" />
                                <span className="wy-sr-only">Pytanie wymaga poprawy.</span>
                              </span>
                            ) : null}
                          </button>
                          <details className="question-list__actions">
                            <summary aria-label={`Akcje pytania „${step.title}”`}>⋮</summary>
                            <div>
                              <button
                                disabled={index === 0}
                                onClick={(event) => {
                                  moveQuestion(index, -1);
                                  event.currentTarget.closest("details")?.removeAttribute("open");
                                }}
                                type="button"
                              >
                                Przenieś wyżej
                              </button>
                              <button
                                disabled={index === document.steps.length - 1}
                                onClick={(event) => {
                                  moveQuestion(index, 1);
                                  event.currentTarget.closest("details")?.removeAttribute("open");
                                }}
                                type="button"
                              >
                                Przenieś niżej
                              </button>
                            </div>
                          </details>
                        </li>
                      );
                    })}
                  </ol>
                  {section.steps.length === 0 && !collapsed ? (
                    <div className="question-section__empty">
                      <p>Ta sekcja nie ma jeszcze pytań.</p>
                      <button
                        className="panel-text-button"
                        disabled={document.steps.length >= 40}
                        onClick={() => addQuestionToSection(section.key)}
                        type="button"
                      >
                        ＋ Dodaj pierwsze pytanie
                      </button>
                    </div>
                  ) : null}
                </section>
              );
            })}
          </div>
          <button
            className="flow-builder__add-question"
            disabled={document.steps.length >= 40}
            onClick={addQuestion}
            type="button"
          >
            ＋ Dodaj pytanie
          </button>
        </aside>

        <section
          aria-label="Podgląd formularza"
          className={`flow-builder__preview ${mode === "preview" ? "is-mobile-active" : ""}`}
          data-layout-region="builder-preview"
          hidden={builderArea !== "form"}
          id={builderArea === "form" ? "builder-preview-panel" : undefined}
        >
          <div className="flow-builder__panel-heading">
            <div>
              <h2>Podgląd formularza</h2>
              <p>Dane nie są zapisywane w trybie podglądu.</p>
            </div>
            {!inspectorOpen ? (
              <button
                className="panel-text-button"
                onClick={() => {
                  setInspectorOpen(true);
                  setMode("inspector");
                }}
                type="button"
              >
                Ustawienia pytania
              </button>
            ) : null}
          </div>
          {previewBlockingIssues.length > 0 ? (
            <div className="flow-builder__preview-blocked" role="status">
              <PanelIcon name="warning" />
              <h3>Podgląd czeka na kompletną konfigurację</h3>
              <p>Uzupełnij oznaczone pola pytania albo popraw konflikt wybranego trybu.</p>
            </div>
          ) : (
            <FlowPreview assetUrls={previewAssetUrls} manifest={previewManifest} />
          )}
        </section>

        {builderArea === "form" && inspectorOpen ? (
          <aside
            aria-label="Ustawienia pytania"
            className={`flow-builder__inspector ${mode === "inspector" ? "is-mobile-active" : ""}`}
            data-layout-region="builder-inspector"
            id="builder-inspector-panel"
          >
            <div className="flow-builder__panel-heading">
              <div>
                <h2>Ustawienia pytania</h2>
                <p>{activeStep.key}</p>
              </div>
              <button
                aria-label="Zamknij ustawienia pytania"
                className="panel-icon-action"
                onClick={() => {
                  setInspectorOpen(false);
                  setMode("preview");
                }}
                type="button"
              >
                ×
              </button>
            </div>
            <div className="question-inspector">
              {activeStepIssues.length > 0 ? (
                <section
                  aria-labelledby="active-question-errors-title"
                  className="question-inspector__errors"
                  role="alert"
                  tabIndex={-1}
                >
                  <div>
                    <PanelIcon name="warning" />
                    <h3 id="active-question-errors-title">
                      {activeStepIssues.length} {polishIssueCountLabel(activeStepIssues.length)} w
                      tym pytaniu
                    </h3>
                  </div>
                  <ul>
                    {activeStepIssues.map((issue) => (
                      <li key={issue.id}>{issue.message}</li>
                    ))}
                  </ul>
                </section>
              ) : null}
              <label>
                <span>Treść pytania</span>
                <AutoSizeQuestionTitle
                  aria-describedby={
                    activeStepIssues.some((issue) => issue.field === "title")
                      ? "active-question-title-error"
                      : undefined
                  }
                  aria-invalid={
                    activeStepIssues.some((issue) => issue.field === "title") || undefined
                  }
                  data-editor-field="title"
                  maxLength={240}
                  onValueChange={(value) =>
                    updateActiveStep(
                      { ...activeStep, title: value },
                      `step-title:${activeStep.key}`,
                    )
                  }
                  value={activeStep.title}
                />
              </label>
              {activeStepIssues
                .filter((issue) => issue.field === "title")
                .slice(0, 1)
                .map((issue) => (
                  <small
                    className="builder-field-error"
                    id="active-question-title-error"
                    key={issue.id}
                  >
                    <PanelIcon name="warning" />
                    {issue.message}
                  </small>
                ))}
              <label>
                <span>Typ pytania</span>
                <select
                  onChange={(event) => {
                    const type = event.currentTarget.value as FlowStep["type"];
                    requestQuestionTypeChange(type);
                  }}
                  value={activeStep.type}
                >
                  {questionTypes.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="question-inspector__switch">
                <span>
                  <strong>Wymagane</strong>
                  <small>Klient musi odpowiedzieć przed przejściem dalej.</small>
                </span>
                <input
                  checked={activeStep.required}
                  onChange={(event) =>
                    updateActiveStep({ ...activeStep, required: event.currentTarget.checked })
                  }
                  type="checkbox"
                />
              </label>

              {isChoiceType(activeStep.type) ? (
                <fieldset className="question-options">
                  <legend>Opcje odpowiedzi</legend>
                  <label className="question-presentation">
                    <span>Sposób pokazania odpowiedzi</span>
                    <select
                      onChange={(event) =>
                        setChoicePresentationVariant(
                          event.currentTarget.value as
                            "default" | "icon_cards" | "image_cards" | "text_cards",
                        )
                      }
                      value={
                        activeStep.presentation.variant === "text_cards" ||
                        activeStep.presentation.variant === "icon_cards" ||
                        activeStep.presentation.variant === "image_cards"
                          ? activeStep.presentation.variant
                          : "default"
                      }
                    >
                      <option value="default">Lista odpowiedzi</option>
                      <option value="text_cards">Karty z opisem</option>
                      <option value="icon_cards">Karty z ikoną</option>
                      <option value="image_cards">Karty ze zdjęciem firmy</option>
                    </select>
                    <small>
                      Zdjęcie służy decyzji wizualnej; nazwa odpowiedzi pozostaje obowiązkowa.
                    </small>
                  </label>
                  {activeStep.presentation.variant === "image_cards" ? (
                    <div className="question-media-library">
                      <div>
                        <strong>Biblioteka tego konta</strong>
                        <span>JPEG, PNG lub WebP, maks. 5 MiB; zapis jako bezpieczny WebP.</span>
                      </div>
                      <label className="panel-secondary-button">
                        {mediaUploading ? "Przetwarzanie…" : "Dodaj własne zdjęcie"}
                        <input
                          accept="image/jpeg,image/png,image/webp"
                          disabled={mediaUploading}
                          onChange={uploadFlowMedia}
                          type="file"
                        />
                      </label>
                      {mediaUploadError ? <p role="alert">{mediaUploadError}</p> : null}
                    </div>
                  ) : null}
                  {activeStep.options.map((option, index) => {
                    const dropClass =
                      optionDropIndicator?.optionKey === option.key
                        ? `is-drop-${optionDropIndicator.edge}`
                        : "";
                    const accessibleLabel = option.label || `Opcja ${index + 1}`;
                    return (
                      <div
                        className={[
                          "question-options__row",
                          option.key === draggedOptionKey ? "is-dragging" : "",
                          dropClass,
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        data-option-row={option.key}
                        key={option.key}
                        onDragLeave={(event) => {
                          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                            setOptionDropIndicator((current) =>
                              current?.optionKey === option.key ? null : current,
                            );
                          }
                        }}
                        onDragOver={(event) => handleOptionDragOver(event, option.key)}
                        onDrop={(event) => handleOptionDrop(event, option.key)}
                      >
                        <button
                          aria-describedby="builder-option-reorder-instructions"
                          aria-label={`Przenieś opcję „${accessibleLabel}”. Pozycja ${index + 1} z ${activeStep.options.length}.`}
                          className="question-options__handle"
                          data-reorder-option={option.key}
                          draggable
                          onDragEnd={clearOptionDrag}
                          onDragStart={(event) => handleOptionDragStart(event, option.key)}
                          onKeyDown={(event) => handleOptionReorderKeyDown(event, index)}
                          type="button"
                        >
                          <span aria-hidden="true">⋮⋮</span>
                        </button>
                        <span className="question-options__radio" aria-hidden="true" />
                        <input
                          aria-label={`Opcja ${index + 1}`}
                          aria-invalid={
                            activeStepIssues.some(
                              (issue) =>
                                issue.field === "option" &&
                                (issue.optionIndex === null || issue.optionIndex === index),
                            ) || undefined
                          }
                          data-editor-field={`option-${index}`}
                          maxLength={160}
                          onChange={(event) =>
                            updateOption(
                              index,
                              { ...option, label: event.currentTarget.value },
                              `option-label:${activeStep.key}:${option.key}`,
                            )
                          }
                          value={option.label}
                        />
                        <button
                          aria-label={`Usuń opcję ${accessibleLabel}`}
                          className="question-options__remove"
                          disabled={activeStep.options.length <= 2}
                          onClick={() => removeOption(index)}
                          type="button"
                        >
                          ×
                        </button>
                        {activeStep.presentation.variant === "text_cards" ? (
                          <label className="question-options__description">
                            <span>Opis karty „{accessibleLabel}”</span>
                            <textarea
                              aria-invalid={
                                activeStepIssues.some(
                                  (issue) =>
                                    issue.field === "presentation" &&
                                    (issue.optionIndex === null || issue.optionIndex === index),
                                ) || undefined
                              }
                              data-editor-field={`presentation-${index}`}
                              maxLength={180}
                              onChange={(event) =>
                                updateOption(
                                  index,
                                  {
                                    ...option,
                                    presentation: {
                                      description: event.currentTarget.value,
                                    },
                                  },
                                  `option-description:${activeStep.key}:${option.key}`,
                                )
                              }
                              rows={2}
                              value={option.presentation?.description ?? ""}
                            />
                            <small>{option.presentation?.description?.length ?? 0}/180</small>
                          </label>
                        ) : null}
                        {activeStep.presentation.variant === "icon_cards" ? (
                          <label className="question-options__description">
                            <span>Ikona karty „{accessibleLabel}”</span>
                            <select
                              aria-invalid={
                                activeStepIssues.some(
                                  (issue) =>
                                    issue.field === "presentation" &&
                                    (issue.optionIndex === null || issue.optionIndex === index),
                                ) || undefined
                              }
                              data-editor-field={`presentation-${index}`}
                              onChange={(event) =>
                                updateOption(
                                  index,
                                  {
                                    ...option,
                                    presentation: {
                                      icon: event.currentTarget.value as FlowPresentationIcon,
                                    },
                                  },
                                  `option-icon:${activeStep.key}:${option.key}`,
                                )
                              }
                              value={option.presentation?.icon ?? ""}
                            >
                              <option value="">Wybierz ikonę</option>
                              {flowPresentationIconKeys.map((icon) => (
                                <option key={icon} value={icon}>
                                  {presentationIconLabels[icon]}
                                </option>
                              ))}
                            </select>
                            <small>Zamknięty katalog — bez własnego SVG i kodu.</small>
                          </label>
                        ) : null}
                        {activeStep.presentation.variant === "image_cards" ? (
                          <div className="question-options__media">
                            <label>
                              <span>Zdjęcie karty „{accessibleLabel}”</span>
                              <select
                                aria-invalid={
                                  activeStepIssues.some(
                                    (issue) =>
                                      issue.field === "presentation" &&
                                      (issue.optionIndex === null || issue.optionIndex === index),
                                  ) || undefined
                                }
                                data-editor-field={`presentation-${index}`}
                                onChange={(event) =>
                                  updateOption(
                                    index,
                                    {
                                      ...option,
                                      presentation: event.currentTarget.value
                                        ? {
                                            asset: {
                                              alt: option.presentation?.asset?.alt ?? "",
                                              id: event.currentTarget.value,
                                            },
                                          }
                                        : undefined,
                                    },
                                    `option-asset:${activeStep.key}:${option.key}`,
                                  )
                                }
                                value={option.presentation?.asset?.id ?? ""}
                              >
                                <option value="">Wybierz zdjęcie</option>
                                {mediaAssets.map((asset) => (
                                  <option key={asset.id} value={asset.id}>
                                    {asset.name} · {asset.width}×{asset.height}
                                  </option>
                                ))}
                              </select>
                            </label>
                            {mediaAssets.find(
                              (asset) => asset.id === option.presentation?.asset?.id,
                            ) ? (
                              <Image
                                alt=""
                                height={180}
                                src={
                                  mediaAssets.find(
                                    (asset) => asset.id === option.presentation?.asset?.id,
                                  )?.previewUrl ?? ""
                                }
                                unoptimized
                                width={240}
                              />
                            ) : null}
                            <label>
                              <span>Opis obrazu dla czytnika ekranu</span>
                              <input
                                maxLength={160}
                                onChange={(event) => {
                                  const assetId = option.presentation?.asset?.id;
                                  if (!assetId) return;
                                  updateOption(
                                    index,
                                    {
                                      ...option,
                                      presentation: {
                                        asset: { alt: event.currentTarget.value, id: assetId },
                                      },
                                    },
                                    `option-asset-alt:${activeStep.key}:${option.key}`,
                                  );
                                }}
                                placeholder="Np. jasny front dębowy o pionowym usłojeniu"
                                value={option.presentation?.asset?.alt ?? ""}
                              />
                              <small>{option.presentation?.asset?.alt.length ?? 0}/160</small>
                            </label>
                          </div>
                        ) : null}
                        <details className="question-options__mobile-actions">
                          <summary aria-label={`Akcje opcji „${accessibleLabel}”`}>⋮</summary>
                          <div>
                            <button
                              disabled={index === 0}
                              onClick={(event) => {
                                moveOption(index, -1, true);
                                event.currentTarget.closest("details")?.removeAttribute("open");
                              }}
                              type="button"
                            >
                              Przenieś wyżej
                            </button>
                            <button
                              disabled={index === activeStep.options.length - 1}
                              onClick={(event) => {
                                moveOption(index, 1, true);
                                event.currentTarget.closest("details")?.removeAttribute("open");
                              }}
                              type="button"
                            >
                              Przenieś niżej
                            </button>
                            <button
                              className="is-danger"
                              disabled={activeStep.options.length <= 2}
                              onClick={(event) => {
                                removeOption(index);
                                event.currentTarget.closest("details")?.removeAttribute("open");
                              }}
                              type="button"
                            >
                              Usuń opcję
                            </button>
                          </div>
                        </details>
                      </div>
                    );
                  })}
                  <button
                    className="panel-secondary-button"
                    disabled={activeStep.options.length >= 20}
                    onClick={addOption}
                    type="button"
                  >
                    ＋ Dodaj opcję
                  </button>
                  {activeStepIssues
                    .filter((issue) => issue.field === "option" || issue.field === "presentation")
                    .map((issue) => (
                      <small className="builder-field-error" key={issue.id}>
                        <PanelIcon name="warning" />
                        {issue.message}
                      </small>
                    ))}
                </fieldset>
              ) : null}

              <label>
                <span>Tekst pomocniczy</span>
                <textarea
                  maxLength={500}
                  onChange={(event) =>
                    setDescription(event.currentTarget.value, `step-description:${activeStep.key}`)
                  }
                  rows={3}
                  value={activeStep.description ?? ""}
                />
                <small>{activeStep.description?.length ?? 0}/500</small>
              </label>

              <QuestionValidationEditor
                issues={activeStepIssues.filter((issue) => issue.field === "validation")}
                onChange={(validation) => {
                  const nextStep = { ...activeStep };
                  if (validation) nextStep.validation = validation;
                  else delete nextStep.validation;
                  updateActiveStep(nextStep, `step-validation:${activeStep.key}`);
                }}
                step={activeStep}
              />

              <label>
                <span>Następny krok</span>
                <select
                  onChange={(event) =>
                    updateActiveStep({
                      ...activeStep,
                      nextStepKey: event.currentTarget.value || null,
                    })
                  }
                  value={activeStep.nextStepKey ?? ""}
                >
                  <option value="">Wynik procesu</option>
                  {document.steps
                    .filter((step) => step.key !== activeStep.key)
                    .map((step) => (
                      <option key={step.key} value={step.key}>
                        {step.title}
                      </option>
                    ))}
                </select>
              </label>

              <section className="conditional-logic" aria-labelledby="conditional-title">
                <div>
                  <h3 id="conditional-title">Logika warunkowa</h3>
                  <span className="panel-status panel-status--neutral">
                    {document.rules.length} reguł
                  </span>
                </div>
                {document.rules.length === 0 ? (
                  <p>Brak warunków. Domyślne przejście prowadzi do następnego kroku.</p>
                ) : (
                  <ol>
                    {document.rules.map((rule, index) => (
                      <li key={rule.id}>
                        <label>
                          <span>Jeżeli</span>
                          <select
                            onChange={(event) =>
                              updateRule(index, {
                                ...rule,
                                when: { ...rule.when, stepKey: event.currentTarget.value },
                              })
                            }
                            value={rule.when.stepKey}
                          >
                            {document.steps.map((step) => (
                              <option key={step.key} value={step.key}>
                                {step.title}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label>
                          <span>Warunek</span>
                          <select
                            onChange={(event) =>
                              setRuleOperator(
                                index,
                                rule,
                                event.currentTarget.value as FlowRule["when"]["operator"],
                              )
                            }
                            value={rule.when.operator}
                          >
                            <option value="answered">ma odpowiedź</option>
                            <option value="equals">jest równe</option>
                            <option value="not_equals">nie jest równe</option>
                            <option value="includes">zawiera</option>
                          </select>
                        </label>
                        {rule.when.operator !== "answered" ? (
                          <label>
                            <span>Wartość</span>
                            <input
                              maxLength={500}
                              onChange={(event) =>
                                updateRule(
                                  index,
                                  {
                                    ...rule,
                                    when: {
                                      ...rule.when,
                                      value: event.currentTarget.value,
                                    },
                                  },
                                  `rule-value:${rule.id}`,
                                )
                              }
                              value={String(rule.when.value ?? "")}
                            />
                          </label>
                        ) : null}
                        <label>
                          <span>Przejdź do</span>
                          <select
                            onChange={(event) =>
                              updateRule(index, {
                                ...rule,
                                then: {
                                  action: "go_to",
                                  stepKey: event.currentTarget.value || null,
                                },
                              })
                            }
                            value={rule.then.stepKey ?? ""}
                          >
                            <option value="">Wynik procesu</option>
                            {document.steps.map((step) => (
                              <option key={step.key} value={step.key}>
                                {step.title}
                              </option>
                            ))}
                          </select>
                        </label>
                        <button
                          aria-label={`Usuń warunek ${index + 1}`}
                          className="panel-text-button panel-text-button--danger"
                          onClick={() =>
                            setDocument((current) => ({
                              ...current,
                              rules: current.rules.filter((_, ruleIndex) => ruleIndex !== index),
                            }))
                          }
                          type="button"
                        >
                          Usuń warunek
                        </button>
                      </li>
                    ))}
                  </ol>
                )}
                <button className="panel-text-button" onClick={addRule} type="button">
                  ＋ Dodaj warunek
                </button>
              </section>
              <button
                className="panel-text-button panel-text-button--danger question-inspector__remove"
                disabled={document.steps.length === 1}
                onClick={removeActiveQuestion}
                type="button"
              >
                Usuń pytanie
              </button>
            </div>
          </aside>
        ) : null}
        {builderArea !== "form" ? (
          <EstimationEditorWorkspace
            area={builderArea}
            document={document}
            mobilePane={mode}
            onDocumentChange={setDocument}
          />
        ) : null}
      </div>
      <Dialog
        actions={
          <>
            <Button onClick={() => setPendingEstimationImpact(null)} variant="secondary">
              Anuluj
            </Button>
            <Button onClick={confirmEstimationImpact} variant="danger">
              Potwierdź i usuń reguły
            </Button>
          </>
        }
        description="Ta operacja zmienia pytanie używane przez aktywną wycenę. Powiązane reguły muszą zostać usunięte atomowo, aby szkic pozostał poprawny."
        onClose={() => setPendingEstimationImpact(null)}
        open={Boolean(pendingEstimationImpact)}
        title={
          pendingEstimationImpact
            ? `Zmień „${pendingEstimationImpact.targetLabel}”?`
            : "Zmienić konfigurację?"
        }
      >
        <div className="estimation-impact-dialog">
          <p>Usunięte zostaną następujące zależności:</p>
          <ul>
            {pendingEstimationImpact?.references.map((reference, index) => (
              <li key={`${reference.kind}:${reference.ruleId}:${index}`}>
                <strong>{reference.ruleLabel}</strong>
                <span>{estimationReferenceLabel(reference.kind)}</span>
              </li>
            ))}
          </ul>
          <p>Zmianę będzie można cofnąć przyciskiem „Cofnij”.</p>
        </div>
      </Dialog>
      <Dialog
        actions={
          <>
            <Button onClick={closeSectionDeletion} variant="secondary">
              Anuluj
            </Button>
            <Button
              disabled={
                pendingDeleteQuestionCount > 0 &&
                (!sectionDeleteTarget || sectionDeleteTarget === pendingSectionDeletion)
              }
              onClick={confirmSectionDeletion}
              variant="danger"
            >
              {pendingDeleteQuestionCount > 0 ? "Usuń i przenieś" : "Usuń sekcję"}
            </Button>
          </>
        }
        description={
          pendingDeleteQuestionCount > 0
            ? "Pytania nie zostaną usunięte. Wybierz sekcję, do której mają zostać przeniesione."
            : "Ta operacja usuwa pustą sekcję z procesu."
        }
        onClose={closeSectionDeletion}
        open={Boolean(pendingDeleteSection)}
        title={`Usuń sekcję${pendingDeleteSection ? ` „${pendingDeleteSection.title}”` : ""}?`}
      >
        <div className="section-delete-dialog">
          {pendingDeleteQuestionCount > 0 ? (
            <>
              <p>
                Sekcja zawiera{" "}
                <strong>
                  {pendingDeleteQuestionCount}{" "}
                  {polishQuestionCountLabel(pendingDeleteQuestionCount)}
                </strong>
                .
              </p>
              <label>
                <span>Przenieś pytania do</span>
                <select
                  autoFocus
                  onChange={(event) => setSectionDeleteTarget(event.currentTarget.value)}
                  value={sectionDeleteTarget}
                >
                  {document.sections
                    .filter((section) => section.key !== pendingSectionDeletion)
                    .map((section) => (
                      <option key={section.key} value={section.key}>
                        {section.title}
                      </option>
                    ))}
                </select>
              </label>
            </>
          ) : (
            <p>Po potwierdzeniu sekcja zniknie z listy.</p>
          )}
        </div>
      </Dialog>
    </div>
  );

  function retrySave() {
    const saveQueue = saveQueueRef.current;
    if (!saveQueue) return;
    lastErrorCodeRef.current = null;
    if (!saveQueue.reset() || !canSave) return;
    void saveQueue.enqueue(currentPayload).catch(() => undefined);
  }

  function undoCurrentChange() {
    const nextHistory = undoFlowEditorHistory(history);
    setHistory(nextHistory);
    updateStatusAfterHistoryChange(nextHistory.present);
  }

  function redoCurrentChange() {
    const nextHistory = redoFlowEditorHistory(history);
    setHistory(nextHistory);
    updateStatusAfterHistoryChange(nextHistory.present);
  }

  function updateStatusAfterHistoryChange(snapshot: FlowEditorSnapshot) {
    setSaveStatus(
      flowEditorSnapshotSignature({
        document: snapshot.document,
        name: snapshot.name.trim(),
      }) === savedSignatureRef.current
        ? "saved"
        : "dirty",
    );
  }

  async function saveNow(): Promise<FlowActionState | null> {
    const saveQueue = saveQueueRef.current;
    if (!saveQueue) return null;
    if (!canSave) {
      setSaveStatus("invalid");
      return null;
    }
    if (lastErrorCodeRef.current === "CONFLICT") return null;
    if (saveQueue.isHalted() && !saveQueue.reset()) return null;
    try {
      return await saveQueue.enqueue(currentPayload);
    } catch {
      return null;
    }
  }

  async function publishCurrentDraft() {
    if (!canPublishCurrent || publishPendingRef.current || saveStatus === "conflict") return;
    publishPendingRef.current = true;
    setPublishPending(true);
    try {
      const saved = await saveNow();
      if (!saved || saved.revision === null) return;

      setActionState(null);
      const state = await publishFlowDraftRequestAction({
        document: currentPayload.document,
        expectedDraftRevision: revisionRef.current,
        flowId,
        name: currentPayload.name,
        organizationId,
      });
      if (state.error || state.revision === null) {
        lastErrorCodeRef.current = state.code;
        setActionState(state);
        setSaveStatus(state.code === "CONFLICT" ? "conflict" : "error");
        return;
      }
      revisionRef.current = state.revision;
      savedSignatureRef.current = currentPayload.signature;
      lastErrorCodeRef.current = null;
      setActionState(state);
      setRevision(state.revision);
      setSavedSignature(currentPayload.signature);
      setSaveStatus("saved");
    } finally {
      publishPendingRef.current = false;
      setPublishPending(false);
    }
  }

  function handleSafeNavigation(event: MouseEvent<HTMLAnchorElement>, destination: string) {
    if (publishPendingRef.current) {
      event.preventDefault();
      return;
    }
    if (
      currentSignature === savedSignatureRef.current ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey
    ) {
      return;
    }
    event.preventDefault();
    void saveNow().then((state) => {
      if (state) router.push(destination);
    });
  }

  function selectBuilderArea(nextArea: FlowBuilderArea) {
    setBuilderArea(nextArea);
    setInspectorOpen(true);
  }

  function addSection() {
    if (document.sections.length >= 20 || document.steps.length >= 40) return;
    const sectionKey = createUniqueFlowKey("sekcja", document);
    const stepKey = createUniqueFlowKey("pytanie", document);
    const sectionTitle = createUniqueSectionTitle(document);
    const section: FlowSection = { key: sectionKey, title: sectionTitle };
    const firstStep = createDefaultQuestion(stepKey, sectionKey);
    const result = addFlowSection(document, section, firstStep, activeStep.sectionKey);
    if (!result.changed) return;

    setDocument(result.document);
    setActiveStepKey(stepKey);
    setCollapsedSectionKeys((current) => {
      const next = new Set(current);
      next.delete(sectionKey);
      return next;
    });
    setEditingSectionKey(sectionKey);
    setEditingSectionTitle(sectionTitle);
    setMode("questions");
    setReorderAnnouncement(
      `Dodano sekcję „${sectionTitle}” na pozycji ${result.position ?? ""} z pierwszym pytaniem.`,
    );
  }

  function addQuestionToSection(sectionKey: string) {
    if (document.steps.length >= 40) return;
    const key = createUniqueFlowKey("pytanie", document);
    const result = addFlowQuestionToSection(
      document,
      sectionKey,
      createDefaultQuestion(key, sectionKey),
    );
    if (!result.changed) return;

    setDocument(result.document);
    setActiveStepKey(key);
    setCollapsedSectionKeys((current) => {
      const next = new Set(current);
      next.delete(sectionKey);
      return next;
    });
    setInspectorOpen(true);
    setMode("inspector");
    setReorderAnnouncement(`Dodano pierwsze pytanie w sekcji „${result.sectionTitle ?? ""}”.`);
  }

  function addQuestion() {
    if (document.steps.length >= 40) return;
    const key = createUniqueFlowKey("pytanie", document);
    const nextStepKey = activeStep.nextStepKey;
    const step: FlowStep = {
      ...createDefaultQuestion(key, activeStep.sectionKey),
      nextStepKey,
    };
    setDocument((current) => {
      const index = current.steps.findIndex((item) => item.key === activeStep.key);
      const steps = [...current.steps];
      steps.splice(index + 1, 0, step);
      steps[index] = { ...activeStep, nextStepKey: key };
      return { ...current, steps };
    });
    setActiveStepKey(key);
    setMode("inspector");
  }

  function removeActiveQuestion() {
    if (document.steps.length <= 1) return;
    const references = listEstimationReferencesForStep(document, activeStep.key);
    if (references.length > 0) {
      setPendingEstimationImpact({
        action: "remove_question",
        references,
        stepKey: activeStep.key,
        targetLabel: activeStep.title,
      });
      return;
    }
    removeQuestionNow(activeStep.key, false);
  }

  function removeQuestionNow(stepKey: string, cleanEstimation: boolean) {
    if (document.steps.length <= 1) return;
    const source = cleanEstimation
      ? removeEstimationReferencesForStep(document, stepKey).document
      : document;
    const stepIndex = source.steps.findIndex((step) => step.key === stepKey);
    const step = source.steps[stepIndex];
    if (!step) return;
    const fallback =
      step.nextStepKey ??
      source.steps[stepIndex + 1]?.key ??
      source.steps[stepIndex - 1]?.key ??
      null;
    const remaining = source.steps.filter((candidate) => candidate.key !== stepKey);
    setDocument({
      ...source,
      entryStepKey:
        source.entryStepKey === stepKey ? (fallback ?? remaining[0]!.key) : source.entryStepKey,
      rules: source.rules
        .filter((rule) => rule.when.stepKey !== stepKey)
        .map((rule) =>
          rule.then.stepKey === stepKey
            ? { ...rule, then: { action: "go_to" as const, stepKey: fallback } }
            : rule,
        ),
      steps: remaining.map((candidate) => ({
        ...candidate,
        nextStepKey: candidate.nextStepKey === stepKey ? fallback : candidate.nextStepKey,
        options: candidate.options.map((option) =>
          option.nextStepKey === stepKey ? { ...option, nextStepKey: fallback } : option,
        ),
      })),
    });
    setActiveStepKey(fallback ?? remaining[0]!.key);
  }

  function toggleSection(sectionKey: string) {
    setCollapsedSectionKeys((current) => {
      const next = new Set(current);
      if (next.has(sectionKey)) next.delete(sectionKey);
      else next.add(sectionKey);
      return next;
    });
  }

  function startSectionRename(sectionKey: string, title: string) {
    setCollapsedSectionKeys((current) => {
      const next = new Set(current);
      next.delete(sectionKey);
      return next;
    });
    setEditingSectionKey(sectionKey);
    setEditingSectionTitle(title);
  }

  function cancelSectionRename(sectionKey: string) {
    setEditingSectionKey(null);
    setEditingSectionTitle("");
    restoreSectionActionFocus(sectionKey);
  }

  function submitSectionRename(event: FormEvent<HTMLFormElement>, sectionKey: string) {
    event.preventDefault();
    const result = renameFlowSection(document, sectionKey, editingSectionTitle);
    if (result.changed) {
      setDocument(result.document);
      setReorderAnnouncement(`Zmieniono nazwę sekcji na „${result.sectionTitle ?? ""}”.`);
    }
    setEditingSectionKey(null);
    setEditingSectionTitle("");
    restoreSectionActionFocus(sectionKey);
  }

  function moveSection(sectionKey: string, delta: -1 | 1, restoreFocus: boolean) {
    const result = reorderFlowSection(document, sectionKey, delta);
    if (!result.changed) return;
    setDocument(result.document);
    setReorderAnnouncement(
      `Przeniesiono sekcję „${result.sectionTitle ?? sectionKey}” na pozycję ${
        result.position ?? ""
      } z ${document.sections.length}.`,
    );
    if (restoreFocus) restoreSectionToggleFocus(sectionKey);
  }

  function handleSectionReorderKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    sectionKey: string,
    sectionIndex: number,
  ) {
    if (!event.altKey || (event.key !== "ArrowUp" && event.key !== "ArrowDown")) return;
    event.preventDefault();
    const delta = event.key === "ArrowUp" ? -1 : 1;
    const destination = sectionIndex + delta;
    if (destination < 0 || destination >= document.sections.length) return;
    moveSection(sectionKey, delta, true);
  }

  function openSectionDeletion(sectionKey: string) {
    if (document.sections.length <= 1) return;
    const sectionIndex = document.sections.findIndex((section) => section.key === sectionKey);
    if (sectionIndex < 0) return;
    const targetSection =
      document.sections[sectionIndex - 1] ?? document.sections[sectionIndex + 1];
    if (!targetSection) return;
    setPendingSectionDeletion(sectionKey);
    setSectionDeleteTarget(targetSection.key);
  }

  function closeSectionDeletion() {
    const sectionKey = pendingSectionDeletion;
    setPendingSectionDeletion(null);
    setSectionDeleteTarget("");
    if (sectionKey) restoreSectionActionFocus(sectionKey);
  }

  function confirmSectionDeletion() {
    if (!pendingSectionDeletion || !sectionDeleteTarget) return;
    const removedSection = document.sections.find(
      (section) => section.key === pendingSectionDeletion,
    );
    const result = removeFlowSection(document, pendingSectionDeletion, sectionDeleteTarget);
    if (!result.changed) return;

    setDocument(result.document);
    setCollapsedSectionKeys((current) => {
      const next = new Set(current);
      next.delete(pendingSectionDeletion);
      return next;
    });
    if (editingSectionKey === pendingSectionDeletion) {
      setEditingSectionKey(null);
      setEditingSectionTitle("");
    }
    setPendingSectionDeletion(null);
    setSectionDeleteTarget("");
    setReorderAnnouncement(
      `Usunięto sekcję „${removedSection?.title ?? ""}” i przeniesiono ${
        result.movedQuestionCount
      } ${polishQuestionCountLabel(result.movedQuestionCount)} do sekcji „${
        result.sectionTitle ?? ""
      }”.`,
    );
    if (result.sectionKey) restoreSectionToggleFocus(result.sectionKey);
  }

  function restoreSectionActionFocus(sectionKey: string) {
    window.requestAnimationFrame(() => {
      const selector = `[data-section-actions="${CSS.escape(sectionKey)}"]`;
      documentQuerySelector<HTMLElement>(selector)?.focus();
    });
  }

  function restoreSectionToggleFocus(sectionKey: string) {
    window.requestAnimationFrame(() => {
      const selector = `[data-section-toggle="${CSS.escape(sectionKey)}"]`;
      documentQuerySelector<HTMLButtonElement>(selector)?.focus();
    });
  }

  function moveQuestion(index: number, delta: -1 | 1) {
    const destination = index + delta;
    if (destination < 0 || destination >= document.steps.length) return;
    const sourceStep = document.steps[index];
    const targetStep = document.steps[destination];
    if (!sourceStep || !targetStep) return;
    moveQuestionTo(sourceStep.key, targetStep.key, delta === -1 ? "before" : "after", true);
  }

  function moveQuestionTo(
    sourceStepKey: string,
    targetStepKey: string,
    edge: FlowQuestionDropEdge,
    restoreFocus: boolean,
  ) {
    const result = reorderFlowQuestion(document, sourceStepKey, targetStepKey, edge);
    if (!result.changed) return;
    const movedStep = document.steps.find((step) => step.key === sourceStepKey);
    setDocument(result.document);
    setActiveStepKey(sourceStepKey);
    setReorderAnnouncement(
      `Przeniesiono pytanie „${movedStep?.title ?? sourceStepKey}” na pozycję ${
        result.position ?? ""
      } w sekcji „${result.sectionTitle ?? ""}”.`,
    );
    if (restoreFocus) {
      window.requestAnimationFrame(() => {
        const selector = `[data-reorder-step="${CSS.escape(sourceStepKey)}"]`;
        documentQuerySelector<HTMLButtonElement>(selector)?.focus();
      });
    }
  }

  function handleQuestionDragStart(event: DragEvent<HTMLButtonElement>, stepKey: string) {
    setDraggedStepKey(stepKey);
    setDropIndicator(null);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", stepKey);
  }

  function handleQuestionDragOver(event: DragEvent<HTMLLIElement>, targetStepKey: string) {
    const sourceStepKey = draggedStepKey || event.dataTransfer.getData("text/plain");
    if (!sourceStepKey || sourceStepKey === targetStepKey) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    const bounds = event.currentTarget.getBoundingClientRect();
    const edge: FlowQuestionDropEdge =
      event.clientY < bounds.top + bounds.height / 2 ? "before" : "after";
    setDropIndicator((current) =>
      current?.stepKey === targetStepKey && current.edge === edge
        ? current
        : { edge, stepKey: targetStepKey },
    );
  }

  function handleQuestionDrop(event: DragEvent<HTMLLIElement>, targetStepKey: string) {
    event.preventDefault();
    const sourceStepKey = draggedStepKey || event.dataTransfer.getData("text/plain");
    const edge =
      dropIndicator?.stepKey === targetStepKey ? dropIndicator.edge : ("before" as const);
    clearQuestionDrag();
    if (sourceStepKey) moveQuestionTo(sourceStepKey, targetStepKey, edge, true);
  }

  function clearQuestionDrag() {
    setDraggedStepKey(null);
    setDropIndicator(null);
  }

  function handleQuestionReorderKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (!event.altKey || (event.key !== "ArrowUp" && event.key !== "ArrowDown")) return;
    event.preventDefault();
    moveQuestion(index, event.key === "ArrowUp" ? -1 : 1);
  }

  function moveOption(index: number, delta: -1 | 1, restoreFocus: boolean) {
    const destination = index + delta;
    if (destination < 0 || destination >= activeStep.options.length) return;
    const sourceOption = activeStep.options[index];
    const targetOption = activeStep.options[destination];
    if (!sourceOption || !targetOption) return;
    moveOptionTo(
      sourceOption.key,
      targetOption.key,
      delta === -1 ? "before" : "after",
      restoreFocus,
    );
  }

  function moveOptionTo(
    sourceOptionKey: string,
    targetOptionKey: string,
    edge: FlowOptionDropEdge,
    restoreFocus: boolean,
  ) {
    const result = reorderFlowOption(
      document,
      activeStep.key,
      sourceOptionKey,
      targetOptionKey,
      edge,
    );
    if (!result.changed) return;

    setDocument(result.document);
    setReorderAnnouncement(
      `Przeniesiono opcję „${result.optionLabel ?? sourceOptionKey}” na pozycję ${
        result.position ?? ""
      } z ${activeStep.options.length}.`,
    );
    if (restoreFocus) restoreOptionHandleFocus(sourceOptionKey);
  }

  function restoreOptionHandleFocus(optionKey: string) {
    window.requestAnimationFrame(() => {
      const selector = `[data-reorder-option="${CSS.escape(optionKey)}"]`;
      documentQuerySelector<HTMLButtonElement>(selector)?.focus();
    });
  }

  function handleOptionDragStart(event: DragEvent<HTMLButtonElement>, optionKey: string) {
    setDraggedOptionKey(optionKey);
    setOptionDropIndicator(null);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("application/x-lorum-option", optionKey);
    event.dataTransfer.setData("text/plain", optionKey);
  }

  function handleOptionDragOver(event: DragEvent<HTMLDivElement>, targetOptionKey: string) {
    const sourceOptionKey =
      draggedOptionKey || event.dataTransfer.getData("application/x-lorum-option");
    if (!sourceOptionKey || sourceOptionKey === targetOptionKey) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    const bounds = event.currentTarget.getBoundingClientRect();
    const edge: FlowOptionDropEdge =
      event.clientY < bounds.top + bounds.height / 2 ? "before" : "after";
    setOptionDropIndicator((current) =>
      current?.optionKey === targetOptionKey && current.edge === edge
        ? current
        : { edge, optionKey: targetOptionKey },
    );
  }

  function handleOptionDrop(event: DragEvent<HTMLDivElement>, targetOptionKey: string) {
    event.preventDefault();
    const sourceOptionKey =
      draggedOptionKey ||
      event.dataTransfer.getData("application/x-lorum-option") ||
      event.dataTransfer.getData("text/plain");
    const edge =
      optionDropIndicator?.optionKey === targetOptionKey
        ? optionDropIndicator.edge
        : ("before" as const);
    clearOptionDrag();
    if (sourceOptionKey) moveOptionTo(sourceOptionKey, targetOptionKey, edge, true);
  }

  function clearOptionDrag() {
    setDraggedOptionKey(null);
    setOptionDropIndicator(null);
  }

  function handleOptionReorderKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (!event.altKey || (event.key !== "ArrowUp" && event.key !== "ArrowDown")) return;
    event.preventDefault();
    moveOption(index, event.key === "ArrowUp" ? -1 : 1, true);
  }

  function focusFirstValidationIssue() {
    const issue = editorValidation.issues[0];
    if (!issue) return;
    if (issue.field === "name") {
      documentQuerySelector<HTMLInputElement>(".flow-builder__identity input")?.focus();
      return;
    }
    const issueSectionKey = issue.sectionKey;
    if (issueSectionKey && !issue.stepKey) {
      setCollapsedSectionKeys((current) => {
        const next = new Set(current);
        next.delete(issueSectionKey);
        return next;
      });
      setMode("questions");
      restoreSectionToggleFocus(issueSectionKey);
      return;
    }
    if (issue.stepKey) setActiveStepKey(issue.stepKey);
    const previewField = issue.field === "title";
    setInspectorOpen(true);
    setMode(previewField ? "preview" : "inspector");
    window.requestAnimationFrame(() => {
      const selector =
        issue.field === "option" || issue.field === "presentation"
          ? `[data-editor-field="${issue.field}-${issue.optionIndex ?? 0}"]`
          : issue.field === "title" || issue.field === "validation"
            ? `[data-editor-field="${issue.field}"]`
            : ".question-inspector__errors";
      documentQuerySelector<HTMLElement>(selector)?.focus();
    });
  }

  function updateOption(index: number, option: FlowStep["options"][number], group?: string) {
    updateActiveStep(
      {
        ...activeStep,
        options: activeStep.options.map((item, optionIndex) =>
          optionIndex === index ? option : item,
        ),
      },
      group,
    );
  }

  async function uploadFlowMedia(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file || mediaUploading) return;
    setMediaUploadError(null);
    setMediaUploading(true);
    try {
      const body = new FormData();
      body.set("file", file);
      const response = await fetch(`/api/v1/organizations/${organizationId}/flow-assets`, {
        body,
        method: "POST",
      });
      const payload: unknown = await response.json();
      const asset = parseUploadedFlowMediaAsset(payload);
      if (!response.ok || !asset) {
        throw new Error(flowMediaUploadMessage(payload));
      }
      setMediaAssets((current) => [asset, ...current.filter((item) => item.id !== asset.id)]);
    } catch (error) {
      setMediaUploadError(error instanceof Error ? error.message : "Nie udało się dodać zdjęcia.");
    } finally {
      setMediaUploading(false);
    }
  }

  function setChoicePresentationVariant(
    variant: "default" | "icon_cards" | "image_cards" | "text_cards",
  ) {
    updateActiveStep({
      ...activeStep,
      options: activeStep.options.map((option) => {
        if (variant === "text_cards") {
          return {
            ...option,
            presentation: {
              description: option.presentation?.description ?? "",
            },
          };
        }
        if (variant === "icon_cards") {
          return {
            ...option,
            presentation: {
              ...(option.presentation?.icon ? { icon: option.presentation.icon } : {}),
            },
          };
        }
        if (variant === "image_cards") {
          return {
            ...option,
            presentation: {
              ...(option.presentation?.asset ? { asset: option.presentation.asset } : {}),
            },
          };
        }
        return {
          key: option.key,
          label: option.label,
          ...(option.nextStepKey === undefined ? {} : { nextStepKey: option.nextStepKey }),
        };
      }),
      presentation: { variant },
    });
  }

  function addOption() {
    const key = `opcja_${Date.now().toString(36)}`;
    updateActiveStep({
      ...activeStep,
      options: [...activeStep.options, { key, label: `Opcja ${activeStep.options.length + 1}` }],
    });
  }

  function removeOption(index: number) {
    const option = activeStep.options[index];
    if (!option || activeStep.options.length <= 2) return;
    const references = listEstimationReferencesForOption(document, activeStep.key, option.key);
    if (references.length > 0) {
      setPendingEstimationImpact({
        action: "remove_option",
        optionKey: option.key,
        references,
        stepKey: activeStep.key,
        targetLabel: option.label,
      });
      return;
    }
    removeOptionNow(activeStep.key, option.key, false);
  }

  function removeOptionNow(stepKey: string, optionKey: string, cleanEstimation: boolean) {
    const source = cleanEstimation
      ? removeEstimationReferencesForOption(document, stepKey, optionKey).document
      : document;
    const step = source.steps.find((candidate) => candidate.key === stepKey);
    if (
      !step ||
      step.options.length <= 2 ||
      !step.options.some((option) => option.key === optionKey)
    ) {
      return;
    }
    setDocument({
      ...source,
      rules: source.rules.filter(
        (rule) =>
          !(rule.when.stepKey === stepKey && "value" in rule.when && rule.when.value === optionKey),
      ),
      steps: source.steps.map((candidate) =>
        candidate.key === stepKey
          ? {
              ...candidate,
              options: candidate.options.filter((option) => option.key !== optionKey),
            }
          : candidate,
      ),
    });
  }

  function requestQuestionTypeChange(nextType: FlowStep["type"]) {
    if (nextType === activeStep.type) return;
    const references: EstimationReference[] = [];
    if (isChoiceType(activeStep.type) && !isChoiceType(nextType)) {
      for (const option of activeStep.options) {
        references.push(...listEstimationReferencesForOption(document, activeStep.key, option.key));
      }
    }
    if (activeStep.type === "number" && nextType !== "number") {
      references.push(
        ...listEstimationReferencesForStep(document, activeStep.key).filter(
          (reference) => reference.kind === "pricing_quantity",
        ),
      );
    }
    const uniqueReferences = uniqueEstimationReferences(references);
    if (uniqueReferences.length > 0) {
      setPendingEstimationImpact({
        action: "change_type",
        nextType,
        references: uniqueReferences,
        stepKey: activeStep.key,
        targetLabel: activeStep.title,
      });
      return;
    }
    changeQuestionTypeNow(activeStep.key, nextType, false);
  }

  function changeQuestionTypeNow(
    stepKey: string,
    nextType: FlowStep["type"],
    cleanEstimation: boolean,
  ) {
    let source = document;
    const original = source.steps.find((step) => step.key === stepKey);
    if (!original || original.type === nextType) return;
    if (cleanEstimation && isChoiceType(original.type) && !isChoiceType(nextType)) {
      for (const option of original.options) {
        source = removeEstimationReferencesForOption(source, stepKey, option.key).document;
      }
    }
    if (cleanEstimation && original.type === "number" && nextType !== "number") {
      source = removeEstimationQuantityReferencesForStep(source, stepKey).document;
    }
    const optionKeys = new Set(original.options.map((option) => option.key));
    const options = isChoiceType(nextType)
      ? isChoiceType(original.type)
        ? original.options.map((option) => ({
            key: option.key,
            label: option.label,
            ...(option.nextStepKey === undefined ? {} : { nextStepKey: option.nextStepKey }),
          }))
        : [
            { key: "opcja_1", label: "Opcja 1" },
            { key: "opcja_2", label: "Opcja 2" },
          ]
      : [];
    setDocument({
      ...source,
      rules:
        isChoiceType(original.type) && !isChoiceType(nextType)
          ? source.rules.filter(
              (rule) =>
                !(
                  rule.when.stepKey === stepKey &&
                  typeof rule.when.value === "string" &&
                  optionKeys.has(rule.when.value)
                ),
            )
          : source.rules,
      steps: source.steps.map((step) =>
        step.key === stepKey
          ? {
              allowUnknown: step.allowUnknown,
              ...(step.description ? { description: step.description } : {}),
              key: step.key,
              nextStepKey: step.nextStepKey,
              options,
              presentation: { variant: "default" as const },
              required: step.required,
              sectionKey: step.sectionKey,
              title: step.title,
              type: nextType,
            }
          : step,
      ),
    });
  }

  function confirmEstimationImpact() {
    const pending = pendingEstimationImpact;
    if (!pending) return;
    setPendingEstimationImpact(null);
    if (pending.action === "remove_question") {
      removeQuestionNow(pending.stepKey, true);
    } else if (pending.action === "remove_option") {
      removeOptionNow(pending.stepKey, pending.optionKey, true);
    } else {
      changeQuestionTypeNow(pending.stepKey, pending.nextType, true);
    }
  }

  function setDescription(value: string, group?: string) {
    const nextStep = { ...activeStep };
    if (value) nextStep.description = value;
    else delete nextStep.description;
    updateActiveStep(nextStep, group);
  }

  function addRule() {
    const rule: FlowRule = {
      id: `warunek_${Date.now().toString(36)}`,
      then: { action: "go_to", stepKey: activeStep.nextStepKey },
      when: {
        operator: "answered",
        stepKey: activeStep.key,
      },
    };
    setDocument((current) => ({ ...current, rules: [...current.rules, rule] }));
  }

  function updateRule(index: number, rule: FlowRule, group?: string) {
    setDocument(
      (current) => ({
        ...current,
        rules: current.rules.map((item, ruleIndex) => (ruleIndex === index ? rule : item)),
      }),
      group,
    );
  }

  function setRuleOperator(index: number, rule: FlowRule, operator: FlowRule["when"]["operator"]) {
    if (operator === "answered") {
      updateRule(index, {
        ...rule,
        when: { operator, stepKey: rule.when.stepKey },
      });
      return;
    }
    updateRule(index, {
      ...rule,
      when: {
        operator,
        stepKey: rule.when.stepKey,
        value: rule.when.value ?? "",
      },
    });
  }
}

function builderSaveStatusLabel(
  status: BuilderSaveStatus,
  actionState: FlowActionState | null,
  invalidMessage?: string,
): string {
  if (status === "conflict") return "Konflikt wersji — lokalne zmiany nie zostały nadpisane.";
  if (status === "dirty") return "Niezapisane zmiany";
  if (status === "error") return actionState?.error ?? "Nie udało się zapisać zmian.";
  if (status === "invalid") return invalidMessage ?? "Popraw błędy konfiguracji przed zapisem.";
  if (status === "publishing") return "Publikowanie procesu…";
  if (status === "saving") return "Zapisywanie zmian…";
  return actionState?.success ?? "Zapisano zmiany.";
}

function QuestionValidationEditor({
  issues,
  onChange,
  step,
}: Readonly<{
  issues: readonly FlowEditorIssue[];
  onChange: (validation: FlowStepValidation | undefined) => void;
  step: FlowStep;
}>) {
  const errorId = `step-validation-error-${step.key}`;
  const hasError = issues.length > 0;
  const errorContent =
    issues.length > 0 ? (
      <div className="question-validation__errors" id={errorId}>
        {issues.map((issue) => (
          <small className="builder-field-error" key={issue.id}>
            <PanelIcon name="warning" />
            {issue.message}
          </small>
        ))}
      </div>
    ) : null;

  if (step.type === "long_text" || step.type === "location" || step.type === "short_text") {
    const validation = step.validation?.kind === "text_length" ? step.validation : null;
    const typeLimit = step.type === "long_text" ? 2000 : 500;
    return (
      <section className="question-validation" aria-labelledby={`validation-title-${step.key}`}>
        <div className="question-validation__heading">
          <div>
            <h3 id={`validation-title-${step.key}`}>Walidacja odpowiedzi</h3>
            <p>Ogranicz długość tekstu wpisywanego przez klienta.</p>
          </div>
          <button
            aria-pressed={Boolean(validation)}
            className="panel-text-button"
            onClick={() =>
              onChange(
                validation
                  ? undefined
                  : { kind: "text_length", maxLength: typeLimit, minLength: 0 },
              )
            }
            type="button"
          >
            {validation ? "Wyłącz" : "Włącz"}
          </button>
        </div>
        {validation ? (
          <fieldset className="question-validation__grid">
            <legend className="wy-sr-only">Zakres długości tekstu</legend>
            <label>
              <span>Minimum znaków</span>
              <input
                aria-describedby={hasError ? errorId : undefined}
                aria-invalid={hasError || undefined}
                data-editor-field="validation"
                max={typeLimit}
                min={0}
                onChange={(event) =>
                  onChange({
                    ...validation,
                    minLength: Number(event.currentTarget.value),
                  })
                }
                type="number"
                value={validation.minLength}
              />
            </label>
            <label>
              <span>Maksimum znaków</span>
              <input
                aria-describedby={hasError ? errorId : undefined}
                aria-invalid={hasError || undefined}
                max={typeLimit}
                min={1}
                onChange={(event) =>
                  onChange({
                    ...validation,
                    maxLength: Number(event.currentTarget.value),
                  })
                }
                type="number"
                value={validation.maxLength}
              />
            </label>
          </fieldset>
        ) : (
          <p className="question-validation__empty">Brak dodatkowego ograniczenia.</p>
        )}
        {errorContent}
      </section>
    );
  }

  if (step.type === "budget" || step.type === "number") {
    const validation = step.validation?.kind === "number_range" ? step.validation : null;
    const updateBoundary = (boundary: "max" | "min", rawValue: string) => {
      const value = rawValue === "" ? undefined : Number(rawValue);
      const min = boundary === "min" ? value : validation?.min;
      const max = boundary === "max" ? value : validation?.max;
      onChange(
        min === undefined && max === undefined
          ? undefined
          : {
              kind: "number_range",
              ...(max === undefined ? {} : { max }),
              ...(min === undefined ? {} : { min }),
            },
      );
    };
    return (
      <section className="question-validation" aria-labelledby={`validation-title-${step.key}`}>
        <div className="question-validation__heading">
          <div>
            <h3 id={`validation-title-${step.key}`}>Walidacja odpowiedzi</h3>
            <p>Ustaw jedną lub obie granice wartości.</p>
          </div>
          {validation ? (
            <button className="panel-text-button" onClick={() => onChange(undefined)} type="button">
              Wyczyść
            </button>
          ) : null}
        </div>
        <fieldset className="question-validation__grid">
          <legend className="wy-sr-only">Zakres liczbowy</legend>
          <label>
            <span>Minimum</span>
            <input
              aria-describedby={hasError ? errorId : undefined}
              aria-invalid={hasError || undefined}
              data-editor-field="validation"
              inputMode="decimal"
              onChange={(event) => updateBoundary("min", event.currentTarget.value)}
              placeholder="Bez minimum"
              type="number"
              value={validation?.min ?? ""}
            />
          </label>
          <label>
            <span>Maksimum</span>
            <input
              aria-describedby={hasError ? errorId : undefined}
              aria-invalid={hasError || undefined}
              inputMode="decimal"
              onChange={(event) => updateBoundary("max", event.currentTarget.value)}
              placeholder="Bez maksimum"
              type="number"
              value={validation?.max ?? ""}
            />
          </label>
        </fieldset>
        {errorContent}
      </section>
    );
  }

  if (step.type === "date") {
    const validation = step.validation?.kind === "date_range" ? step.validation : null;
    const updateBoundary = (boundary: "max" | "min", value: string) => {
      const min = boundary === "min" ? value || undefined : validation?.min;
      const max = boundary === "max" ? value || undefined : validation?.max;
      onChange(
        min === undefined && max === undefined
          ? undefined
          : {
              kind: "date_range",
              ...(max === undefined ? {} : { max }),
              ...(min === undefined ? {} : { min }),
            },
      );
    };
    return (
      <section className="question-validation" aria-labelledby={`validation-title-${step.key}`}>
        <div className="question-validation__heading">
          <div>
            <h3 id={`validation-title-${step.key}`}>Walidacja odpowiedzi</h3>
            <p>Ustaw najwcześniejszą lub najpóźniejszą datę.</p>
          </div>
          {validation ? (
            <button className="panel-text-button" onClick={() => onChange(undefined)} type="button">
              Wyczyść
            </button>
          ) : null}
        </div>
        <fieldset className="question-validation__grid">
          <legend className="wy-sr-only">Zakres dat</legend>
          <label>
            <span>Najwcześniej</span>
            <input
              aria-describedby={hasError ? errorId : undefined}
              aria-invalid={hasError || undefined}
              data-editor-field="validation"
              onChange={(event) => updateBoundary("min", event.currentTarget.value)}
              type="date"
              value={validation?.min ?? ""}
            />
          </label>
          <label>
            <span>Najpóźniej</span>
            <input
              aria-describedby={hasError ? errorId : undefined}
              aria-invalid={hasError || undefined}
              onChange={(event) => updateBoundary("max", event.currentTarget.value)}
              type="date"
              value={validation?.max ?? ""}
            />
          </label>
        </fieldset>
        {errorContent}
      </section>
    );
  }

  return (
    <section className="question-validation" aria-labelledby={`validation-title-${step.key}`}>
      <div className="question-validation__heading">
        <div>
          <h3 id={`validation-title-${step.key}`}>Walidacja odpowiedzi</h3>
          <p>Ten typ używa zamkniętego zestawu odpowiedzi i nie wymaga dodatkowych granic.</p>
        </div>
      </div>
      {errorContent}
    </section>
  );
}

function polishIssueCountLabel(count: number): string {
  if (count === 1) return "błąd";
  const lastTwoDigits = count % 100;
  if (lastTwoDigits >= 12 && lastTwoDigits <= 14) return "błędów";
  const lastDigit = count % 10;
  return lastDigit >= 2 && lastDigit <= 4 ? "błędy" : "błędów";
}

function polishQuestionCountLabel(count: number): string {
  if (count === 1) return "pytanie";
  const lastTwoDigits = count % 100;
  if (lastTwoDigits >= 12 && lastTwoDigits <= 14) return "pytań";
  const lastDigit = count % 10;
  return lastDigit >= 2 && lastDigit <= 4 ? "pytania" : "pytań";
}

function uniqueEstimationReferences(
  references: readonly EstimationReference[],
): EstimationReference[] {
  const seen = new Set<string>();
  return references.filter((reference) => {
    const signature = `${reference.kind}:${reference.ruleId}`;
    if (seen.has(signature)) return false;
    seen.add(signature);
    return true;
  });
}

function estimationReferenceLabel(kind: EstimationReference["kind"]): string {
  if (kind === "pricing_condition") return "warunek ceny";
  if (kind === "pricing_quantity") return "źródło ilości dla stawki jednostkowej";
  return "prywatna reguła scoringu";
}

function documentQuerySelector<ElementType extends Element>(selector: string): ElementType | null {
  return window.document.querySelector<ElementType>(selector);
}

const questionTypes: ReadonlyArray<readonly [FlowStep["type"], string]> = [
  ["single_choice", "Jednokrotny wybór"],
  ["multiple_choice", "Wielokrotny wybór"],
  ["yes_no", "Tak / nie"],
  ["short_text", "Krótka odpowiedź"],
  ["long_text", "Dłuższa odpowiedź"],
  ["number", "Liczba"],
  ["budget", "Budżet"],
  ["date", "Data"],
  ["location", "Lokalizacja"],
];

function AutoSizeQuestionTitle({
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  "data-editor-field": dataEditorField,
  maxLength,
  onValueChange,
  value,
}: Readonly<{
  "aria-describedby": string | undefined;
  "aria-invalid": boolean | undefined;
  "data-editor-field": string;
  maxLength: number;
  onValueChange: (value: string) => void;
  value: string;
}>) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    let previousWidth = -1;
    const fitToContent = () => {
      const width = textarea.getBoundingClientRect().width;
      if (Math.abs(width - previousWidth) < 0.5 && textarea.style.height) return;
      previousWidth = width;
      textarea.style.height = "auto";
      const style = window.getComputedStyle(textarea);
      const borderHeight =
        style.boxSizing === "border-box"
          ? Number.parseFloat(style.borderTopWidth) + Number.parseFloat(style.borderBottomWidth)
          : 0;
      textarea.style.height = `${textarea.scrollHeight + borderHeight}px`;
    };

    fitToContent();
    if (typeof ResizeObserver === "undefined") return;

    const resizeObserver = new ResizeObserver(fitToContent);
    resizeObserver.observe(textarea);
    return () => resizeObserver.disconnect();
  }, [value]);

  return (
    <textarea
      aria-describedby={ariaDescribedBy}
      aria-invalid={ariaInvalid}
      data-editor-field={dataEditorField}
      maxLength={maxLength}
      onChange={(event) => onValueChange(event.currentTarget.value.replace(/[\r\n]+/g, " "))}
      onKeyDown={(event) => {
        if (event.key === "Enter" && !event.nativeEvent.isComposing) event.preventDefault();
      }}
      ref={textareaRef}
      rows={1}
      value={value}
    />
  );
}

const presentationIconLabels: Readonly<Record<FlowPresentationIcon, string>> = {
  apartment: "Mieszkanie",
  building: "Budynek",
  calendar: "Kalendarz",
  camera: "Zdjęcie",
  check: "Potwierdzenie",
  clock: "Czas",
  document: "Dokument",
  door: "Drzwi",
  fence: "Ogrodzenie",
  globe: "Internet",
  home: "Dom",
  kitchen: "Kuchnia",
  layers: "Warstwy",
  location: "Lokalizacja",
  palette: "Kolor i styl",
  phone: "Telefon",
  renovation: "Remont",
  ruler: "Wymiar",
  settings: "Ustawienia",
  shopping_bag: "Zakup",
  snowflake: "Chłodzenie",
  sparkles: "Wykończenie",
  store: "Lokal handlowy",
  wardrobe: "Szafa",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseUploadedFlowMediaAsset(value: unknown): FlowMediaAsset | null {
  if (!isRecord(value) || !isRecord(value.asset)) return null;
  const asset = value.asset;
  if (
    typeof asset.id !== "string" ||
    typeof asset.name !== "string" ||
    typeof asset.previewUrl !== "string" ||
    typeof asset.sizeBytes !== "number" ||
    typeof asset.width !== "number" ||
    typeof asset.height !== "number"
  ) {
    return null;
  }
  return {
    height: asset.height,
    id: asset.id,
    name: asset.name,
    previewUrl: asset.previewUrl,
    sizeBytes: asset.sizeBytes,
    width: asset.width,
  };
}

function flowMediaUploadMessage(value: unknown): string {
  return isRecord(value) && typeof value.message === "string"
    ? value.message
    : "Nie udało się dodać zdjęcia.";
}

function buildQuestionSections(document: FlowDocument) {
  return document.sections.map((section) => ({
    key: section.key,
    steps: document.steps.flatMap((step, index) =>
      step.sectionKey === section.key ? [{ index, step }] : [],
    ),
    title: section.title,
  }));
}

function createDefaultQuestion(key: string, sectionKey: string): FlowStep {
  return {
    allowUnknown: false,
    key,
    nextStepKey: null,
    options: [
      { key: "opcja_1", label: "Opcja 1" },
      { key: "opcja_2", label: "Opcja 2" },
    ],
    presentation: { variant: "default" },
    required: true,
    sectionKey,
    title: "Nowe pytanie",
    type: "single_choice",
  };
}

function createUniqueFlowKey(prefix: "pytanie" | "sekcja", document: FlowDocument): string {
  const existingKeys = new Set([
    ...document.sections.map((section) => section.key),
    ...document.steps.map((step) => step.key),
  ]);
  const base = `${prefix}_${Date.now().toString(36)}`;
  let candidate = base;
  let suffix = 2;
  while (existingKeys.has(candidate)) {
    candidate = `${base}_${suffix}`;
    suffix += 1;
  }
  return candidate;
}

function createUniqueSectionTitle(document: FlowDocument): string {
  const titles = new Set(document.sections.map((section) => section.title.trim().toLowerCase()));
  const base = "Nowa sekcja";
  if (!titles.has(base.toLowerCase())) return base;
  let suffix = 2;
  while (titles.has(`${base} ${suffix}`.toLowerCase())) suffix += 1;
  return `${base} ${suffix}`;
}

function isChoiceType(value: string): boolean {
  return value === "multiple_choice" || value === "single_choice";
}

function QuestionTypeIcon({ type }: Readonly<{ type: FlowStep["type"] }>) {
  const symbol =
    type === "single_choice" || type === "multiple_choice"
      ? "◉"
      : type === "number" || type === "budget"
        ? "123"
        : type === "date"
          ? "□"
          : type === "location"
            ? "⌖"
            : "≡";
  return <span className="question-list__type">{symbol}</span>;
}
