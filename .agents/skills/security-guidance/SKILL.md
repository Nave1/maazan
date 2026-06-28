# Security Guidance — Real-Time Security Linter

Real-time security linter that detects injection vulnerabilities, authentication flaws, and OWASP Top 10 issues during code editing. Catches 12 common security risks BEFORE code is committed.

---

## Detected Patterns

### 1. SQL Injection
```python
# FLAGGED: String concatenation in SQL
query = f"SELECT * FROM users WHERE id = {user_id}"
query = "SELECT * FROM users WHERE id = " + user_id

# SAFE: Parameterized queries
cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
session.query(User).filter(User.id == user_id)
```

### 2. Cross-Site Scripting (XSS)
```javascript
// FLAGGED: Direct innerHTML assignment
element.innerHTML = userInput;
document.write(userInput);

// SAFE: Use textContent or sanitization
element.textContent = userInput;
const safe = DOMPurify.sanitize(userInput);
```

### 3. Command Injection
```python
# FLAGGED: Shell execution with user input
os.system(f"ls {user_path}")
subprocess.call(cmd, shell=True)

# SAFE: Use subprocess with list args, no shell
subprocess.run(["ls", validated_path], shell=False)
```

### 4. Insecure Deserialization
```python
# FLAGGED: Unsafe deserialization
pickle.loads(user_data)
yaml.load(data)  # without Loader parameter

# SAFE: Use safe loaders
yaml.safe_load(data)
json.loads(data)  # JSON is inherently safer
```

### 5. Hardcoded Secrets
```python
# FLAGGED: Secrets in source code
API_KEY = "sk-1234567890abcdef"
password = "admin123"
SECRET_KEY = "mysecretkey"

# SAFE: Environment variables
API_KEY = os.environ.get("API_KEY")
SECRET_KEY = os.environ["SECRET_KEY"]
```

### 6. Weak Cryptography
```python
# FLAGGED: Weak algorithms
hashlib.md5(password.encode())
hashlib.sha1(data.encode())

# SAFE: Strong hashing
bcrypt.hashpw(password.encode(), bcrypt.gensalt())
hashlib.sha256(data.encode())
```

### 7. Path Traversal
```python
# FLAGGED: Unvalidated file paths
open(os.path.join(base_dir, user_filename))

# SAFE: Validate and resolve paths
safe_path = os.path.realpath(os.path.join(base_dir, user_filename))
if not safe_path.startswith(os.path.realpath(base_dir)):
    raise ValueError("Path traversal detected")
```

### 8. CORS Misconfiguration
```python
# FLAGGED: Wildcard CORS with credentials
allow_origins=["*"]

# SAFE: Explicit origin whitelist
allow_origins=["https://yourdomain.com"]
```

### 9. Missing Authentication
```python
# FLAGGED: Unprotected sensitive endpoint
@app.get("/api/admin/users")
async def list_users():
    return users

# SAFE: Authentication required
@app.get("/api/admin/users")
async def list_users(current_user = Depends(get_current_admin_user)):
    return users
```

### 10. Unsafe Redirect
```python
# FLAGGED: Open redirect
redirect_url = request.query_params.get("next")
return RedirectResponse(redirect_url)

# SAFE: Validate redirect target
ALLOWED_HOSTS = {"yourdomain.com"}
parsed = urlparse(redirect_url)
if parsed.hostname not in ALLOWED_HOSTS:
    raise HTTPException(400, "Invalid redirect")
```

### 11. Eval / Code Injection
```python
# FLAGGED: Dynamic code execution
eval(user_input)
exec(user_code)

# SAFE: Never eval user input — use safe alternatives
```

### 12. Insecure JWT Configuration
```python
# FLAGGED: No algorithm verification
jwt.decode(token, key)

# SAFE: Explicit algorithm
jwt.decode(token, key, algorithms=["HS256"])
```

---

## When to Apply

This skill should be consulted on EVERY file edit that touches:
- Authentication / authorization code
- Database queries or ORM usage
- File system operations
- HTTP request/response handling
- User input processing
- Cryptographic operations
- Configuration files with secrets
- API endpoint definitions
