/* Corrections form config for the Will Winn site (GitHub Pages).
 *
 * Submissions become GitHub Issues (label: correction) and are also
 * archived as JSON under corrections/inbox/ by a GitHub Action.
 *
 * Optional: paste a fine-grained PAT with Issues: Write on papiwinn/willwinn
 * so reviewers never leave this page. Leave empty to use the GitHub
 * "new issue" hand-off (works with no secret in the page).
 */
window.CORRECTIONS_CONFIG = {
  repo: "papiwinn/willwinn",
  label: "correction",
  /* Optional — create at https://github.com/settings/tokens?type=beta
     Permissions: Issues (Read and write) on papiwinn/willwinn only. */
  githubToken: ""
};
