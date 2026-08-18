---
title: "Loops in Go"
description: "A comprehensive guide to loops in Go, including for loops, range iteration, break, continue, and goto (discouraged)."
pubDate: "Aug 14 2026"
heroImage: "../../../../assets/blog-placeholder-1.jpg"
---

Loops allow you to repeat a block of code multiple times. Go provides the `for` loop as its primary looping mechanism, with several variations to suit different needs.

## 1. The basic `for` loop

### Traditional for loop

```go
for i := 0; i < 5; i++ {
    fmt.Println(i)
}
// Output: 0 1 2 3 4
```

This is similar to for loops in other languages:

- **Initialization**: `i := 0` runs before the loop
- **Condition**: `i < 5` is checked before each iteration
- **Increment**: `i++` runs after each iteration

### Loop with only a condition

```go
i := 0
for i < 5 {
    fmt.Println(i)
    i++
}
```

This is like a `while` loop in other languages.

### Infinite loop

```go
for {
    fmt.Println("Infinite loop")
    break // Must break or it runs forever
}
```

Infinite loops are useful when you need to loop until a specific condition is met.

## 2. The `range` keyword

The `range` keyword iterates over collections (arrays, slices, strings, maps).

### Iterating over slices

```go
nums := []int{10, 20, 30}

for i, val := range nums {
    fmt.Printf("Index: %d, Value: %d\n", i, val)
}
// Output:
// Index: 0, Value: 10
// Index: 1, Value: 20
// Index: 2, Value: 30
```

`range` returns the index and the value.

### Ignoring the index

```go
for _, val := range nums {
    fmt.Println(val)
}
```

Use `_` to ignore the index.

### Ignoring the value

```go
for i := range nums {
    fmt.Println(i)
}
```

## 3. Iterating over strings

When you use `range` on a string, it returns runes (Unicode characters), not bytes:

```go
s := "Hello"

for i, r := range s {
    fmt.Printf("Index: %d, Rune: %c\n", i, r)
}
// Output:
// Index: 0, Rune: H
// Index: 1, Rune: e
// Index: 2, Rune: l
// Index: 3, Rune: l
// Index: 4, Rune: o
```

This properly handles multi-byte Unicode characters:

```go
s := "Hello, 世界"

for _, r := range s {
    fmt.Printf("Rune: %c\n", r)
}
```

## 4. Iterating over maps

When iterating over a map with `range`, you get the key and value:

```go
ages := map[string]int{
    "Alice": 30,
    "Bob":   25,
}

for name, age := range ages {
    fmt.Printf("%s: %d\n", name, age)
}
```

**Important:** Map iteration order is random. Each run may produce a different order.

To iterate in a specific order, sort the keys first.

### Iterating over only keys

```go
for name := range ages {
    fmt.Println(name)
}
```

### Iterating over only values

```go
for _, age := range ages {
    fmt.Println(age)
}
```

## 5. The `break` statement

`break` exits the loop immediately:

```go
for i := 0; i < 10; i++ {
    if i == 5 {
        break
    }
    fmt.Println(i)
}
// Output: 0 1 2 3 4
```

### Breaking nested loops

`break` only breaks out of the innermost loop:

```go
for i := 0; i < 3; i++ {
    for j := 0; j < 3; j++ {
        if j == 1 {
            break // Only breaks inner loop
        }
        fmt.Printf("i=%d j=%d\n", i, j)
    }
}
// Output:
// i=0 j=0
// i=1 j=0
// i=2 j=0
```

To break out of outer loops, use a labeled break:

```go
Outer:
for i := 0; i < 3; i++ {
    for j := 0; j < 3; j++ {
        if j == 1 {
            break Outer // Breaks out of outer loop
        }
        fmt.Printf("i=%d j=%d\n", i, j)
    }
}
// Output: i=0 j=0
```

## 6. The `continue` statement

`continue` skips the rest of the current iteration and moves to the next one:

```go
for i := 0; i < 5; i++ {
    if i == 2 {
        continue
    }
    fmt.Println(i)
}
// Output: 0 1 3 4
```

### Continue in nested loops

`continue` only skips the innermost loop:

```go
for i := 0; i < 3; i++ {
    for j := 0; j < 3; j++ {
        if j == 1 {
            continue // Skips to next j
        }
        fmt.Printf("i=%d j=%d\n", i, j)
    }
}
// Output:
// i=0 j=0
// i=0 j=2
// i=1 j=0
// i=1 j=2
// i=2 j=0
// i=2 j=2
```

You can use labeled continue for outer loops:

```go
Outer:
for i := 0; i < 3; i++ {
    for j := 0; j < 3; j++ {
        if j == 1 {
            continue Outer // Continues to next i
        }
        fmt.Printf("i=%d j=%d\n", i, j)
    }
}
// Output: i=0 j=0
//        i=1 j=0
//        i=2 j=0
```

## 7. The `goto` statement (discouraged)

Go supports `goto` for jumping to a labeled statement, but it is heavily discouraged because it makes code harder to understand.

### Basic goto

```go
i := 0

Start:
if i < 5 {
    fmt.Println(i)
    i++
    goto Start
}
```

This is equivalent to a `for` loop but much less readable.

### Why goto is discouraged

- Makes code flow harder to follow
- Can lead to "spaghetti code"
- Modern programming practices have better alternatives
- Go's designers included it for compatibility but recommend against using it

### When goto might be acceptable

The only common acceptable use is for error handling in C-style code within a single function:

```go
func process() error {
    err := step1()
    if err != nil {
        goto cleanup
    }

    err = step2()
    if err != nil {
        goto cleanup
    }

    return nil

cleanup:
    // Cleanup code
    return err
}
```

Even then, consider using functions or defer instead.

## 8. Practical examples

### Finding a value in a slice

```go
nums := []int{10, 20, 30, 40, 50}
target := 30

found := false
for _, num := range nums {
    if num == target {
        found = true
        break
    }
}

if found {
    fmt.Println("Found")
}
```

### Filtering elements

```go
nums := []int{1, 2, 3, 4, 5, 6}
var evens []int

for _, num := range nums {
    if num%2 == 0 {
        evens = append(evens, num)
    }
}

fmt.Println(evens) // [2 4 6]
```

### Nested loops for matrices

```go
matrix := [][]int{
    {1, 2, 3},
    {4, 5, 6},
    {7, 8, 9},
}

for i, row := range matrix {
    for j, val := range row {
        fmt.Printf("matrix[%d][%d] = %d\n", i, j, val)
    }
}
```

## 9. Summary

Go provides several ways to loop:

- Traditional `for` loop for counter-based iteration
- `range` for iterating over collections
- `break` to exit a loop
- `continue` to skip to the next iteration
- `goto` (discouraged) for jumping to labels

Key points:

- `for` is the only looping construct in Go (no `while`, `do-while`)
- `range` properly handles Unicode in strings
- Labeled `break` and `continue` work with nested loops
- Avoid `goto` in favor of structured programming
- Use loops to process collections and repeat logic

Loops are fundamental for working with collections and repetitive tasks.
