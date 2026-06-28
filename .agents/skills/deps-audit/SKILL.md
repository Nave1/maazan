# Dependency Audit

Audit project dependencies for security vulnerabilities, outdated packages, and license compliance.

---

## Usage
```
/deps-audit
```

## Behavior

1. Scan `package.json` / `package-lock.json` for npm vulnerabilities
2. Scan `requirements.txt` / `pyproject.toml` for Python vulnerabilities
3. Check for outdated packages with available security patches
4. Verify license compliance (flag copyleft in commercial projects)
5. Identify abandoned/unmaintained packages

---

## Audit Commands

### npm (Node.js / Frontend)
```bash
npm audit                           # List vulnerabilities
npm audit --json                    # JSON output for CI
npm audit fix                       # Auto-fix compatible updates
npm audit fix --force               # Force major version updates (review carefully)
npm outdated                        # Show outdated packages
```

### pip (Python / Backend)
```bash
pip audit                           # Scan for known CVEs
pip audit --json                    # JSON output
pip list --outdated                 # Show outdated packages
safety check -r requirements.txt   # Alternative scanner
```

---

## Severity Classification

| Severity | Action | Timeline |
|----------|--------|----------|
| **Critical** (CVSS 9.0-10.0) | Block deployment, fix immediately | < 24 hours |
| **High** (CVSS 7.0-8.9) | Fix before next release | < 7 days |
| **Medium** (CVSS 4.0-6.9) | Schedule fix | < 30 days |
| **Low** (CVSS 0.1-3.9) | Track in backlog | < 90 days |

---

## CVE Triage Workflow

1. **Is the vulnerable code reachable?** — If the CVE is in a function your code never calls, it's lower priority
2. **Is it exploitable in your context?** — Server-side CVE in a client-only package = lower risk
3. **Is there a fix available?** — If yes, upgrade. If not, evaluate compensating controls
4. **Can you upgrade without breaking changes?** — Check changelog for API changes
5. **Test after upgrade** — Run full test suite to catch regressions

---

## License Compliance

### Safe for Commercial Use
- MIT, BSD-2-Clause, BSD-3-Clause, Apache-2.0, ISC, Unlicense

### Requires Review
- LGPL-2.1, LGPL-3.0, MPL-2.0, EPL-2.0

### Restricted (Copyleft)
- GPL-2.0, GPL-3.0, AGPL-3.0 — May require open-sourcing your code

---

## Supply Chain Security

### Protecting Against Malicious Packages

1. **Verify publisher** — Check package author, download count, repository
2. **Pin versions** — Use exact versions in lock files, not ranges
3. **Review new dependencies** — Before adding, check for typosquatting (e.g., `lodas` vs `lodash`)
4. **Monitor advisories** — Subscribe to GitHub security advisories for your dependencies
5. **Use lockfile** — Always commit `package-lock.json` and use `npm ci` in CI

### Signs of a Malicious Package
- Very new with high download count (fake)
- Name similar to popular package (typosquatting)
- Excessive permissions requested
- Obfuscated code in install scripts
- `postinstall` scripts that download external code

---

## CI/CD Integration

```yaml
# GitHub Actions example
name: Dependency Audit
on: [pull_request]
jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: npm audit
        run: npm audit --audit-level=high
      - name: pip audit
        run: pip audit -r backend/requirements.txt
```

---

## Output

- Vulnerability count by severity
- Affected package names and versions
- Fixed versions available
- License summary with flags
- Actionable remediation steps
