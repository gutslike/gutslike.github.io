---
title: "Variables and Constants"
description: "A beginner-friendly guide to variables, constants, scope, zero values, and best practices in Go."
pubDate: "Aug 05 2026"
heroImage: "../../../../assets/blog-placeholder-1.jpg"
---

Variables are used to store values that can change during the program. Constants are used for values that should stay fixed.

## 1. Types of variables with examples

Go has several built-in variable types:

- `int` for whole numbers

  ```go
  var age int = 25
  ```

- `float64` for decimal numbers

  ```go
  var price float64 = 19.99
  ```

- `string` for text

  ```go
  var name string = "Alice"
  ```

- `bool` for true or false values

  ```go
  var isReady bool = true
  ```

- `byte` for single bytes

  ```go
  var b byte = 65
  ```

- `rune` for Unicode characters
  ```go
  var ch rune = 'A'
  ```

## 2. `var` vs `:=`

Use `var` when you want to declare a variable explicitly.

```go
var count int = 10
```

Use `:=` for short declaration when the variable is being created and its type can be inferred.

```go
count := 10
```

A few important points:

- `:=` can only be used when at least one new variable is being created.
- `var` works in more situations, including declarations without initialization.

## 3. Zero values and default values

If a variable is declared without an initial value, Go assigns a zero value automatically.

| Type      | Zero value |
| --------- | ---------- |
| `int`     | `0`        |
| `float64` | `0`        |
| `string`  | `""`       |
| `bool`    | `false`    |
| `pointer` | `nil`      |

Example:

```go
var x int
var name string
var ok bool

fmt.Println(x)    // 0
fmt.Println(name) // ""
fmt.Println(ok)   // false
```

## 4. Constants and `iota`

Constants are declared with `const` and cannot be changed after assignment.

```go
const pi = 3.14
```

Constants must be known at compile time.

### `iota`

`iota` is a special identifier used in constant declarations to create increasing values automatically.

```go
const (
    Monday = iota
    Tuesday
    Wednesday
)
```

This gives:

```go
Monday = 0
Tuesday = 1
Wednesday = 2
```

You can also use `iota` with expressions:

```go
const (
    KB = 1 << (10 * iota)
    MB
    GB
)
```

## 5. Scope and shadowing

Scope determines where a variable or constant can be used.

### Block scope

Variables declared inside a block are only available inside that block.

```go
func main() {
    x := 5
    fmt.Println(x)
}
```

### Shadowing

Shadowing happens when a new variable with the same name is declared inside a smaller scope.

```go
x := 10

if true {
    x := 20
    fmt.Println(x) // 20
}

fmt.Println(x) // 10
```

This is allowed, but it can make code harder to read if overused.

## 6. Best practices

- Use `var` when you want explicit declarations.
- Use `:=` for short and simple declarations.
- Prefer meaningful names like `userName` instead of `x`.
- Use constants for fixed values such as configuration values or math constants.
- Avoid unnecessary shadowing because it can confuse readers.
- Keep variable scope as small as possible.

## 7. Summary

Variables hold values that can change, while constants hold fixed values. Go gives you powerful tools like type inference, zero values, `iota`, and scoped declarations to write clean and safe code.
