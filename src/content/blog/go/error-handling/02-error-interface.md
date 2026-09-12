---
title: "The error Interface"
description: "Building custom error types by implementing Go's error interface."
pubDate: 2026-09-12
series: "error-handling"
order: 2
---

## Beyond Simple Strings

In the previous post, we used `fmt.Errorf` to create basic string errors. That works fine for simple cases, but what if you need your error to carry extra data — like an HTTP status code, a field name that failed validation, or a retry count?

Since `error` is just an interface with one method, you can create your own struct that implements it.

---

## Custom Error Types

```go
package main

import "fmt"

// A custom error type
type ValidationError struct {
    Field   string
    Message string
}

// Implementing the error interface
func (e *ValidationError) Error() string {
    return fmt.Sprintf("validation failed on '%s': %s", e.Field, e.Message)
}
```

Now you can return this from any function that returns `error`:

```go
func ValidateAge(age int) error {
    if age < 0 {
        return &ValidationError{
            Field:   "age",
            Message: "cannot be negative",
        }
    }
    if age > 150 {
        return &ValidationError{
            Field:   "age",
            Message: "unrealistic value",
        }
    }
    return nil
}
```

### Why Use a Pointer Receiver?

Notice `(e *ValidationError)` uses a pointer receiver. This is the convention for error types — it means a `*ValidationError` satisfies the `error` interface, not a plain `ValidationError`. This avoids accidental copying and keeps behavior consistent.

---

## Checking for Specific Error Types

When the caller receives the error, they can use a **type assertion** (covered in the interfaces post) to check if it's a `ValidationError` and extract the details:

```go
func main() {
    err := ValidateAge(-5)
    if err != nil {
        // Try to extract the specific error type
        var ve *ValidationError
        if errors.As(err, &ve) {
            fmt.Println("Bad field:", ve.Field)
            fmt.Println("Reason:", ve.Message)
        } else {
            fmt.Println("Unknown error:", err)
        }
    }
}
```

We're using `errors.As` here (more on that in the wrapping/unwrapping post). It safely checks if `err` is — or wraps — a `*ValidationError`, and if so, assigns it to `ve`.

---

## When to Use Custom Error Types

- **Simple, one-off errors:** Just use `fmt.Errorf("something went wrong")`.
- **Errors that carry structured data** (codes, field names, timestamps): Create a custom struct.
- **Errors that callers need to handle differently** (e.g., "is this a timeout or a permission error?"): Custom types let callers branch on the type rather than parsing strings.
