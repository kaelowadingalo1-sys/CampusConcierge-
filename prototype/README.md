# Prototype

This folder holds the controlled matching scenarios used to evaluate the assignment/reassignment logic, per lecturer condition R5 (evaluate via controlled scenarios, not a real pilot).

- `scenarios/`: one file per scenario (helper accepts, helper declines, helper timeout, no helper available, multiple helpers available, multiple errands compete), each stating the initial system state and expected result.

Actual results are recorded in `tests/matching-scenario-results.md` once the matching logic exists to run them against. If a working UI prototype is added later, its editable source and a link to the scenario it tests should live here too, alongside the scenario files it corresponds to. 