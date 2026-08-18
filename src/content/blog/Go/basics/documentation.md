---
title: "Go Documentation: Tools and Best Practices"
description: "A comprehensive guide to Go documentation tools including go doc, godoc, documentation comments, and best practices for writing effective documentation."
pubDate: "Aug 7 2026"
heroImage: "../../../../assets/blog-placeholder-1.jpg"
---

Go takes documentation seriously. The language provides built-in tools to generate, view, and share documentation directly from your code. Good documentation is essential for making your code understandable and maintainable.

In this guide, we will explore:

- built-in documentation tools
- how to write effective documentation comments
- best practices for documenting code

## 1. Introduction to Go documentation

Go documentation is extracted directly from your source code using special comments.

Unlike many other languages, Go does not require external tools or special markup languages to generate professional-looking documentation.

The standard library is itself extensively documented, and you can explore it using built-in commands.

## 2. The `go doc` command

The `go doc` command displays documentation from the command line.

### Viewing package documentation

To view documentation for a package, use:

```bash
go doc packagename
```

For example, to see the `fmt` package documentation:

```bash
go doc fmt
```

This prints the package documentation and a list of exported functions, types, and methods.

### Viewing specific items

To view documentation for a specific function or type, use:

```bash
go doc packagename.Itemname
```

For example:

```bash
go doc fmt.Println
go doc fmt.Stringer
```

### Viewing method documentation

To view documentation for a method on a type, use:

```bash
go doc packagename.Typename.Methodname
```

For example:

```bash
go doc io.Reader.Read
```

### Local packages

`go doc` also works on your local packages:

```bash
go doc ./mypackage
go doc ./mypackage.MyFunction
```

### The `-all` flag

To see all documentation including unexported items, use:

```bash
go doc -all packagename
```

## 3. The `godoc` web interface

The `godoc` command launches a web server that displays documentation in a browser.

### Starting godoc

To start the godoc web server, run:

```bash
godoc -http=:6060
```

Then open your browser to `http://localhost:6060`.

### Viewing the standard library

The web interface shows documentation for the entire standard library in an interactive format.

You can search for packages, functions, and types.

### Viewing local packages

To view documentation for your local packages, navigate to `http://localhost:6060/pkg/yourpackagepath`.

## 4. Writing documentation comments

Documentation in Go is written as plain text comments that appear immediately before the item being documented.

### Package documentation

Package documentation is written in a comment block at the top of the package, before the `package` declaration:

```go
// Package math provides basic mathematical operations.
package math
```

### Function and type documentation

Documentation for a function or type is a comment that starts with the name of the item:

```go
// Add returns the sum of two integers.
func Add(a, b int) int {
    return a + b
}

// Person represents a person with a name and age.
type Person struct {
    Name string
    Age  int
}
```

### Method documentation

Methods are documented the same way:

```go
// Greet returns a greeting message for the person.
func (p Person) Greet() string {
    return "Hello, I am " + p.Name
}
```

### Documentation format

Go documentation comments are plain text, not markdown. However, they support some basic formatting:

- Indented text is treated as code or preformatted text
- Blank lines separate paragraphs
- URLs are automatically linked in godoc

Example:

```go
// Add returns the sum of two integers.
//
// It is equivalent to:
//
//     result := a + b
//
// For more information, visit https://golang.org
func Add(a, b int) int {
    return a + b
}
```

### Documenting struct fields

You can document struct fields by placing a comment above each field:

```go
type Person struct {
    // Name is the person's full name.
    Name string

    // Age is the person's age in years.
    Age int
}
```

### Documenting constants and variables

Constants and variables are documented similarly:

```go
// MaxRetries is the maximum number of retries allowed.
const MaxRetries = 3

// ErrNotFound is returned when an item is not found.
var ErrNotFound = errors.New("item not found")
```

## 5. Best practices for documentation

### Write clear and concise comments

Documentation should be clear and concise. Avoid redundant information.

**Good:**

```go
// Sqrt returns the square root of x.
func Sqrt(x float64) float64
```

**Poor:**

```go
// This function takes a float64 parameter called x
// and returns the square root of that parameter
// as a float64 return value
func Sqrt(x float64) float64
```

### Start with the name

Always start a documentation comment with the name of the item being documented.

This helps godoc and `go doc` extract and display the documentation correctly.

```go
// Reader reads data from an input stream.
type Reader interface {
    Read(p []byte) (n int, err error)
}
```

### Use complete sentences

Write complete sentences in documentation comments, not fragments.

**Good:**

```go
// Reverse returns a copy of the string with characters reversed.
func Reverse(s string) string
```

**Poor:**

```go
// Reversing the string
func Reverse(s string) string
```

### Document public APIs

Document all exported (public) identifiers in your code.

Exported identifiers start with a capital letter.

Unexported identifiers (lowercase) do not need documentation, but can benefit from it.

### Explain the purpose, not the mechanics

Focus on what the function or type does and why you would use it, not how it works internally.

```go
// Reader provides an interface for reading data.
// Implementations can read from files, networks, or memory.
type Reader interface {
    Read(p []byte) (n int, err error)
}
```

### Provide examples when helpful

Use indented code blocks to show examples:

```go
// Split returns a slice of substrings separated by sep.
//
// Example:
//
//     words := Split("hello,world", ",")
//     // words == []string{"hello", "world"}
func Split(s, sep string) []string
```

### Use godoc to preview

Before publishing your code, use `godoc` to preview how your documentation looks:

```bash
godoc -http=:6060
```

This helps catch formatting issues and ensures your documentation is clear.

## 6. The `go help` command

The `go help` command provides information about Go commands.

### Getting help on a command

To get help on a specific Go command, use:

```bash
go help commandname
```

For example:

```bash
go help build
go help test
go help fmt
```

### Listing all commands

To see all available commands:

```bash
go help
```

This is useful for discovering which Go tools are available.

## 7. Real-world example

Here is a complete example of well-documented Go code:

```go
// Package calculator provides basic arithmetic operations.
package calculator

import "errors"

// ErrDivideByZero is returned when attempting to divide by zero.
var ErrDivideByZero = errors.New("division by zero")

// Add returns the sum of two numbers.
func Add(a, b float64) float64 {
    return a + b
}

// Divide returns a divided by b, or an error if b is zero.
//
// Example:
//
//     result, err := Divide(10, 2)
//     if err != nil {
//         log.Fatal(err)
//     }
//     fmt.Println(result) // 5
func Divide(a, b float64) (float64, error) {
    if b == 0 {
        return 0, ErrDivideByZero
    }
    return a / b, nil
}
```

When you run `go doc calculator`, you will see all the exported functions and variables with their documentation.

## 8. Summary

Go provides powerful, built-in tools for writing and viewing documentation:

- `go doc` displays documentation from the command line
- `godoc` provides a web interface for exploring documentation
- Documentation comments are plain text placed before exported items
- `go help` provides information about Go commands

By following Go's documentation conventions and best practices, you make your code more discoverable, maintainable, and professional.

Good documentation is a sign of good code. Take time to document your public APIs and explain their purpose to future readers and users of your code.

---

**Reference:** For more insights on Go documentation practices, see [A Guide to Effective Go Documentation](https://nirdoshgautam.medium.com/a-guide-to-effective-go-documentation-952f346d073f).
