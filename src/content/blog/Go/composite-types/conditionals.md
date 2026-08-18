---
title: "Conditionals in Go"
description: "A comprehensive guide to conditionals in Go, including if statements, if-else chains, and switch statements."
pubDate: "Aug 13 2026"
heroImage: "../../../../assets/blog-placeholder-1.jpg"
---

Conditionals allow your program to make decisions and execute different code based on conditions.

Go provides `if`, `if-else`, and `switch` statements for conditional execution.

## 1. The `if` statement

### Basic if statement

```go
age := 18

if age >= 18 {
    fmt.Println("You are an adult")
}
```

The condition must be a boolean value. Go does not allow implicit conversions from other types to boolean.

### Initialization in if

You can initialize a variable in the if statement:

```go
if age := getAge(); age >= 18 {
    fmt.Println("Adult")
}
// age is not accessible here (scoped to if block)
```

This is useful for keeping variable scope minimal.

### Conditions

```go
// Equality
if x == 5 { }

// Comparison
if x > 10 { }
if x < 5 { }
if x >= 15 { }
if x <= 20 { }

// Inequality
if x != 0 { }

// Logical AND
if x > 0 && x < 10 { }

// Logical OR
if x < 5 || x > 20 { }

// Logical NOT
if !(x == 0) { }
```

## 2. The `if-else` statement

### Basic if-else

```go
age := 15

if age >= 18 {
    fmt.Println("You are an adult")
} else {
    fmt.Println("You are a minor")
}
```

### if-else-if chain

For multiple conditions, use if-else-if:

```go
score := 85

if score >= 90 {
    fmt.Println("Grade A")
} else if score >= 80 {
    fmt.Println("Grade B")
} else if score >= 70 {
    fmt.Println("Grade C")
} else {
    fmt.Println("Grade F")
}
```

### Nested if-else

```go
age := 25
hasLicense := true

if age >= 18 {
    if hasLicense {
        fmt.Println("Can drive")
    } else {
        fmt.Println("Too young to drive without license")
    }
} else {
    fmt.Println("Too young to drive")
}
```

While nested conditionals work, too many levels can make code hard to read. Consider refactoring with functions or switch statements.

## 3. The `switch` statement

### Basic switch

```go
day := 3

switch day {
case 1:
    fmt.Println("Monday")
case 2:
    fmt.Println("Tuesday")
case 3:
    fmt.Println("Wednesday")
default:
    fmt.Println("Unknown day")
}
```

The switch statement tests a value against multiple cases and executes the matching case.

Unlike many languages, Go does **not** fall through to the next case by default. Each case is independent.

### Fall-through with fallthrough

To explicitly fall through to the next case, use the `fallthrough` keyword:

```go
day := 1

switch day {
case 1, 2, 3, 4, 5:
    fmt.Println("Weekday")
    if day == 1 {
        fmt.Println("Monday specifically")
        fallthrough
    }
case 6, 7:
    fmt.Println("Weekend")
default:
    fmt.Println("Unknown")
}
```

### Multiple values in one case

```go
day := 6

switch day {
case 1, 2, 3, 4, 5:
    fmt.Println("Weekday")
case 6, 7:
    fmt.Println("Weekend")
}
```

### Switch without a condition

You can use `switch` without a condition as an alternative to if-else-if chains:

```go
age := 25

switch {
case age < 13:
    fmt.Println("Child")
case age < 18:
    fmt.Println("Teenager")
case age < 65:
    fmt.Println("Adult")
default:
    fmt.Println("Senior")
}
```

This is cleaner than multiple if-else-if statements.

### Switch with initialization

```go
switch x := getNumber(); {
case x < 0:
    fmt.Println("Negative")
case x == 0:
    fmt.Println("Zero")
default:
    fmt.Println("Positive")
}
```

## 4. Type switch

A type switch compares the type of a value:

```go
var x interface{} = "hello"

switch x.(type) {
case string:
    fmt.Println("String")
case int:
    fmt.Println("Integer")
case bool:
    fmt.Println("Boolean")
default:
    fmt.Println("Unknown type")
}
```

### Type switch with binding

You can bind the value to a variable:

```go
switch v := x.(type) {
case string:
    fmt.Println("String:", v)
case int:
    fmt.Println("Integer:", v)
default:
    fmt.Println("Unknown type")
}
```

## 5. Practical examples

### Validating user input

```go
func validateGrade(grade string) string {
    switch grade {
    case "A", "B", "C", "D", "F":
        return "Valid grade"
    default:
        return "Invalid grade"
    }
}
```

### HTTP status codes

```go
func handleStatus(code int) {
    switch code {
    case 200:
        fmt.Println("OK")
    case 404:
        fmt.Println("Not Found")
    case 500:
        fmt.Println("Internal Server Error")
    default:
        fmt.Println("Unknown status code")
    }
}
```

### Parsing a command

```go
func processCommand(cmd string) {
    switch cmd {
    case "start":
        fmt.Println("Starting...")
    case "stop":
        fmt.Println("Stopping...")
    case "restart":
        fmt.Println("Restarting...")
    default:
        fmt.Println("Unknown command")
    }
}
```

## 6. Common mistakes

### Forgetting the condition in if

```go
// Wrong
if x = 5 {  // Assignment, not comparison
    fmt.Println(x)
}

// Correct
if x == 5 {
    fmt.Println(x)
}
```

### Not handling all cases in switch

```go
status := "unknown"

switch status {
case "active":
    fmt.Println("Active")
case "inactive":
    fmt.Println("Inactive")
// Missing default case
}
```

Always include a `default` case unless you are certain all values are covered.

### Using switch with incompatible types

```go
var x interface{}
x = "hello"

switch x {
case 1:      // This case will never match
    fmt.Println("Number")
case "hello":
    fmt.Println("String")
}
```

## 7. Choosing between if and switch

Use `if` when:

- You have only one or two conditions
- Conditions are unrelated

Use `switch` when:

- You have many conditions to test against the same value
- Code is cleaner and more readable

## 8. Summary

Go provides three main ways to handle conditionals:

- `if` for a single condition
- `if-else` chains for multiple conditions
- `switch` for matching a value against many cases

Key points:

- Boolean conditions are required; no implicit conversions
- Variables can be initialized in if conditions
- Switch statements do not fall through by default
- Type switches allow checking the type of a value
- Use `default` case in switches for unhandled values

Conditionals are essential for writing programs that respond to different inputs and states.
