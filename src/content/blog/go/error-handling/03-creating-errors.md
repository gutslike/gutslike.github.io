---
title: "Creating Errors"
description: "Using errors.New and fmt.Errorf to create errors with and without context."
pubDate: 2026-09-12
series: "error-handling"
order: 3
---

## Two Ways to Create Errors

Go gives you two standard library tools for creating simple errors without defining a whole custom struct.

---

## `errors.New`

The simplest way to create an error. It takes a string and returns an `error`.

```go
import "errors"

func Connect(addr string) error {
    if addr == "" {
        return errors.New("address cannot be empty")
    }
    // ...connection logic
    return nil
}
```

Use `errors.New` when:
- The error message is a **fixed string** with no dynamic data.
- You don't need to include variable values like filenames, IDs, or counts.

---

## `fmt.Errorf`

When you need to include dynamic context in your error message, use `fmt.Errorf`. It works exactly like `fmt.Sprintf`, but returns an `error` instead of a string.

```go
import "fmt"

func LoadConfig(path string) error {
    // ...try to load
    return fmt.Errorf("failed to load config from %s", path)
}
```

This is far more useful in practice than `errors.New`, because most real errors need context — *which* file failed, *what* ID was missing, *how many* retries were attempted.

---

## Adding Context to Existing Errors

One of the most important patterns in Go is wrapping an error with additional context as it bubbles up through the call stack. You do this with the `%w` verb:

```go
func ReadSettings() error {
    err := LoadConfig("/etc/app/config.json")
    if err != nil {
        // Wrap the original error with more context
        return fmt.Errorf("reading settings: %w", err)
    }
    return nil
}
```

The resulting error message will look like:
```
reading settings: failed to load config from /etc/app/config.json
```

The key difference between `%v` and `%w`:
- **`%v`** formats the error into a string. The original error is lost — you can't unwrap it later.
- **`%w`** wraps the error. The original error is preserved inside, so callers can inspect it with `errors.Is` or `errors.As` (covered in the next post).

### Quick Reference

| Need | Use |
|---|---|
| Static error message | `errors.New("something broke")` |
| Error with dynamic values | `fmt.Errorf("user %d not found", id)` |
| Wrap an existing error | `fmt.Errorf("loading user: %w", err)` |
