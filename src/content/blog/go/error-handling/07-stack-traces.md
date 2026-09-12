---
title: "Stack Traces and Debugging"
description: "Getting useful stack traces from Go errors and practical debugging strategies."
pubDate: 2026-09-12
series: "error-handling"
order: 7
---

## The Missing Stack Trace

If you're coming from Python or Java, you're used to exceptions carrying a full stack trace automatically. In Go, errors don't do that. A standard error is just a string — it has no idea where it was created.

```go
err := errors.New("connection failed")
fmt.Println(err) // "connection failed" — but WHERE?
```

This is a deliberate design choice. Stack traces are expensive to generate, and most errors in Go are handled immediately at the call site, making a full trace unnecessary. But when you're debugging a tricky issue, you *do* want to know exactly where an error originated.

---

## Strategy 1: Error Wrapping (The Go Way)

The idiomatic approach is to add context at each layer using `fmt.Errorf` with `%w`. This builds a manual breadcrumb trail:

```go
func QueryDB(query string) error {
    return errors.New("connection refused")
}

func GetUser(id int) error {
    err := QueryDB("SELECT * FROM users WHERE id = ?")
    if err != nil {
        return fmt.Errorf("GetUser(%d): %w", id, err)
    }
    return nil
}

func HandleRequest(w http.ResponseWriter, r *http.Request) {
    err := GetUser(42)
    if err != nil {
        log.Printf("HandleRequest failed: %v", err)
        // Output: HandleRequest failed: GetUser(42): connection refused
    }
}
```

This gives you a clear chain showing the path the error took, even without a traditional stack trace.

---

## Strategy 2: `runtime.Stack` for Manual Stack Capture

If you need an actual stack trace (e.g., when recovering from a panic in production), Go's `runtime` package can capture one:

```go
import "runtime"

func captureStack() string {
    buf := make([]byte, 4096)
    n := runtime.Stack(buf, false) // false = current goroutine only
    return string(buf[:n])
}
```

This is what `recover()` in HTTP middleware often uses to log the full stack when a panic occurs:

```go
defer func() {
    if r := recover(); r != nil {
        stack := captureStack()
        log.Printf("PANIC: %v\nStack:\n%s", r, stack)
    }
}()
```

---

## Strategy 3: Structured Logging

For production systems, structured logging with a library like `slog` (Go 1.21+, standard library) gives you much more useful debug output than plain `fmt.Println`:

```go
import "log/slog"

func GetUser(id int) (*User, error) {
    user, err := db.Find(id)
    if err != nil {
        slog.Error("failed to fetch user",
            "user_id", id,
            "error", err,
        )
        return nil, fmt.Errorf("GetUser(%d): %w", id, err)
    }
    return user, nil
}
```

This outputs structured JSON or key-value pairs that are easily searchable in log aggregation tools.

---

## Strategy 4: The `runtime.Caller` Function

For lightweight "where did this happen" info without a full stack dump, use `runtime.Caller`:

```go
import "runtime"

func logLocation() {
    _, file, line, ok := runtime.Caller(1) // 1 = the caller of this function
    if ok {
        fmt.Printf("Called from %s:%d\n", file, line)
    }
}
```

---

## Practical Debugging Checklist

When tracking down an error in Go code:

1. **Read the error chain** — well-wrapped errors tell you the exact path.
2. **Add context** where it's missing — if you find a bare `return err` without wrapping, add `fmt.Errorf("functionName: %w", err)`.
3. **Use `slog` or structured logging** — `fmt.Println` doesn't scale.
4. **Use `dlv` (Delve)** — Go's debugger lets you set breakpoints and inspect variables at runtime. Install it with `go install github.com/go-delve/delve/cmd/dlv@latest`.
5. **Check panic stack traces** — if the program crashed, the stack trace printed to stderr tells you exactly where the panic started.
