// Node < 20 doesn't have a global File constructor natively in all environments.
// Node 20.x also doesn't seem to have it available in the test runner.
// The Github Actions run failed because `File is not defined`
