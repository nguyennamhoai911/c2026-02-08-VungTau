# GitHub Copilot Instructions - Vũng Tàu Tide App

## Project Overview
A client-side progressive web app forecasting tide levels and beach activities (beach football at Bai Dua/Bai Sau, crab catching, and beach walking) for Vung Tau, Vietnam (2026–2027).

## Skills & Architecture
- Beach Football Tide Calibration: Follow instructions in `.agents/skills/football-tide-calibration/SKILL.md`.
- Historical Observation Log: Located at `docs/lich_su_thuc_te_da_banh.json`.
- Verification Script: Run `node .agents/skills/football-tide-calibration/scripts/verify_calibration.mjs` to test against all historical observations.
- Data Recovery Skill: See `.agents/skills/project-data-recovery/SKILL.md`.

## Key Logic
- Football Beach Selection: Bai Dua is selected when score >= 15%. When score < 15%, Bai Sau is selected.
- Rising Tide (17:00–18:00): 18:00 >= 2.8m or (18:00 >= 2.7m & 17:00 >= 2.4m) -> 0%. Low early tide (17:00 <= 2.35m, 17:30 <= 2.50m) -> 20%.
- Falling Tide (17:00–18:00): 18:00 >= 2.6m or 17:30 >= 2.75m -> 0%. End-of-window receding <= 2.45m -> 20%.

## Constraints
- Never delete files without explicit user consent ("được phép").
- Never run heavy build checks (`npm run build`).
- Always update inline script sha256 CSP hash in `vercel.json` and `tide-app/vercel.json` upon modifying inline script in `tide-app/public/index.html`.
