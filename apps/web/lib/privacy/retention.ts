import type { Database } from "@wyceno/database";

import { createServiceClient } from "../supabase/service";

type LeadCandidate = Database["public"]["Functions"]["get_retention_candidates"]["Returns"][number];
type SessionCandidate =
  Database["public"]["Functions"]["get_expired_session_candidates"]["Returns"][number];

export interface RetentionRepository {
  findExpiredLeads(batchSize: number): Promise<LeadCandidate[]>;
  findExpiredSessions(batchSize: number): Promise<SessionCandidate[]>;
  purgeLeads(leadIds: string[]): Promise<number>;
  purgeSessions(sessionIds: string[]): Promise<number>;
  removeObjects(objectPaths: string[]): Promise<void>;
}

export type RetentionBatchResult = Readonly<{
  filesRemoved: number;
  leadCandidates: number;
  leadsPurged: number;
  sessionCandidates: number;
  sessionsPurged: number;
}>;

function uniqueObjectPaths(candidates: ReadonlyArray<{ object_paths: string[] }>): string[] {
  return [...new Set(candidates.flatMap((candidate) => candidate.object_paths))];
}

export async function processRetentionBatch(
  repository: RetentionRepository,
  batchSize = 100,
): Promise<RetentionBatchResult> {
  const [leadCandidates, sessionCandidates] = await Promise.all([
    repository.findExpiredLeads(batchSize),
    repository.findExpiredSessions(batchSize),
  ]);
  const objectPaths = uniqueObjectPaths([...leadCandidates, ...sessionCandidates]);

  // Storage is deliberately removed before database records. A failed object
  // removal leaves the database as the recoverable source of truth.
  if (objectPaths.length > 0) await repository.removeObjects(objectPaths);

  const leadsPurged =
    leadCandidates.length > 0
      ? await repository.purgeLeads(leadCandidates.map((candidate) => candidate.lead_id))
      : 0;
  const sessionsPurged =
    sessionCandidates.length > 0
      ? await repository.purgeSessions(sessionCandidates.map((candidate) => candidate.session_id))
      : 0;

  return {
    filesRemoved: objectPaths.length,
    leadCandidates: leadCandidates.length,
    leadsPurged,
    sessionCandidates: sessionCandidates.length,
    sessionsPurged,
  };
}

function databaseRepository(): RetentionRepository {
  const client = createServiceClient();
  return {
    async findExpiredLeads(batchSize) {
      const { data, error } = await client.rpc("get_retention_candidates", {
        batch_size: batchSize,
      });
      if (error) throw new Error("Retention lead selection failed.");
      return data;
    },
    async findExpiredSessions(batchSize) {
      const { data, error } = await client.rpc("get_expired_session_candidates", {
        batch_size: batchSize,
      });
      if (error) throw new Error("Retention session selection failed.");
      return data;
    },
    async purgeLeads(leadIds) {
      const { data, error } = await client.rpc("purge_retention_candidates", {
        target_lead_ids: leadIds,
      });
      if (error) throw new Error("Retention lead purge failed.");
      return data;
    },
    async purgeSessions(sessionIds) {
      const { data, error } = await client.rpc("purge_expired_sessions", {
        target_session_ids: sessionIds,
      });
      if (error) throw new Error("Retention session purge failed.");
      return data;
    },
    async removeObjects(objectPaths) {
      for (let offset = 0; offset < objectPaths.length; offset += 100) {
        const { error } = await client.storage
          .from("tenant-private")
          .remove(objectPaths.slice(offset, offset + 100));
        if (error) throw new Error("Retention storage purge failed.");
      }
    },
  };
}

export async function processConfiguredRetentionBatch(): Promise<RetentionBatchResult> {
  return processRetentionBatch(databaseRepository());
}
