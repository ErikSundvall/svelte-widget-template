

# Vega lite
Note that:
* We are using Vega Lite (https://github.com/vega/vega-lite) and a suitable configuration. 
* Vega Lite is queryable via MCP at https://deepwiki.com/vega/vega-lite . 
* The schema for Vega Lite definitions is available at https://vega.github.io/schema/vega-lite/v6.json

## Agent Safety: Git operations
Agents must not execute `git push` automatically. Local modifications are allowed up to `git commit`. A `git push` requires explicit user instruction (e.g., "Push changes to origin/main"). When in doubt, ask for confirmation before pushing to ensure human control over deployments.

## Development tooling guidance
- When working with Javascript or Typescript based projects prefer using Deno
  for management over using Node.js and NPM. Deno is installed in the local
  environment, but Jules might need to install Deno in its VM before using it.
- The local environment is a Windows machine without admin privileges,
  Powershell is available. It uses [Scoop](https://scoop.sh/) for package
  installation, so base any advice on that.

## Style in narrative text
Keep narrative text in PRDs, documentation etc short and concise.
No fluffy or cheerful filler text.
Technical prose only, be kind but direct (e.g., "Thanks @user" not "Thanks so much @user!")