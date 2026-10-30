import { Pool, PoolClient } from "pg";
import {
  Assignment, AssignmentOutcome, Errand, ErrandEvent, NewAssignment, NewErrand,
  NewOutboxMessage, OutboxMessage, ErrandStatus, UnitOfWork, WorkflowTransaction,
  DuplicateRequestKeyError,
} from "../interfaces-or-ports";

type Row = Record<string, any>;

const errandOf = (r: Row): Errand => ({
  id: r.errand_id, requesterId: r.requester_id, categoryId: r.category_id,
  taskDetails: r.task_details, deadline: r.deadline, price: r.price,
  status: r.status as ErrandStatus, backlog: r.backlog,
  requestKey: r.request_key, requestHash: r.request_hash,
});
const assignmentOf = (r: Row): Assignment => ({
  id: r.assignment_id, errandId: r.errand_id, helperId: r.helper_id,
  assignedAt: r.assigned_at, expiresAt: r.expires_at, outcome: r.outcome,
  helperConfirmed: r.helper_confirmed, requesterConfirmed: r.requester_confirmed,
  isActive: r.is_active,
});

export class PgWorkflowStore implements UnitOfWork {
  constructor(private pool: Pool) {}

  async run<T>(work: (tx: WorkflowTransaction) => Promise<T>): Promise<T> {
    const c = await this.pool.connect();
    try {
      await c.query("BEGIN");
      const result = await work(this.repositories(c));
      await c.query("COMMIT");
      return result;
    } catch (e) {
      await c.query("ROLLBACK");
      throw e;
    } finally {
      c.release();
    }
  }

  private repositories(c: PoolClient): WorkflowTransaction {
    return {
      errands: {
        async insert(e: NewErrand, meetingPoint: string) {
          await c.query("SAVEPOINT ins");
          try {
            const r = await c.query(
              `INSERT INTO errand (requester_id, category_id, task_details, deadline, price,
                                   status, backlog, request_key, request_hash)
               VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
              [e.requesterId, e.categoryId, e.taskDetails, e.deadline, e.price,
               e.status, e.backlog, e.requestKey, e.requestHash]);
            await c.query("RELEASE SAVEPOINT ins");
            const saved = errandOf(r.rows[0]);
            await c.query(
              "INSERT INTO errand_contact (errand_id, meeting_point, requester_phone) SELECT $1, $2, contact_phone FROM requester WHERE requester_id = $3",
              [saved.id, meetingPoint, saved.requesterId]);
            return saved;
          } catch (err: any) {
            if (err.code === "23505" && err.constraint === "errand_request_key_uq") {
              await c.query("ROLLBACK TO SAVEPOINT ins");
              throw new DuplicateRequestKeyError();
            }
            throw err;
          }
        },
        async update(e: Errand) {
          await c.query("UPDATE errand SET status=$2, backlog=$3 WHERE errand_id=$1", [e.id, e.status, e.backlog]);
        },
        async findById(id: number) {
          const r = await c.query("SELECT * FROM errand WHERE errand_id=$1", [id]);
          return r.rows[0] ? errandOf(r.rows[0]) : null;
        },
        async findByIdForUpdate(id: number) {
          const r = await c.query("SELECT * FROM errand WHERE errand_id=$1 FOR UPDATE", [id]);
          return r.rows[0] ? errandOf(r.rows[0]) : null;
        },
        async findBacklogForUpdate(limit: number) {
          const r = await c.query(
            "SELECT * FROM errand WHERE backlog AND status = 'POSTED' ORDER BY errand_id LIMIT $1 FOR UPDATE SKIP LOCKED", [limit]);
          return r.rows.map(errandOf);
        },
        async findByRequestKey(requesterId: number, key: string) {
          const r = await c.query("SELECT * FROM errand WHERE requester_id=$1 AND request_key=$2", [requesterId, key]);
          return r.rows[0] ? errandOf(r.rows[0]) : null;
        },
        async findContact(errandId: number) {
          const r = await c.query("SELECT meeting_point, requester_phone FROM errand_contact WHERE errand_id=$1", [errandId]);
          return r.rows[0] ? { meetingPoint: r.rows[0].meeting_point, requesterPhone: r.rows[0].requester_phone } : null;
        },
      },
      assignments: {
        async tryCreateActive(a: NewAssignment) {
          await c.query("SAVEPOINT asg");
          try {
            const r = await c.query(
              `INSERT INTO assignment (errand_id, helper_id, assigned_at, expires_at)
               VALUES ($1,$2,$3,$4) RETURNING *`,
              [a.errandId, a.helperId, a.assignedAt, a.expiresAt]);
            await c.query("RELEASE SAVEPOINT asg");
            return assignmentOf(r.rows[0]);
          } catch (err: any) {
            if (err.code === "23505") {
              await c.query("ROLLBACK TO SAVEPOINT asg");
              return null;
            }
            throw err;
          }
        },
        async findByIdForUpdate(id: number) {
          const r = await c.query("SELECT * FROM assignment WHERE assignment_id=$1 FOR UPDATE", [id]);
          return r.rows[0] ? assignmentOf(r.rows[0]) : null;
        },
        async findActiveByErrand(errandId: number) {
          const r = await c.query("SELECT * FROM assignment WHERE errand_id=$1 AND is_active", [errandId]);
          return r.rows[0] ? assignmentOf(r.rows[0]) : null;
        },
        async helpersOffered(errandId: number) {
          const r = await c.query("SELECT helper_id FROM assignment WHERE errand_id=$1", [errandId]);
          return r.rows.map((x: Row) => x.helper_id);
        },
        async findDue(now: Date) {
          const r = await c.query(
            "SELECT assignment_id FROM assignment WHERE is_active AND outcome IS NULL AND expires_at <= $1 ORDER BY assignment_id", [now]);
          return r.rows.map((x: Row) => x.assignment_id);
        },
        async close(id: number, outcome: AssignmentOutcome) {
          // accepted stays active (it is the live assignment); declined and timed_out are closed.
          const active = outcome === "accepted";
          await c.query("UPDATE assignment SET outcome=$2, is_active=$3 WHERE assignment_id=$1", [id, outcome, active]);
        },
        async markHelperConfirmed(id: number) {
          await c.query("UPDATE assignment SET helper_confirmed=true WHERE assignment_id=$1", [id]);
        },
        async markRequesterConfirmed(id: number) {
          await c.query("UPDATE assignment SET requester_confirmed=true WHERE assignment_id=$1", [id]);
        },
        async helperPhone(helperId: number) {
          const r = await c.query("SELECT contact_phone FROM helper WHERE helper_id=$1", [helperId]);
          return r.rows[0].contact_phone;
        },
      },
      events: {
        async append(e: ErrandEvent) {
          await c.query(
            `INSERT INTO errand_event (errand_id, event_type, from_status, to_status, actor_type, actor_id, occurred_at, detail)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
            [e.errandId, e.type, e.fromStatus, e.toStatus, e.actorType, e.actorId, e.at, e.detail ?? null]);
        },
      },
      outbox: {
        async add(m: NewOutboxMessage) {
          await c.query(
            `INSERT INTO notification_outbox (errand_id, assignment_id, recipient_id, recipient_role, type, payload)
             VALUES ($1,$2,$3,$4,$5,$6)`,
            [m.errandId, m.assignmentId, m.recipientId, m.recipientRole, m.type, m.payload]);
        },
        async listUnsent(limit: number) {
          const r = await c.query(
            "SELECT * FROM notification_outbox WHERE sent_at IS NULL AND NOT cancelled ORDER BY outbox_id LIMIT $1", [limit]);
          return r.rows.map((x: Row): OutboxMessage => ({
            id: x.outbox_id, errandId: x.errand_id, assignmentId: x.assignment_id,
            recipientId: x.recipient_id, recipientRole: x.recipient_role, type: x.type,
            payload: x.payload, attempts: x.attempts,
          }));
        },
        async markSent(id: number) {
          await c.query("UPDATE notification_outbox SET sent_at=now() WHERE outbox_id=$1", [id]);
        },
        async markFailed(id: number) {
          await c.query("UPDATE notification_outbox SET attempts=attempts+1 WHERE outbox_id=$1", [id]);
        },
        async cancelFor(assignmentId: number) {
          await c.query(
            "UPDATE notification_outbox SET cancelled=true WHERE assignment_id=$1 AND sent_at IS NULL", [assignmentId]);
        },
      },
    };
  }
}
