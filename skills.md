# fleetflow-admin: Skills Index

**Every session**: pick the skill(s) for the task below. Load only on a matching trigger. **design.md and the project docs win over any skill.**

Research date: 2026-11-21. Each skill's contents and hooks were inspected.

## Which skill for which task
| Task | Use | Don't use |
|---|---|---|
| Any coding task | `ponytail` (always on, `full`) | — |
| Chat replies | `caveman` (always on, moderate); `/ultracave` for routine mechanical tasks | Not for docs, commits, PR text or UI copy |
| Building a new screen or component | `fleetflow-admin-ui` (project) first, then `frontend-design` for craft within design.md's constraints | `frontend-design` must not introduce new fonts, colours or styles outside design.md |
| Design critique, UX review, polish, a11y audit of built UI | `impeccable` (`/impeccable critique`, `audit`, `polish`, `harden`, `clarify`, `distill`) | Its "bolder/colorize" style commands conflict with design.md. Use them only with owner approval |
| Exploring palettes, type or patterns before a design.md change proposal | `ui-ux-pro-max` (global user skill) | Never to override design.md directly |
| Writing tests | `fleetflow-admin-testing` (project) + `superpowers:test-driven-development` for logic (`lib/`, schemas) | TDD ritual for pure markup tweaks |
| Unclear bug | `superpowers:systematic-debugging` | — |
| Module kickoff or substantial feature | `superpowers:brainstorming` → `superpowers:writing-plans` | Small tasks |
| Before finishing | `superpowers:verification-before-completion` | — |
| Review | `ponytail-review` (bloat), built-in `/code-review` (correctness), `/security-review` | — |

## Installed / enabled for this repo
| Skill / plugin | Source | Version (commit) | License | Install method | Notes |
|---|---|---|---|---|---|
| ponytail | github `DietrichGebert/ponytail` | 5.3.3 (`96608e0`) | MIT | `.claude/settings.json` marketplace + `enabledPlugins` | Local-only ledger; webhook off by default |
| caveman | github `JuliusBrussee/caveman` | 4.1.0 (`a192894`) | Apache-2.0 / MIT | same | Modes: `caveman` (default), `ultracave`; `megacave` not used. Never run `caveman-compress` on project docs |
| superpowers | `claude-plugins-official` → `obra/superpowers` (`22f0b46`) | 7.0.2 | MIT | `enabledPlugins` | Injects ~3 KB at session start; defers to CLAUDE.md |
| frontend-design | `claude-plugins-official` (source `anthropics/skills`) | marketplace version | Apache-2.0 | `enabledPlugins` | Pure guidance skill, no hooks |
| impeccable | github `pbakaus/impeccable` | 4.10.0 (`b49177d`) | Apache-2.0 | marketplace + `enabledPlugins` | Hooks on SessionStart, PostToolUse (Edit/Write) and Stop run its local `scripts/impeccable hook` (anti-pattern detection). On first run it downloads a prebuilt engine binary from `github.com/pbakaus/impeccable/releases`, **verified against pinned sha256 checksums and fails closed** if no checksum matches. Adds latency on edits; disable in `.claude/settings.local.json` if it gets noisy |
| ui-ux-pro-max | `nextlevelbuilder/ui-ux-pro-max-skill` | 2.15.0 (`f76d165`) | MIT | **already installed as a global user skill** (`~/.claude/skills/ui-ux-pro-max`); not duplicated here | Large searchable data set: load only on demand |
| fleetflow-admin-ui | this repo `.claude/skills/` | — | project | committed | Pointer into design.md and architecture |
| fleetflow-admin-testing | this repo | — | project | committed | Pointer into architecture §24 |

First run: Claude Code prompts you to trust the repo and install the declared plugins. Global `~/.claude/settings.json` is not modified by this repo.

## Evaluated and excluded
| Skill | Why |
|---|---|
| `playwright` MCP (official) | Useful for driving a live browser later; adds an MCP server and tools to every session. **PROPOSED for Phase 1** when there is UI to inspect |
| `typescript-lsp` (official) | Needs code to exist; **PROPOSED for Phase 0** |
| `anthropics/skills` webapp-testing | Python-based Playwright helper; overlaps with our TS Playwright setup |
| `vercel` plugin | Hosting not decided |
| `claude-seo` (global) | The admin console is not indexed (noindex); disabled here |
| `security-guidance` | Per-turn LLM review hook is costly; `/security-review` is used on demand |

## Updating skills
`/plugin` → update the marketplace (or `claude plugin marketplace update <name>`). Read the changed SKILL.md and hooks before accepting, especially new hooks or network calls. Record the version here and in memory.md.
