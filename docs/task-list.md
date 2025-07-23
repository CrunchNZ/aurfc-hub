
# AURFC App Build Task List

This file tracks the build progress based on requirements.md and user rules. Tasks are completed sequentially, with all sub-tasks tested and marked before moving on.

## Self-Rules for Task Completion
- Follow user rules: Environment segregation, TDD (tests for every new code, remove one-off tests), modularity (<300 lines/file, split if needed), automated docs/logging.
- Step-by-Step: Break tasks into sub-tasks; complete/test one at a time.
- Testing: Test each sub-task (unit/integration/manual) before marking complete; fix issues (up to 3 attempts) or ask user.
- Marking: Mark sub-task as [Complete] after testing; main task as [Complete] when all sub-tasks done.
- Feedback: Ask user only if necessary (e.g., clarifications); otherwise, proceed.
- Progress: Update this file as we go; commit changes per rules.

## Tasks
- **Task 1: Project Setup and Environment Configuration** [Complete]
  - Sub-task 1.1: Update dependencies for MVP. [Complete]
  - Sub-task 1.2: Create Firebase projects and configure .firebaserc/.env files. [Complete]
  - Sub-task 1.3: Update vite.config.js for PWA. [Complete]
  - Sub-task 1.4: Set up env-specific configs. [Complete]
  - Sub-task 1.5: Test setup. [Complete]

- **Task 2: Authentication and User Management** [Complete]
  - Sub-task 2.1: Implement sign-up/login with roles/consent. [Complete]
  - Sub-task 2.2: Add password reset/email verification. [Complete]
  - Sub-task 2.3: Profile updates with RBAC. [Complete]
  - Sub-task 2.4: Update tests and rules. [Complete]
  - Sub-task 2.5: Test auth flow. [Complete]

- **Task 3: Centralized Communication** [Complete]
  - Sub-task 3.1: Implement in-app chat using Firestore real-time. [Complete]
  - Sub-task 3.2: Add notifications system. [Complete]
  - Sub-task 3.3: Create news feed for announcements. [Complete]
  - Sub-task 3.4: Test communication features. [Complete]

- **Task 4: Team Management** [Complete]
  - Sub-task 4.1: Implement roster building/editing for coaches. [Complete]
  - Sub-task 4.2: Add performance/injury tracking. [Complete]
  - Sub-task 4.3: Create drills/playbooks section. [Complete]
  - Sub-task 4.4: Update tests and rules for RBAC. [Complete]
  - Sub-task 4.5: Test team management features. [Complete]

- **Task 5: Scheduling** [Complete]
  - Sub-task 5.1: Implement shared calendar for events. [Complete]
  - Sub-task 5.2: Add RSVPs and attendance tracking. [Complete]
  - Sub-task 5.3: Update tests and rules. [Complete]
  - Sub-task 5.4: Test scheduling features. [Complete]

(Additional tasks as previously outlined...) 