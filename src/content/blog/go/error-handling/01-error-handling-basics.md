---
title: "Error Handling Basics"
description: "Go's philosophy of treating errors as values, and the idiomatic if err != nil pattern."
pubDate: 2026-09-12
series: "error-handling"
order: 1
---

## Errors Are Values

Most languages use exceptions — something breaks, an exception gets thrown, and some `try/catch` block somewhere up the call stack hopefully catches it. Go takes a completely different approach: **errors are just values**, returned like any other result.

There's no `try`, no `catch`, no `throw`. A function that can fail returns an error alongside its result, and the caller decides what to do with it.

```go
package main

import (
    "fmt"
    "os"
)

func main() {
    file, err := os.Open("config.json")
    if err != nil {
        fmt.Println("Could not open file:", err)
        return
    }
    defer file.Close()
    fmt.Println("File opened successfully")
}
```

### The `if err != nil` Pattern

This is the single most common pattern in Go code. You'll see it everywhere, and that's intentional.

```go
result, err := SomeFunction()
if err != nil {
    // handle the error
    return err
}
// continue with result
```

It can feel repetitive at first, but there's a real advantage: **every possible failure point is visible**. You never have to guess which line might throw an invisible exception. The error path is always explicitly written out.

---

## The `error` Type

In Go, `error` is a built-in interface with a single method:

```go
type error interface {
    Error() string
}
```

Any type that has an `Error() string` method satisfies this interface and can be used as an error. When you print an error with `fmt.Println(err)`, Go calls this `Error()` method behind the scenes.

---

## Returning Errors from Your Own Functions

When writing your own functions, the convention is to return the error as the **last** return value.

```go
func Divide(a, b float64) (float64, error) {
    if b == 0 {
        return 0, fmt.Errorf("cannot divide by zero")
    }
    return a / b, nil
}

func main() {
    result, err := Divide(10, 0)
    if err != nil {
        fmt.Println("Error:", err)
        return
    }
    fmt.Println("Result:", result)
}
```

`nil` means "no error". When everything goes well, you return `nil` for the error. When something breaks, you return a non-nil error describing what went wrong.

---

## Don't Ignore Errors

It's tempting to throw away an error with `_`:

```go
result, _ := Divide(10, 0) // BAD — you'll never know it failed
```

This is almost always a mistake. If a function returns an error, there's a reason — handle it, log it, or at minimum, document why it's safe to ignore.
