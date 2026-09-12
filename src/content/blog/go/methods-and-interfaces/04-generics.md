---
title: "Generics in Go"
description: "Understanding type parameters, type constraints, and how to write reusable generic code."
pubDate: 2026-09-12
series: "methods-and-interfaces"
order: 4
---

## Why Generics?

For over a decade, Go developers had a common complaint: if you wanted to write a function that reverses a slice of `int`s, and another that reverses a slice of `string`s, you had to write the exact same logic twice. 

You could use `interface{}` (now `any`), but you lost all compile-time type safety. In Go 1.18, **Generics** were finally introduced to solve this. Generics allow you to write a function or type that works with *any* type, while still keeping strict type safety.

---

## Generic Functions and Type Parameters

A generic function uses **type parameters** enclosed in square brackets `[]` right before the regular function arguments.

```go
package main

import "fmt"

// [T any] defines T as a generic type that can be "any" type.
func PrintSlice[T any](s []T) {
    for _, v := range s {
        fmt.Println(v)
    }
}

func main() {
    PrintSlice[int]([]int{1, 2, 3})
    PrintSlice[string]([]string{"a", "b", "c"})
}
```

### Type Inference

Go's compiler is smart. In most cases, it can figure out what `T` is based on the arguments you pass in, meaning you don't actually have to write `[int]` or `[string]` when calling the function:

```go
// The compiler infers T is int
PrintSlice([]int{1, 2, 3}) 
```

---

## Type Constraints

Using `[T any]` is great, but what if your function needs to compare two values?

```go
// This will NOT compile!
func IsEqual[T any](a, b T) bool {
    return a == b // Error: invalid operation: a == b (operator == not defined for T)
}
```
Because `T` can literally be *anything* (like a slice or a map, which can't be compared with `==`), the compiler throws an error.

To fix this, we restrict `T` using a **type constraint**. Instead of `any`, we use `comparable`, a built-in constraint for types that support `==` and `!=`.

```go
func IsEqual[T comparable](a, b T) bool {
    return a == b // Now this works!
}
```

### Custom Constraints

You can create your own constraints using interfaces. If you want a function to only accept numbers, you can define an interface that acts as a union of specific types:

```go
type Number interface {
    int | int64 | float32 | float64
}

func Add[T Number](a, b T) T {
    return a + b
}
```

---

## Generic Types

You can also create generic structs. This is incredibly useful for data structures like linked lists or binary trees.

```go
// A generic stack that can hold any type T
type Stack[T any] struct {
    elements []T
}

func (s *Stack[T]) Push(value T) {
    s.elements = append(s.elements, value)
}

func main() {
    // A stack of integers
    intStack := Stack[int]{}
    intStack.Push(10)

    // A stack of strings
    stringStack := Stack[string]{}
    stringStack.Push("Hello")
}
```

Generics make Go powerful and expressive, but don't overuse them. As the Go team says: **"Write code, not generics."** Only reach for generics when you find yourself writing the exact same boilerplate code for multiple types.
