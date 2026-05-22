Every Emart session should start with a low-token recent-work check before editing:

1. `git log --oneline -20`
2. `git show --stat <hash>` for any relevant recent commit
3. Targeted `rg`/`grep` for the feature or keyword before changing code

If another agent, especially Claude in VS Code, has touched a relevant file recently, read that file and reason through the current implementation before editing, deploying, or committing.
