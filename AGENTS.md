<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- You have access to the Nx MCP server and its tools, use them to help the user
- When answering questions about the repository, use the `nx_workspace` tool first to gain an understanding of the workspace architecture where applicable.
- When working in individual projects, use the `nx_project_details` mcp tool to analyze and understand the specific project structure and dependencies
- For questions around nx configuration, best practices or if you're unsure, use the `nx_docs` tool to get relevant, up-to-date docs. Always use this instead of assuming things about nx configuration
- If the user needs help with an Nx configuration or project graph error, use the `nx_workspace` tool to get any errors

## CI Error Guidelines

If the user wants help with fixing an error in their CI pipeline, use the following flow:

- Retrieve the list of current CI Pipeline Executions (CIPEs) using the `nx_cloud_cipe_details` tool
- If there are any errors, use the `nx_cloud_fix_cipe_failure` tool to retrieve the logs for a specific task
- Use the task logs to see what's wrong and help the user fix their problem. Use the appropriate tools if necessary
- Make sure that the problem is fixed by running the task that you passed into the `nx_cloud_fix_cipe_failure` tool

<!-- nx configuration end-->

```bash
╔══════════════════════════════════ 🎯  192.168.0.13  sinless777 |@SinLess-Desktop-Linux   🕒 15:47:49 ═════════════════════════════════════╗
║  Git  🌿 main  •  📝 6 ✨ 2 •  + 72 - 42 
║  Conditionals        📦 v1.0.0  
║  Languages via  v24.9.0     
║  Dir Helix 
╚══>  ➜  vercel link
Vercel CLI 48.6.7
❗️  Your Project was either deleted, transferred to a new Team, or you don’t have access to it anymore.
? Set up “~/Projects/Helix”? yes
? Which scope should contain your project? sinlessgames' projects
? Link to existing project? yes
? What’s the name of your existing project? helix-ai
✅  Linked to sinlessgames-projects/helix-ai (created .vercel)
```
