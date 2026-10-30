import express, { NextFunction, Request, Response } from "express";
import { IdentityCheck } from "../interfaces-or-ports";
import { AppError } from "../core/errors";
import { ErrandWorkflowService } from "../core/errand-workflow-service";

export function createApp(service: ErrandWorkflowService, identity: IdentityCheck) {
  const app = express();
  app.use(express.json());

  const who = (req: Request) => identity.identify(req.header("authorization"));
  const wrap = (fn: (req: Request, res: Response) => Promise<void>) =>
    (req: Request, res: Response, next: NextFunction) => fn(req, res).catch(next);

  app.post("/errands", wrap(async (req, res) => {
    const r = await service.postErrand(await who(req), req.header("idempotency-key"), req.body ?? {});
    if (r.replay) res.setHeader("Idempotent-Replay", "true");
    res.status(r.httpStatus).json(r.body);
  }));

  app.get("/errands/:id", wrap(async (req, res) => {
    res.json(await service.statusFor(await who(req), Number(req.params.id)));
  }));

  app.post("/errands/:id/confirm", wrap(async (req, res) => {
    res.json(await service.requesterConfirm(await who(req), Number(req.params.id)));
  }));

  app.get("/errands/:id/contact", wrap(async (req, res) => {
    res.json(await service.contactFor(await who(req), Number(req.params.id)));
  }));

  app.post("/assignments/:id/accept", wrap(async (req, res) => {
    res.json(await service.helperAccept(await who(req), Number(req.params.id)));
  }));

  app.post("/assignments/:id/decline", wrap(async (req, res) => {
    res.json(await service.helperDecline(await who(req), Number(req.params.id)));
  }));

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof AppError) {
      res.status(err.status).json({ error: err.code, message: err.message, fields: err.fields });
      return;
    }
    if (err instanceof SyntaxError) {
      res.status(400).json({ error: "VALIDATION_FAILED", message: "Request body is not valid JSON.", fields: [] });
      return;
    }
    // Anything else is treated as the database or another dependency being unavailable.
    console.error(err);
    res.status(503).json({ error: "SERVICE_UNAVAILABLE", message: "Please try again.", fields: [] });
  });
  return app;
}
