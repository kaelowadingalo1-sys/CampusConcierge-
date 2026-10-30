-- Campus Concierge: schema for the Phase 2 vertical slice.
-- Matches models/logical-data-model.drawio. Differences are listed in docs/reconciliation-matrix.md.

CREATE TABLE requester (
  requester_id   serial PRIMARY KEY,
  student_number text NOT NULL UNIQUE,
  name           text NOT NULL,
  contact_phone  text NOT NULL
);

CREATE TABLE administrator (
  administrator_id serial PRIMARY KEY,
  student_number   text NOT NULL UNIQUE,
  name             text NOT NULL
);

CREATE TABLE helper (
  helper_id      serial PRIMARY KEY,
  student_number text NOT NULL UNIQUE,
  name           text NOT NULL,
  contact_phone  text NOT NULL,
  available      boolean NOT NULL DEFAULT true,
  vetted_by      integer REFERENCES administrator(administrator_id)
);

CREATE TABLE errand_category (
  category_id    serial PRIMARY KEY,
  name           text NOT NULL UNIQUE,
  approved       boolean NOT NULL,
  standard_price integer NOT NULL CHECK (standard_price >= 0)
);

CREATE TABLE errand (
  errand_id    serial PRIMARY KEY,
  requester_id integer NOT NULL REFERENCES requester(requester_id),
  category_id  integer NOT NULL REFERENCES errand_category(category_id),
  task_details text NOT NULL CHECK (char_length(task_details) BETWEEN 1 AND 500),
  deadline     timestamptz NOT NULL,
  price        integer NOT NULL CHECK (price >= 0),          -- locked at posting (BR-D2)
  status       text NOT NULL CHECK (status IN
                 ('POSTED','AWAITING_ACCEPTANCE','ACCEPTED','IN_PROGRESS',
                  'COMPLETED','CANCELLED','DISPUTED','CLOSED')),
  backlog      boolean NOT NULL DEFAULT false,
  request_key  text NOT NULL,
  request_hash text NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT errand_request_key_uq UNIQUE (requester_id, request_key)   -- DI-7
);

CREATE TABLE assignment (
  assignment_id       serial PRIMARY KEY,
  errand_id           integer NOT NULL REFERENCES errand(errand_id),
  helper_id           integer NOT NULL REFERENCES helper(helper_id),
  assigned_at         timestamptz NOT NULL,
  expires_at          timestamptz NOT NULL,
  outcome             text CHECK (outcome IN ('accepted','declined','timed_out')),
  helper_confirmed    boolean NOT NULL DEFAULT false,
  requester_confirmed boolean NOT NULL DEFAULT false,
  is_active           boolean NOT NULL DEFAULT true
);
CREATE UNIQUE INDEX assignment_one_active_per_helper ON assignment (helper_id) WHERE is_active;   -- DI-1
CREATE UNIQUE INDEX assignment_one_active_per_errand ON assignment (errand_id) WHERE is_active;   -- DI-2

-- DI-3: an outcome, once set, cannot change.
CREATE FUNCTION assignment_outcome_immutable() RETURNS trigger AS $$
BEGIN
  IF OLD.outcome IS NOT NULL AND NEW.outcome IS DISTINCT FROM OLD.outcome THEN
    RAISE EXCEPTION 'assignment outcome is already recorded';
  END IF;
  RETURN NEW;
END $$ LANGUAGE plpgsql;
CREATE TRIGGER assignment_outcome_guard BEFORE UPDATE ON assignment
  FOR EACH ROW EXECUTE FUNCTION assignment_outcome_immutable();

CREATE TABLE errand_contact (                                   -- DI-8: read only through the gate
  errand_id       integer PRIMARY KEY REFERENCES errand(errand_id),
  meeting_point   text NOT NULL CHECK (char_length(meeting_point) BETWEEN 1 AND 200),
  requester_phone text NOT NULL
);

CREATE TABLE dispute (
  dispute_id  serial PRIMARY KEY,
  errand_id   integer NOT NULL UNIQUE REFERENCES errand(errand_id),   -- DI-4
  opened_by   text NOT NULL,
  reason      text NOT NULL,
  opened_at   timestamptz NOT NULL DEFAULT now(),
  resolution  text,
  resolved_at timestamptz,
  resolved_by integer REFERENCES administrator(administrator_id),
  CHECK (resolution IS NULL OR resolved_by IS NOT NULL)               -- DI-5
);

CREATE TABLE errand_event (
  event_id    serial PRIMARY KEY,
  errand_id   integer NOT NULL REFERENCES errand(errand_id),
  event_type  text NOT NULL,
  from_status text,
  to_status   text,
  actor_type  text NOT NULL,
  actor_id    integer,
  occurred_at timestamptz NOT NULL,
  detail      text
);
-- DI-10: history rows are never edited or deleted.
CREATE FUNCTION errand_event_append_only() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'errand_event is append-only';
END $$ LANGUAGE plpgsql;
CREATE TRIGGER errand_event_no_change BEFORE UPDATE OR DELETE ON errand_event
  FOR EACH ROW EXECUTE FUNCTION errand_event_append_only();

CREATE TABLE notification_outbox (
  outbox_id     serial PRIMARY KEY,
  errand_id     integer NOT NULL REFERENCES errand(errand_id),
  assignment_id integer REFERENCES assignment(assignment_id),
  recipient_id  integer NOT NULL,
  recipient_role text NOT NULL,
  type          text NOT NULL,
  payload       text NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  sent_at       timestamptz,
  attempts      integer NOT NULL DEFAULT 0,
  cancelled     boolean NOT NULL DEFAULT false
);
