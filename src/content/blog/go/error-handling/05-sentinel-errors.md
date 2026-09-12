---
title: "Sentinel Errors"
description: "Defining and using package-level error values as well-known signals in Go."
pubDate: 2026-09-12
series: "error-handling"
order: 5
---

## What is a Sentinel Error?

A **sentinel error** is a pre-defined, package-level error variable that acts as a well-known signal. The name comes from the concept of a "sentinel value" — a specific value that means something special.

You've already used one without knowing it: `io.EOF`.

```go
// Defined inside the standard library's io package
var EOF = errors.New("EOF")
```

When you're reading from a file or a network connection and the data runs out, Go doesn't panic or throw an exception. It returns `io.EOF` — a quiet signal that says "we've reached the end, and that's normal."

---

## Recognizing Sentinel Errors

Sentinel errors in the standard library follow a naming convention:

```go
var ErrNotFound    = errors.New("not found")
var ErrTimeout     = errors.New("operation timed out")
var ErrUnauthorized = errors.New("unauthorized")
```

The `Err` prefix is a strong Go convention. When you see a package export a variable starting with `Err`, it's almost certainly a sentinel error.

Common ones you'll encounter:
- `io.EOF` — end of input
- `sql.ErrNoRows` — a query returned zero results
- `os.ErrNotExist` — file or directory doesn't exist
- `os.ErrPermission` — permission denied

---

## Using Sentinel Errors in Your Own Code

Define them at the package level so callers can compare against them:

```go
package user

import "errors"

var (
    ErrNotFound   = errors.New("user not found")
    ErrDuplicate  = errors.New("user already exists")
    ErrBanned     = errors.New("user is banned")
)

func GetByID(id int) (*User, error) {
    // ...database lookup
    if notInDB {
        return nil, ErrNotFound
    }
    return u, nil
}
```

The caller can then branch on the specific error:

```go
u, err := user.GetByID(42)
if errors.Is(err, user.ErrNotFound) {
    // Return a 404 to the client
    http.Error(w, "User not found", 404)
    return
}
if err != nil {
    // Some other unexpected error
    http.Error(w, "Internal error", 500)
    return
}
```

---

## Important: Always Use `errors.Is`, Not `==`

```go
// BAD — breaks if the error was wrapped
if err == user.ErrNotFound { ... }

// GOOD — works even through layers of wrapping
if errors.Is(err, user.ErrNotFound) { ... }
```

Since errors are often wrapped with `fmt.Errorf("context: %w", err)` as they travel up the call stack, a direct `==` comparison will fail. `errors.Is` unwraps the chain and checks every error in it.

---

## When to Use Sentinels vs. Custom Types

| Scenario | Use |
|---|---|
| A simple signal ("not found", "already exists") | Sentinel error |
| The error carries data (field name, status code) | Custom error type |
| The caller needs to know *what* went wrong, not *why* | Sentinel error |
| The caller needs to extract details from the error | Custom error type |
