# Git Secret Scanning Fix Guide

GitHub has blocked your push due to detecting a secret (Groq API key) in your commit history. This guide provides multiple solutions.

## Understanding the Issue

GitHub's secret scanning feature detected a Groq API key in one of your commits. Even if the secret is in an old commit, GitHub blocks the entire push to protect you from accidentally exposing credentials.

## ⚠️ Security First

**Before proceeding with any fix**:

1. **Rotate the exposed secret immediately**:
   - Go to Groq Console: https://console.groq.com
   - Navigate to API Keys
   - Delete the exposed key
   - Generate a new key
   - Update your Render environment variables with the new key

2. **Never commit the new key**:
   - Verify `.env` is in your `.gitignore`
   - Only commit `.env.example` with placeholder values
   - Store actual secrets in Render environment variables

## Solution Options

Choose the option that best fits your situation:

---

## Option 1: Allow Secret via GitHub UI (Quickest)

**Use this if**:
- You've already rotated the secret
- You want to proceed quickly
- You understand the security implications

**Steps**:

1. When you try to push, GitHub will show an error message with a URL like:
   ```
   https://github.com/<org>/<repo>/security/secret-scanning/unblock-secret/...
   ```

2. Click the URL or copy-paste it into your browser

3. You'll see a page showing the detected secret

4. Click **"Allow this secret"** or **"Skip this secret"**

5. Try pushing again:
   ```bash
   git push origin main
   ```

**Pros**: Fast, simple, no force-push required
**Cons**: The old secret remains in Git history (acceptable if already rotated)

---

## Option 2: Remove Secret from History (Proper Fix)

**Use this if**:
- You want to completely remove the secret from history
- You can coordinate with team members for a force-push
- You want the cleanest solution

### Using BFG Repo-Cleaner (Recommended)

**Step 1**: Install BFG Repo-Cleaner

**Windows**:
```bash
# Download from https://rtyley.github.io/bfg-repo-cleaner/
# Or use chocolatey:
choco install bfg-repo-cleaner
```

**macOS**:
```bash
brew install bfg
```

**Linux**:
```bash
# Download the JAR file
wget https://repo1.maven.org/maven2/com/madgag/bfg/1.14.0/bfg-1.14.0.jar
alias bfg='java -jar /path/to/bfg-1.14.0.jar'
```

**Step 2**: Backup your repository
```bash
cd c:\Users\Rohit\Desktop\kaflin
git clone --mirror https://github.com/<your-org>/CreatorAI.git CreatorAI-backup.git
```

**Step 3**: Create a file with secrets to remove

Create `secrets.txt` with the exposed Groq API key:
```
gsk_********************************************************
```

**Step 4**: Run BFG to remove the secret
```bash
cd c:\Users\Rohit\Desktop\kaflin\CreatorAI
bfg --replace-text ../secrets.txt
```

**Step 5**: Clean up Git history
```bash
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

**Step 6**: Force-push the cleaned history
```bash
git push --force origin main
```

**Step 7**: Notify team members
- All collaborators must delete their local copies and re-clone
- Share the new clone URL with everyone

### Using git filter-repo (Alternative)

**Step 1**: Install git filter-repo
```bash
pip install git-filter-repo
```

**Step 2**: Remove the file containing the secret
```bash
# If the secret was in a specific file (e.g., old .env file)
git filter-repo --invert-paths --path .env

# If the secret is in multiple commits of the same file
git filter-repo --path-rename .env:.env.removed
```

**Step 3**: Force-push
```bash
git push --force origin main
```

---

## Option 3: Temporary Workaround - Manual Render Deploy

**Use this if**:
- You can't immediately fix the Git issue
- You need to deploy urgently
- You'll fix Git history later

**Steps**:

1. **Don't push to GitHub** (it will be blocked anyway)

2. **Deploy via Render Manual Deploy**:
   - Go to Render Dashboard
   - Select your service
   - Click **Manual Deploy** → **Deploy latest commit**
   - Render will deploy from the last successfully pushed commit

3. **Apply fixes directly in Render**:
   - Update environment variables in Render dashboard
   - Modify build command if needed
   - Redeploy

4. **Fix Git history later** using Option 1 or 2 above

**Pros**: Unblocks deployment immediately
**Cons**: Your local fixes won't be in production until Git is fixed

---

## Option 4: Create a New Commit Without the Secret

**Use this if**:
- The secret is only in your most recent (unpushed) commit
- You haven't pushed the problematic commit yet

**Steps**:

1. **Soft reset to previous commit**:
   ```bash
   git reset --soft HEAD~1
   ```

2. **Verify the secret is not in code**:
   ```bash
   # Search for the Groq key pattern
   grep -r "gsk_" . --exclude-dir=node_modules --exclude-dir=.git
   ```

3. **Remove from any files** if found:
   ```bash
   # Edit the file and remove the secret
   # Make sure it's in .env (which should be gitignored)
   ```

4. **Re-commit without the secret**:
   ```bash
   git add .
   git commit -m "fix: remove hardcoded secrets, use environment variables"
   ```

5. **Push**:
   ```bash
   git push origin main
   ```

---

## Verification

After applying any fix, verify:

### 1. Check No Secrets in Code
```bash
# From repo root
grep -r "gsk_" c:\Users\Rohit\Desktop\kaflin\CreatorAI --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist --exclude="*.md"
```

Should return no results (or only in this guide file)

### 2. Verify .gitignore
```bash
cat .gitignore | grep "\.env$"
```

Should show `.env` is ignored (only `.env.example` should be committed)

### 3. Test Push
```bash
git push origin main
```

Should succeed without secret scanning errors

### 4. Verify Render Environment Variables
- Log into Render Dashboard
- Check that all secrets are stored as environment variables
- Confirm `OPENROUTER_API_KEY` or other LLM keys are set correctly

---

## Prevention for Future

### 1. Use .gitignore Properly
Ensure `.env` is in `.gitignore`:
```gitignore
# Environment variables
.env
.env.local
.env.production
.env.*.local

# Keep examples
!.env.example
```

### 2. Pre-commit Hooks
Install `git-secrets` to prevent committing secrets:

```bash
# Install git-secrets
# Windows (with Git Bash):
git clone https://github.com/awslabs/git-secrets.git
cd git-secrets
make install

# Configure for your repo
cd c:\Users\Rohit\Desktop\kaflin\CreatorAI
git secrets --install
git secrets --register-aws
git secrets --add 'gsk_[a-zA-Z0-9]{40,}'  # Groq pattern
git secrets --add 'sk-[a-zA-Z0-9]{40,}'   # OpenAI pattern
```

### 3. Use Environment Variables
Always load secrets from environment:

```typescript
// ✅ Good - from environment
const apiKey = process.env.OPENROUTER_API_KEY;

// ❌ Bad - hardcoded
const apiKey = 'gsk_xxxxxxxxxxxxx';
```

### 4. Review Before Committing
```bash
# Check what you're about to commit
git diff --cached

# Search for common secret patterns
git diff --cached | grep -E "(api[_-]?key|secret|password|token)"
```

---

## FAQ

**Q: Will removing the secret from history affect my commit history?**  
A: Yes, commit SHAs will change after history rewriting. All collaborators must re-clone.

**Q: Can I just delete the commit?**  
A: If it's your latest unpushed commit, yes (see Option 4). If it's already pushed or older, you need to rewrite history (Option 2).

**Q: What if I can't force-push (protected branch)?**  
A: Temporarily remove branch protection in GitHub Settings → Branches, force-push, then re-enable protection.

**Q: How do I know if the secret is still exposed?**  
A: After fixing, try pushing. If GitHub still blocks it, the secret is still in history somewhere.

**Q: Should I rotate the secret even if I remove it from history?**  
A: **YES**. Once a secret has been exposed (even briefly), always rotate it. Git history is public if your repo is public, and someone may have already scraped it.

---

## Need Help?

If you're unsure which option to choose or need assistance:

1. **For urgent deploys**: Use Option 3 (Manual Render Deploy)
2. **For proper fix**: Use Option 2 (BFG Repo-Cleaner)
3. **For quick fix**: Use Option 1 (Allow via GitHub)

**Security Priority Order**:
1. Rotate the exposed secret immediately
2. Choose a fix option based on your timeline
3. Implement prevention measures
4. Deploy with the new secret in environment variables
