---
title: "Pointers in Go"
description: "A comprehensive guide to pointers in Go, including basics, operations with structs, maps, slices, and practical applications."
pubDate: "Aug 16 2026"
heroImage: "../../../../assets/blog-placeholder-1.jpg"
---

Pointers are variables that store memory addresses. Understanding pointers is essential for writing efficient Go code and modifying values in functions.

## 1. Pointer basics

### What is a pointer?

A pointer stores the memory address of another variable. Use the `&` operator to get the address, and `*` to dereference (access the value):

```go
x := 5
ptr := &x    // ptr stores the address of x

fmt.Println(x)      // 5
fmt.Println(ptr)    // 0xc0000b0008 (memory address)
fmt.Println(*ptr)   // 5 (dereference)
```

### Declaring pointer types

```go
var ptr *int      // Pointer to int
var ptr *string   // Pointer to string
var ptr *bool     // Pointer to bool
```

The `*` indicates the type is a pointer.

### Nil pointers

A pointer that does not point to anything has a `nil` value:

```go
var ptr *int
fmt.Println(ptr == nil) // true
```

Dereferencing a `nil` pointer causes a panic:

```go
var ptr *int
fmt.Println(*ptr) // Panic: nil pointer dereference
```

Always check for `nil` before dereferencing:

```go
var ptr *int
if ptr != nil {
    fmt.Println(*ptr)
}
```

## 2. Working with pointers

### Modifying through pointers

```go
x := 5
ptr := &x

*ptr = 10
fmt.Println(x)   // 10 (x is modified)
fmt.Println(*ptr) // 10
```

### Comparing pointers

```go
x := 5
y := 5

ptr1 := &x
ptr2 := &y
ptr3 := &x

fmt.Println(ptr1 == ptr2) // false (different addresses)
fmt.Println(ptr1 == ptr3) // true (same address)
fmt.Println(*ptr1 == *ptr2) // true (same values)
```

## 3. Pointers with structs

### Accessing struct fields through pointers

```go
type Person struct {
    Name string
    Age  int
}

p := Person{Name: "Alice", Age: 30}
ptr := &p

fmt.Println(ptr.Name)  // Alice (Go auto-dereferences)
fmt.Println(ptr.Age)   // 30

ptr.Age = 31
fmt.Println(p.Age)     // 31 (original is modified)
```

Go automatically dereferences struct pointers, so you can use dot notation without explicit dereferencing.

### Explicit dereferencing

You can also explicitly dereference:

```go
fmt.Println((*ptr).Name) // Alice
(*ptr).Age = 32
```

But the auto-dereferencing approach is more idiomatic.

### Pointer receivers in methods

Methods that need to modify the receiver should use a pointer receiver:

```go
func (p *Person) Birthday() {
    p.Age++
}

p := Person{Name: "Alice", Age: 30}
p.Birthday()
fmt.Println(p.Age) // 31
```

Go automatically passes the address for pointer receivers:

```go
p := Person{Name: "Alice", Age: 30}
p.Birthday()        // Equivalent to (&p).Birthday()
```

### Creating structs with pointers

```go
p1 := &Person{Name: "Alice", Age: 30}
p2 := new(Person)
p2.Name = "Bob"
p2.Age = 25

fmt.Println(p1.Name) // Alice
fmt.Println(p2.Name) // Bob
```

Both `&Person{}` and `new(Person)` allocate memory for a struct and return a pointer.

## 4. Pointers with slices

### Slices already reference data

Slices are already reference types, so passing a slice to a function affects the original elements:

```go
func modifySlice(nums []int) {
    nums[0] = 100
}

nums := []int{1, 2, 3}
modifySlice(nums)
fmt.Println(nums[0]) // 100 (modified)
```

### When to use pointers to slices

Use a pointer to a slice only when you need to modify the slice header itself (length, capacity, or the underlying array):

```go
func appendNumber(nums *[]int, val int) {
    *nums = append(*nums, val)
}

nums := []int{1, 2, 3}
appendNumber(&nums, 4)
fmt.Println(nums) // [1 2 3 4]
```

Without the pointer, `append()` returns a new slice, but the original is not updated:

```go
func appendNumber(nums []int, val int) {
    nums = append(nums, val) // nums is reassigned, original unchanged
}

nums := []int{1, 2, 3}
appendNumber(nums, 4)
fmt.Println(nums) // [1 2 3] (unchanged)
```

### Pointer to slice elements

```go
nums := []int{1, 2, 3}
ptr := &nums[0]
*ptr = 100
fmt.Println(nums[0]) // 100
```

## 5. Pointers with maps

### Maps are reference types

Like slices, maps are already reference types:

```go
func addToMap(m map[string]int, key string, value int) {
    m[key] = value
}

ages := map[string]int{
    "Alice": 30,
}

addToMap(ages, "Bob", 25)
fmt.Println(ages) // map[Alice:30 Bob:25]
```

### When to use pointers to maps

Generally, you do not need pointers to maps because they are already reference types.

However, if you need to reassign the entire map variable, use a pointer:

```go
func replaceMap(m *map[string]int) {
    *m = map[string]int{"Charlie": 35}
}

ages := map[string]int{"Alice": 30}
replaceMap(&ages)
fmt.Println(ages) // map[Charlie:35]
```

## 6. Practical patterns

### Function parameters

Use value receivers for immutable operations:

```go
func processData(data []int) int {
    sum := 0
    for _, val := range data {
        sum += val
    }
    return sum
}
```

Use pointer receivers for mutations:

```go
func increment(ptr *int) {
    *ptr++
}
```

### Out parameters

Use pointers to return multiple values:

```go
func swap(a, b *int) {
    *a, *b = *b, *a
}

x, y := 1, 2
swap(&x, &y)
fmt.Println(x, y) // 2 1
```

### Builder pattern

```go
type StringBuilder struct {
    parts []string
}

func (sb *StringBuilder) Add(s string) *StringBuilder {
    sb.parts = append(sb.parts, s)
    return sb
}

func (sb *StringBuilder) String() string {
    return strings.Join(sb.parts, "")
}

result := (&StringBuilder{}).Add("Hello").Add(" ").Add("World").String()
fmt.Println(result) // Hello World
```

### Avoiding unnecessary pointers

Not everything needs a pointer:

```go
// Good: value type for simple data
type Point struct {
    X, Y float64
}

// Acceptable: pointer when frequently modified
type Database struct {
    conn Connection
}

var db *Database = connectDB()
```

## 7. Pointer arrays

```go
var ptrs [3]*int

x, y, z := 1, 2, 3
ptrs[0] = &x
ptrs[1] = &y
ptrs[2] = &z

for _, ptr := range ptrs {
    fmt.Println(*ptr)
}
// Output: 1 2 3
```

## 8. Function pointers

Store functions as pointers:

```go
var f func(int) int

f = func(x int) int {
    return x * 2
}

result := f(5)
fmt.Println(result) // 10
```

## 9. Common mistakes

### Dereferencing nil

```go
var ptr *int
fmt.Println(*ptr) // Panic
```

Always check for `nil` first.

### Forgetting the `&` operator

```go
x := 5
ptr := x // Wrong: ptr is an int, not a pointer
ptr := &x // Correct
```

### Using pointers unnecessarily

```go
func add(a *int, b *int) *int { // Overkill for simple integers
    result := *a + *b
    return &result
}

func add(a, b int) int { // Better
    return a + b
}
```

## 10. Summary

Pointers store memory addresses and enable efficient data manipulation. Key points:

- Use `&` to get an address and `*` to dereference
- Slices and maps are already reference types
- Pointer receivers in methods allow modification
- Go auto-dereferences struct pointers in dot notation
- Use pointers for out parameters or when modifying in functions
- Slices and maps rarely need pointers
- Always check for `nil` before dereferencing

Pointers are powerful but should be used judiciously. Most Go code uses pointers sparingly compared to languages like C or C++.
