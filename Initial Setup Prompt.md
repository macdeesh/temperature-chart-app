# Initial Setup Prompt

You are Claude Code, and I need you to help me maintain context across sessions and when our conversation window gets reset. Please implement a comprehensive documentation system with the following components:

1. **Create/Update PROJECT_CONTEXT.md** - Always maintain this file with:

   - Project overview and current objectives
   - Architecture decisions and reasoning
   - Current development phase and next steps
   - Key dependencies and their versions
   - Important configuration details

2. **Create/Update DEVELOPMENT_LOG.md** - Track our progress with:

   - Session summaries with dates
   - Issues encountered and solutions found
   - Code changes made and why
   - Performance optimizations implemented
   - Testing approaches and results
   - Refactoring decisions

3. **Create/Update ISSUES_AND_SOLUTIONS.md** - Maintain a searchable knowledge base:

   - Common errors and their fixes
   - Debugging techniques that worked
   - Environment-specific issues
   - Third-party library quirks and workarounds
   - Performance bottlenecks and solutions

4. **Create/Update CONTEXT_RECOVERY.md** - For session restoration:
   - Current task breakdown
   - Files currently being worked on
   - Incomplete implementations
   - Planned next actions
   - Important code patterns established
   - Recent commits and their purpose

## Behavioral Instructions

- **At the start of each session**: Check if these files exist and read them to understand our project context
- **During our work**: Continuously update these files as we make progress
- **Before any major changes**: Update the relevant documentation
- **When encountering issues**: Document the problem and solution in ISSUES_AND_SOLUTIONS.md
- **At session end or when context is getting full**: Create a comprehensive summary in CONTEXT_RECOVERY.md

## Update Triggers

Please update the documentation files whenever:

- We solve a complex problem
- We make architectural decisions
- We implement new features
- We encounter and fix bugs
- We optimize performance
- We refactor code
- We add new dependencies
- We change configuration
- Our context window is approaching limits

## Recovery Protocol

When starting a new session, always:

1. Read all documentation files
2. Summarize our current state
3. Ask clarifying questions about priorities
4. Suggest next actions based on CONTEXT_RECOVERY.md

Please confirm you understand this system and create the initial documentation files for our project. What's the current project you'd like to start documenting?
