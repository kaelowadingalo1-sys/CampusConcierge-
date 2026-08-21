# Contribution agreement

## Branches and commits

- Create work from `main` on `feature/<topic>`, `fix/<topic>`, or `docs/<topic>`.
- Keep commits small and descriptive, using the imperative mood.
- Open a pull request before merging into `main`; at least one teammate reviews shared artefacts.

## Artefact rules

- Store editable source in `models/`, `prototype/`, `tests/`, and `design-record/`.
- Store the `.drawio` source for every model. Exported SVG/PDF are optional; a screenshot alone is never acceptable as evidence.
- Link design decisions to evidence, consequences, and the next uncertainty.

## Before hand-off

1. Clone into a new folder.
2. Open `README.md` and follow every linked artefact.
3. Confirm each model's `.drawio` source opens in draw.io (app.diagrams.net). Exported SVG/PDF are optional and, if present, should sit beside the source, not replace it.
4. Record failures in `evidence/reproducibility-check.md`.