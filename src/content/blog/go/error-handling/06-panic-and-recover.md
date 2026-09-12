---
title: "Panic and Recover"
description: "Understanding Go's panic mechanism and how to recover from unrecoverable errors."
pubDate: 2026-09-12
series: "error-handling"
order: 6
---

## What is a Panic?

A **panic** is Go's version of a crash. When a panic happens, the current function stops immediately, all deferred functions run, and the program terminates with a stack trace.

Panics are *not* the normal way to handle errors in Go. They exist for truly unexpected situations — things that should never happen if the code is correct.

```go
func main() {
    fmt.Println("Starting...")
    panic("something went terribly wrong")
    fmt.Println("This line never runs")
}
```

Output:
```
Starting...
panic: something went terribly wrong

goroutine 1 [running]:
main.main()
    /tmp/main.go:6 +0x...
exit status 2
```

---

## When Does Go Panic?

Go panics automatically in a few situations:

```go
// 1. Index out of bounds
s := []int{1, 2, 3}
fmt.Println(s[10]) // panic: runtime error: index out of range

// 2. Nil pointer dereference
var p *int
fmt.Println(*p) // panic: runtime error: invalid memory address

// 3. Closing a closed channel
ch := make(chan int)
close(ch)
close(ch) // panic: close of closed channel
```

These are **programming bugs**, not expected failure conditions. That's why they panic instead of returning an error.

---

## When Should *You* Panic?

Almost never. The rule of thumb:

- **Return an error** if the failure is something the caller could reasonably handle (file not found, invalid input, network timeout).
- **Panic** only if the failure means the program's state is fundamentally broken and continuing would cause worse problems.

Real-world examples where panicking is acceptable:
- During program initialization, if a required config file is missing.
- If a programmer passes a `nil` pointer to a function that documents it must not be nil.
- Inside `init()` functions when a critical dependency fails to load.

---

## `recover` — Catching a Panic

Go provides `recover()` to stop a panic from crashing the entire program. It only works inside a **deferred function**.

```go
func safeOperation() {
    defer func() {
        if r := recover(); r != nil {
            fmt.Println("Recovered from panic:", r)
        }
    }()

    // This will panic
    panic("unexpected failure")
}

func main() {
    safeOperation()
    fmt.Println("Program continues normally")
}
```

Output:
```
Recovered from panic: unexpected failure
Program continues normally
```

### How `defer` + `recover` Work Together

1. `panic("...")` is called — the function starts unwinding.
2. Before the function exits, Go runs all deferred functions.
3. Inside the deferred function, `recover()` catches the panic value and stops the unwinding.
4. Execution continues *after* the call to `safeOperation()`, not after the panic.

---

## A Practical Use Case: HTTP Handlers

One of the most common places you'll see `recover` in production code is in HTTP server middleware. If a single request handler panics, you don't want it to crash the entire server:

```go
func recoveryMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        defer func() {
            if err := recover(); err != nil {
                log.Printf("panic recovered: %v", err)
                http.Error(w, "Internal Server Error", 500)
            }
        }()
        next.ServeHTTP(w, r)
    })
}
```

---

## Key Takeaway

**Don't use `panic` and `recover` as a substitute for proper error handling.** They are an escape hatch for genuinely unrecoverable situations, not a `try/catch` replacement.
