---
title: "Interfaces and Type Assertions"
description: "How interfaces enable polymorphism in Go, the empty interface, and type switching."
pubDate: 2026-09-12
series: "methods-and-interfaces"
order: 3
---

## What is an Interface?

If a **struct** defines what data a type holds, an **interface** defines what a type can *do*. 

In Go, interfaces are handled implicitly. You don't write `class User implements Greeter`. Instead, if your `User` type has all the methods that the `Greeter` interface requires, then `User` automatically *is* a `Greeter`. This is called "duck typing" (if it walks like a duck and quacks like a duck, it's a duck).

### A Practical Example

Let's define a `Shape` interface that requires an `Area()` method:

```go
package main

import (
    "fmt"
    "math"
)

// The Interface
type Shape interface {
    Area() float64
}

// A Rectangle Struct
type Rectangle struct {
    Width, Height float64
}

// Rectangle implicitly implements Shape!
func (r Rectangle) Area() float64 {
    return r.Width * r.Height
}

// A Circle Struct
type Circle struct {
    Radius float64
}

// Circle implicitly implements Shape too!
func (c Circle) Area() float64 {
    return math.Pi * c.Radius * c.Radius
}
```

Because both `Rectangle` and `Circle` implement `Area() float64`, we can write a function that accepts *any* `Shape`:

```go
func PrintArea(s Shape) {
    fmt.Printf("Area: %f\n", s.Area())
}

func main() {
    r := Rectangle{Width: 5, Height: 10}
    c := Circle{Radius: 7}
    
    PrintArea(r) // Works!
    PrintArea(c) // Works!
}
```

---

## The Empty Interface (`any`)

What if an interface requires *zero* methods?

```go
interface{}
```

Since every type in Go implements at least zero methods, **every type satisfies the empty interface**. It acts like `Object` in Java or `any` in TypeScript. In modern Go (1.18+), you can literally just use the keyword `any` instead of `interface{}`.

```go
func PrintAnything(v any) {
    fmt.Println(v)
}
```
Use this sparingly! Go is a statically typed language; using `any` bypasses type safety and makes your code harder to read.

---

## Type Assertions

If you have an interface variable, you might need to extract the underlying concrete value. A **type assertion** checks if the interface holds a specific type.

```go
var i any = "hello"

// Asserts that i holds a string, and assigns it to s
s := i.(string)
fmt.Println(s) // "hello"
```

If you guess wrong, the program will panic (crash). To prevent this, use the "comma ok" idiom:

```go
s, ok := i.(string)
if !ok {
    fmt.Println("i is not a string!")
}
```

---

## Type Switches

If an interface could be one of several types, a type switch is cleaner than multiple type assertions:

```go
func DoSomething(v any) {
    switch v.(type) {
    case int:
        fmt.Println("It's an int")
    case string:
        fmt.Println("It's a string")
    default:
        fmt.Println("Unknown type")
    }
}
```

---

## Interface Embedding

Just like you can embed structs within structs, you can embed interfaces within interfaces to combine them.

```go
type Reader interface {
    Read(p []byte) (n int, err error)
}

type Writer interface {
    Write(p []byte) (n int, err error)
}

// ReadWriter requires both Read and Write methods
type ReadWriter interface {
    Reader
    Writer
}
```

Interfaces are the cornerstone of decoupled, testable Go code. By depending on interfaces (like `io.Reader`) rather than concrete types (like `os.File`), your functions become incredibly flexible.
