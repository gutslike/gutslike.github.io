---
title: "Wrapping and Unwrapping Errors"
description: "Using errors.Is and errors.As to inspect wrapped errors in Go 1.13+."
pubDate: 2026-09-12
series: "error-handling"
order: 4
---

## The Problem

Imagine a function chain: `HandleRequest` calls `GetUser`, which calls `QueryDB`, which returns an error. Without wrapping, you either:

1. Return the raw database error — the caller has no idea *where* in the chain it happened.
2. Create a brand-new error string — you lose the original error entirely.

Error wrapping gives you both: **context about where it happened** and **access to the original root cause**.

---

## Wrapping with `%w`

We touched on this in the last post. The `%w` verb in `fmt.Errorf` wraps an error:

```go
func GetUser(id int) (*User, error) {
    row, err := QueryDB(id)
    if err != nil {
        return nil, fmt.Errorf("GetUser(%d): %w", id, err)
    }
    return parseUser(row), nil
}
```

The resulting chain looks like:
```
GetUser(42): QueryDB: connection refused
```

Each layer adds context, and the original error (`connection refused`) is still preserved inside.

---

## `errors.Is` — Checking for a Specific Error Value

`errors.Is` walks down the chain of wrapped errors and checks if any of them match a specific error value.

```go
import (
    "errors"
    "io"
)

func ProcessFile(path string) error {
    _, err := ReadFile(path)
    if err != nil {
        // Is the ROOT cause an EOF, even if it's wrapped in layers of context?
        if errors.Is(err, io.EOF) {
            fmt.Println("Reached end of file — that's expected")
            return nil
        }
        return err
    }
    return nil
}
```

Without `errors.Is`, you'd have to do `err == io.EOF`, which **fails** the moment the error is wrapped in even one layer of `fmt.Errorf("...: %w", err)`.

---

## `errors.As` — Extracting a Specific Error Type

While `errors.Is` checks for a specific *value*, `errors.As` checks for a specific *type* and extracts it.

```go
func HandleRequest() {
    err := ValidateInput(data)
    if err != nil {
        var ve *ValidationError
        if errors.As(err, &ve) {
            // ve is now the actual *ValidationError from inside the chain
            fmt.Printf("Field '%s' failed: %s\n", ve.Field, ve.Message)
            return
        }
        // Some other error
        fmt.Println("Unexpected error:", err)
    }
}
```

This is powerful because the `ValidationError` could be buried several layers deep (wrapped multiple times), and `errors.As` will still find it.

---

## `errors.Is` vs `errors.As` — Quick Reference

| Question | Tool | Example |
|---|---|---|
| "Is this error *exactly* `io.EOF`?" | `errors.Is(err, io.EOF)` | Checking for known sentinel errors |
| "Is this error *a* `*ValidationError`?" | `errors.As(err, &ve)` | Extracting structured data from errors |

---

## Implementing `Unwrap` on Custom Types

If you create your own error type that wraps another error, you need to implement an `Unwrap() error` method so `errors.Is` and `errors.As` can walk through it:

```go
type AppError struct {
    Code    int
    Message string
    Err     error // the wrapped error
}

func (e *AppError) Error() string {
    return fmt.Sprintf("[%d] %s: %v", e.Code, e.Message, e.Err)
}

// This method lets errors.Is and errors.As look inside
func (e *AppError) Unwrap() error {
    return e.Err
}
```

Now if someone wraps a `*ValidationError` inside an `*AppError`, `errors.As` will still find the `ValidationError` because it can unwrap through the chain.
