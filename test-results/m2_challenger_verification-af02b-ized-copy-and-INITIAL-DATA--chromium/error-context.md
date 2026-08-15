# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: m2_challenger_verification.spec.ts >> Milestone 2 Empirical Challenge Verification >> 4. Data Fidelity & Schema.org Pre-Rendering >> CH-M2-007 [/turkeys/york]: Pre-rendered JSON-LD, localized copy and __INITIAL_DATA__
- Location: tests/m2_challenger_verification.spec.ts:277:7

# Error details

```
Error: apiRequestContext.get: connect ECONNREFUSED ::1:3000
Call log:
  - → GET http://localhost:3000/turkeys/york
    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
    - accept: */*
    - accept-encoding: gzip,deflate,br

```