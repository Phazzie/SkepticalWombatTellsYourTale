## 2025-02-21 - Memory Find vs Database Query

**Learning:** `projectsService.getProject` retrieved a project by loading the entire list of user projects into memory and running `.find()`. In an environment where a user may have many projects with massive associated data (sessions, transcripts, etc.), this leads to severe memory pressure and slow queries.
**Action:** Replace `O(N)` memory `.find()` calls on related collections with direct `O(1)` database lookups via `prisma.*.findFirst()` or `prisma.*.findUnique()`.

## 2025-02-21 - Missing Database Indexes for Related Entities

**Learning:** The database model includes cascading relationships from `Project` to heavily queried and potentially large entities (`VoiceSession`, `Document`, `Tangent`, `Concept`, etc.), but `projectId` had no indexes. Any dashboard or summary view loading data specific to one project would trigger a sequential scan.
**Action:** Add `@@index([projectId])` explicitly to models where `projectId` acts as a foreign key that is frequently filtered or ordered on.

## 2025-02-21 - Expensive Renders Due to Live Transcript Updates

**Learning:** The `RecordPage` component updates state continuously (every second for `duration` and every few milliseconds for `liveTranscript`). It also renders `AnalysisPanels` which is a dense, large DOM structure containing the results of previous recordings. Without memoization, the entire page and DOM tree re-renders synchronously, blocking the main thread and slowing down speech recognition handling.
**Action:** When a parent component receives high-frequency updates, identify and wrap heavy, static, or slow-to-render child components using `React.memo()` to break the re-render chain.

## 2025-02-21 - Over-fetching in Search Aggregations

**Learning:** The `searchProject` repository queried multiple tables via `Promise.all` across large text columns (`content`, `transcript`, etc.). By default, Prisma's `findMany` fetches the entire row. When mapping these to search snippets, only the first 180 characters were used, meaning megabytes of unused string data were transferred from DB to Node and immediately discarded.
**Action:** Always use Prisma's `select: { ... }` in search implementations or list queries to explicitly return only the fields required for the UI, particularly avoiding large `String` payload transfers.

## 2025-02-21 - Over-fetching Unused Relations in Lists

**Learning:** `sessionsRepository.listByProject` included `tangents: true` for the list of sessions. The Sessions page UI doesn't render tangents; it only shows transcripts and AI annotations. This caused unnecessary `JOIN` statements and larger JSON payloads to the frontend.
**Action:** Before writing or keeping an `include: {}` block in Prisma, verify the dependent UI or API actually consumes the data. Remove unused includes to reduce database query planning time and network serialization overhead.
