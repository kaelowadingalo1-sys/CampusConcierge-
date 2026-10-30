import { createHash } from "crypto";
import {
  Assignment, CategoryCatalog, Clock, ContactDetails, DuplicateRequestKeyError, Errand,
  ErrandStatus, HelperDirectory, Identity, UnitOfWork, WorkflowTransaction,
} from "../interfaces-or-ports";
import { AppError } from "./errors";

export const ACCEPTANCE_WINDOW_MINUTES = 10;   // D-003, QS-1
const ADMIN_ID = 1;                             // single administrator in the first slice

export interface PostErrandBody {
  categoryId?: unknown; taskDetails?: unknown; deadline?: unknown; meetingPoint?: unknown;
}
export interface PostErrandResponse {
  errandId: number; status: ErrandStatus; backlog: boolean; price: number;
  deadline: string; acceptanceExpiresAt: string | null;
}
export interface PostResult { httpStatus: 200 | 201; replay: boolean; body: PostErrandResponse }

// Plain function, not an interface: only one selection rule exists (PD-R1).
// Helpers are tried in the order the directory returns them, skipping any
// helper already offered this errand.
function chooseHelpers(available: number[], alreadyOffered: number[]): number[] {
  return available.filter(h => !alreadyOffered.includes(h));
}

export class ErrandWorkflowService {
  constructor(
    private uow: UnitOfWork,
    private categories: CategoryCatalog,
    private helpers: HelperDirectory,
    private clock: Clock,
  ) {}

  // ---- Post Errand Request (UC-Post-Errand-Request, core-operation.md) ----
  async postErrand(caller: Identity | null, key: string | undefined, body: PostErrandBody): Promise<PostResult> {
    // Step 1
    if (!caller) throw new AppError(401, "NOT_AUTHENTICATED", "Sign in to post an errand.");
    if (caller.role !== "requester") throw new AppError(403, "FORBIDDEN", "Only requesters can post errands.");
    if (!caller.accountUsable) throw new AppError(403, "ACCOUNT_NOT_CONFIRMED", "Confirm your university email to post.");
    // Step 2
    if (!key || key.length < 8 || key.length > 64) {
      throw new AppError(400, "VALIDATION_FAILED", "Idempotency-Key header is required (8 to 64 characters).", ["Idempotency-Key"]);
    }
    // Step 4 (done before step 3 only for shape; replay is checked against the stored hash)
    const hash = createHash("sha256").update(JSON.stringify([
      body.categoryId, body.taskDetails, body.deadline, body.meetingPoint])).digest("hex");

    const existing = await this.uow.run(tx => this.replayIfKnown(tx, caller.userId, key, hash));
    if (existing) return existing;

    const v = this.validate(body);
    // Step 5: category must exist and be approved (BR-D1). Read before the transaction opens.
    const price = await this.categories.approvedCategoryPrice(v.categoryId);
    if (price === null) throw new AppError(422, "CATEGORY_NOT_APPROVED", "This category is not available.", ["categoryId"]);
    const available = await this.helpers.availableHelpers();

    try {
      return await this.uow.run(async tx => {
        const now = this.clock.now();
        // Steps 6 and 7 commit together or not at all.
        const errand = await tx.errands.insert({
          requesterId: caller.userId, categoryId: v.categoryId, taskDetails: v.taskDetails,
          deadline: v.deadline, price, status: "POSTED", backlog: false,
          requestKey: key, requestHash: hash,
        }, v.meetingPoint);
        await tx.events.append({
          errandId: errand.id, type: "errand_posted", fromStatus: null, toStatus: "POSTED",
          actorType: "requester", actorId: caller.userId, at: now,
        });
        const assignment = await this.offerToNextHelper(tx, errand, available);
        return { httpStatus: 201 as const, replay: false, body: this.response(errand, assignment) };
      });
    } catch (e) {
      if (e instanceof DuplicateRequestKeyError) {
        // Two identical requests arrived at once; the other one won. Replay it.
        const again = await this.uow.run(tx => this.replayIfKnown(tx, caller.userId, key, hash));
        if (again) return again;
      }
      throw e;
    }
  }

  private async replayIfKnown(tx: WorkflowTransaction, requesterId: number, key: string, hash: string): Promise<PostResult | null> {
    const found = await tx.errands.findByRequestKey(requesterId, key);
    if (!found) return null;
    if (found.requestHash !== hash) {
      throw new AppError(409, "IDEMPOTENCY_KEY_REUSED", "This key was used with a different request.");
    }
    const active = await tx.assignments.findActiveByErrand(found.id);
    return { httpStatus: 200, replay: true, body: this.response(found, active) };
  }

  private validate(b: PostErrandBody) {
    const bad: string[] = [];
    const categoryId = typeof b.categoryId === "number" && Number.isInteger(b.categoryId) ? b.categoryId : (bad.push("categoryId"), 0);
    const taskDetails = typeof b.taskDetails === "string" && b.taskDetails.trim().length >= 1 && b.taskDetails.length <= 500
      ? b.taskDetails : (bad.push("taskDetails"), "");
    const meetingPoint = typeof b.meetingPoint === "string" && b.meetingPoint.trim().length >= 1 && b.meetingPoint.length <= 200
      ? b.meetingPoint : (bad.push("meetingPoint"), "");
    let deadline = new Date(NaN);
    if (typeof b.deadline === "string") deadline = new Date(b.deadline);
    if (isNaN(deadline.getTime()) || deadline.getTime() <= this.clock.now().getTime()) bad.push("deadline");
    if (bad.length) throw new AppError(400, "VALIDATION_FAILED", "Some fields need attention.", bad);
    return { categoryId, taskDetails, meetingPoint, deadline };
  }

  private response(e: Errand, a: Assignment | null): PostErrandResponse {
    return {
      errandId: e.id, status: e.status, backlog: e.backlog, price: e.price,
      deadline: e.deadline.toISOString(),
      acceptanceExpiresAt: a && a.outcome === null ? a.expiresAt.toISOString() : null,
    };
  }

  // Offers the errand to the next helper, or marks it backlog (QS-3). Used on posting and on reassignment.
  private async offerToNextHelper(tx: WorkflowTransaction, errand: Errand, available: number[]): Promise<Assignment | null> {
    const now = this.clock.now();
    const tried = await tx.assignments.helpersOffered(errand.id);
    for (const helperId of chooseHelpers(available, tried)) {
      const assignment = await tx.assignments.tryCreateActive({
        errandId: errand.id, helperId, assignedAt: now,
        expiresAt: new Date(now.getTime() + ACCEPTANCE_WINDOW_MINUTES * 60_000),
      });
      if (!assignment) continue;   // helper busy: another errand got there first (DI-1)
      const from = errand.status;
      errand.status = "AWAITING_ACCEPTANCE";
      errand.backlog = false;
      await tx.errands.update(errand);
      await tx.events.append({
        errandId: errand.id, type: "helper_assigned", fromStatus: from, toStatus: errand.status,
        actorType: "system", actorId: null, at: now, detail: "helper " + helperId,
      });
      await tx.outbox.add({
        errandId: errand.id, assignmentId: assignment.id, recipientId: helperId, recipientRole: "helper",
        type: "offer", payload: "You have been offered errand " + errand.id,
      });
      return assignment;
    }
    if (!errand.backlog) {
      errand.backlog = true;
      await tx.errands.update(errand);
      await tx.events.append({
        errandId: errand.id, type: "backlog_flagged", fromStatus: errand.status, toStatus: errand.status,
        actorType: "system", actorId: null, at: now,
      });
      await tx.outbox.add({
        errandId: errand.id, assignmentId: null, recipientId: ADMIN_ID, recipientRole: "administrator",
        type: "capacity_backlog", payload: "No helper free for errand " + errand.id,
      });
    }
    return null;
  }

  // ---- Helper answers an offer (FR-03) ----
  async helperAccept(caller: Identity | null, assignmentId: number): Promise<{ status: ErrandStatus }> {
    const helper = this.requireRole(caller, "helper");
    return this.uow.run(async tx => {
      const a = await this.ownActiveOffer(tx, helper, assignmentId);
      const errand = (await tx.errands.findByIdForUpdate(a.errandId))!;
      const now = this.clock.now();
      await tx.assignments.close(a.id, "accepted");
      await tx.assignments.markHelperConfirmed(a.id);
      await tx.outbox.cancelFor(a.id);
      const from = errand.status;
      errand.status = "ACCEPTED";
      await tx.errands.update(errand);
      await tx.events.append({
        errandId: errand.id, type: "helper_accepted", fromStatus: from, toStatus: "ACCEPTED",
        actorType: "helper", actorId: helper.userId, at: now,
      });
      await tx.outbox.add({
        errandId: errand.id, assignmentId: a.id, recipientId: errand.requesterId, recipientRole: "requester",
        type: "helper_accepted", payload: "A helper accepted errand " + errand.id + ". Confirm to lock the terms.",
      });
      return { status: errand.status };
    });
  }

  async helperDecline(caller: Identity | null, assignmentId: number): Promise<{ status: ErrandStatus }> {
    const helper = this.requireRole(caller, "helper");
    const available = await this.helpers.availableHelpers();
    return this.uow.run(async tx => {
      const a = await this.ownActiveOffer(tx, helper, assignmentId);
      return this.closeAndReassign(tx, a, "declined", { type: "helper", id: helper.userId }, available);
    });
  }

  private async ownActiveOffer(tx: WorkflowTransaction, helper: Identity, assignmentId: number): Promise<Assignment> {
    const a = await tx.assignments.findByIdForUpdate(assignmentId);
    if (!a || a.helperId !== helper.userId) throw new AppError(404, "NOT_FOUND", "Offer not found.");
    if (!a.isActive || a.outcome !== null) throw new AppError(409, "OFFER_NOT_ACTIVE", "This offer is no longer open.");
    if (this.clock.now().getTime() >= a.expiresAt.getTime()) throw new AppError(409, "OFFER_EXPIRED", "This offer expired.");
    return a;
  }

  // Records the outcome, cancels the unsent offer, and offers the errand onward in one transaction.
  private async closeAndReassign(
    tx: WorkflowTransaction, a: Assignment, outcome: "declined" | "timed_out",
    actor: { type: "helper" | "system"; id: number | null }, available: number[],
  ): Promise<{ status: ErrandStatus }> {
    const errand = (await tx.errands.findByIdForUpdate(a.errandId))!;
    const now = this.clock.now();
    await tx.assignments.close(a.id, outcome);
    await tx.outbox.cancelFor(a.id);
    const from = errand.status;
    errand.status = "POSTED";
    await tx.errands.update(errand);
    await tx.events.append({
      errandId: errand.id, type: outcome === "declined" ? "helper_declined" : "assignment_timed_out",
      fromStatus: from, toStatus: "POSTED", actorType: actor.type, actorId: actor.id, at: now,
      detail: "helper " + a.helperId,
    });
    await this.offerToNextHelper(tx, errand, available);
    return { status: errand.status };
  }

  // ---- Expiry sweep (QS-1): run at start-up and on an interval ----
  async expireDueAssignments(): Promise<number> {
    const due = await this.uow.run(tx => tx.assignments.findDue(this.clock.now()));
    let done = 0;
    for (const id of due) {
      const available = await this.helpers.availableHelpers();
      await this.uow.run(async tx => {
        const a = await tx.assignments.findByIdForUpdate(id);
        // Re-check inside the transaction: the helper may have answered in the meantime.
        if (!a || !a.isActive || a.outcome !== null || a.expiresAt.getTime() > this.clock.now().getTime()) return;
        await this.closeAndReassign(tx, a, "timed_out", { type: "system", id: null }, available);
        done++;
      });
    }
    return done;
  }

  // ---- Backlog retry (QS-3): offer waiting errands, oldest first, to helpers who are now free ----
  async retryBacklog(limit = 50): Promise<number> {
    const available = await this.helpers.availableHelpers();
    if (available.length === 0) return 0;
    return this.uow.run(async tx => {
      let offered = 0;
      for (const errand of await tx.errands.findBacklogForUpdate(limit)) {
        if (await this.offerToNextHelper(tx, errand, available)) offered++;
      }
      return offered;
    });
  }

  // ---- Requester confirms the helper (locks the terms) ----
  async requesterConfirm(caller: Identity | null, errandId: number): Promise<{ status: ErrandStatus; termsLocked: boolean }> {
    const req = this.requireRole(caller, "requester");
    return this.uow.run(async tx => {
      const errand = await tx.errands.findByIdForUpdate(errandId);
      if (!errand || errand.requesterId !== req.userId) throw new AppError(404, "NOT_FOUND", "Errand not found.");
      const a = await tx.assignments.findActiveByErrand(errandId);
      if (errand.status !== "ACCEPTED" || !a || !a.helperConfirmed) {
        throw new AppError(409, "NOT_READY", "A helper has not accepted this errand yet.");
      }
      if (!a.requesterConfirmed) {
        await tx.assignments.markRequesterConfirmed(a.id);
        await tx.events.append({
          errandId, type: "terms_locked", fromStatus: errand.status, toStatus: errand.status,
          actorType: "requester", actorId: req.userId, at: this.clock.now(),
        });
        await tx.outbox.add({
          errandId, assignmentId: a.id, recipientId: a.helperId, recipientRole: "helper",
          type: "terms_locked", payload: "Errand " + errandId + " is confirmed. Contact details are now available.",
        });
      }
      return { status: errand.status, termsLocked: true };
    });
  }

  // ---- Confirmation gate (QS-2, DI-8): the only way contact details leave the server ----
  async contactFor(caller: Identity | null, errandId: number): Promise<ContactDetails> {
    if (!caller) throw new AppError(401, "NOT_AUTHENTICATED", "Sign in first.");
    return this.uow.run(async tx => {
      const errand = await tx.errands.findById(errandId);
      const a = await tx.assignments.findActiveByErrand(errandId);
      const isRequester = caller.role === "requester" && errand?.requesterId === caller.userId;
      const isHelper = caller.role === "helper" && a?.helperId === caller.userId;
      if (!errand || !(isRequester || isHelper)) throw new AppError(404, "NOT_FOUND", "Errand not found.");
      if (!a || !a.helperConfirmed || !a.requesterConfirmed) {
        throw new AppError(403, "CONTACT_NOT_AVAILABLE", "Contact details appear after both of you confirm.");
      }
      const contact = (await tx.errands.findContact(errandId))!;
      const helperPhone = await tx.assignments.helperPhone(a.helperId);
      return { meetingPoint: contact.meetingPoint, requesterPhone: contact.requesterPhone, helperPhone };
    });
  }

  // ---- Status for the owner (R2 / R2b / R3): never contains contact details ----
  async statusFor(caller: Identity | null, errandId: number) {
    const req = this.requireRole(caller, "requester");
    return this.uow.run(async tx => {
      const errand = await tx.errands.findById(errandId);
      if (!errand || errand.requesterId !== req.userId) throw new AppError(404, "NOT_FOUND", "Errand not found.");
      const a = await tx.assignments.findActiveByErrand(errandId);
      return this.response(errand, a);
    });
  }

  private requireRole(caller: Identity | null, role: "requester" | "helper"): Identity {
    if (!caller) throw new AppError(401, "NOT_AUTHENTICATED", "Sign in first.");
    if (caller.role !== role) throw new AppError(403, "FORBIDDEN", "This action is for " + role + "s.");
    if (!caller.accountUsable) throw new AppError(403, "ACCOUNT_NOT_CONFIRMED", "Confirm your university email first.");
    return caller;
  }
}
