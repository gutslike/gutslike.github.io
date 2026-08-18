---
title: "Maps in Go"
description: "A comprehensive guide to maps in Go, including declaration, manipulation, iteration, and the comma-ok idiom for safe map access."
pubDate: "Aug 11 2026"
heroImage: "../../../../assets/blog-placeholder-1.jpg"
---

Maps are unordered collections of key-value pairs. A map is Go's way of implementing hash tables or dictionaries.

Maps are useful when you need to associate values with keys and look them up quickly.

## 1. Map declaration and initialization

### Declaration without initialization

```go
var ages map[string]int
fmt.Println(ages == nil) // true
```

This declares a map with `nil` value. You cannot use it until initialized.

### Using `make()`

```go
ages := make(map[string]int)
ages["Alice"] = 30
ages["Bob"] = 25
```

### Map literals

```go
ages := map[string]int{
    "Alice": 30,
    "Bob":   25,
    "Charlie": 35,
}
```

## 2. Accessing map values

### Getting a value

```go
ages := map[string]int{
    "Alice": 30,
    "Bob":   25,
}

fmt.Println(ages["Alice"]) // 30
```

### Updating a value

```go
ages["Alice"] = 31
fmt.Println(ages["Alice"]) // 31
```

### Adding a new key

```go
ages["David"] = 28
```

## 3. The comma-ok idiom

When you access a map with a key that does not exist, you get the zero value for that type:

```go
ages := map[string]int{
    "Alice": 30,
}

fmt.Println(ages["Charlie"]) // 0 (zero value for int)
```

But how do you know if the key exists or if the value is actually 0?

Use the **comma-ok idiom**:

```go
ages := map[string]int{
    "Alice": 30,
}

val, ok := ages["Charlie"]
if ok {
    fmt.Println("Key exists:", val)
} else {
    fmt.Println("Key does not exist")
}
```

This returns two values:

- The value associated with the key (or zero value if not found)
- A boolean indicating whether the key exists

### Practical examples

```go
scores := map[string]int{
    "Alice": 95,
    "Bob":   87,
}

// Check if a key exists
if score, exists := scores["Charlie"]; exists {
    fmt.Println("Score:", score)
} else {
    fmt.Println("Charlie's score not found")
}

// Get value only, discard ok
score := scores["Alice"]

// Get ok value only
if _, exists := scores["Bob"]; exists {
    fmt.Println("Bob's score is recorded")
}
```

## 4. Deleting from a map

Use the `delete()` function to remove a key-value pair:

```go
ages := map[string]int{
    "Alice": 30,
    "Bob":   25,
}

delete(ages, "Bob")
fmt.Println(ages) // map[Alice:30]
```

Deleting a non-existent key does not cause an error:

```go
delete(ages, "Charlie") // Safe, no error
```

## 5. Map length

Use `len()` to get the number of key-value pairs:

```go
ages := map[string]int{
    "Alice": 30,
    "Bob":   25,
}

fmt.Println(len(ages)) // 2
```

## 6. Iterating over a map

### Using range

```go
ages := map[string]int{
    "Alice": 30,
    "Bob":   25,
    "Charlie": 35,
}

for name, age := range ages {
    fmt.Printf("%s: %d\n", name, age)
}
```

**Important:** Map iteration order is random. Each time you iterate, the order may be different:

```go
for name := range ages {
    fmt.Println(name)
}
// Output might be: Alice, Bob, Charlie
// Next run might be: Charlie, Alice, Bob
```

### Iterating in sorted order

To iterate in a specific order, sort the keys:

```go
import "sort"

names := make([]string, 0, len(ages))
for name := range ages {
    names = append(names, name)
}

sort.Strings(names)

for _, name := range names {
    fmt.Printf("%s: %d\n", name, ages[name])
}
```

## 7. Map types

Maps can use any comparable type as a key:

```go
// String keys
dict := map[string]string{}

// Integer keys
numbers := map[int]string{}

// Custom struct keys
type Point struct {
    x, y int
}
locations := map[Point]string{}
```

Values can be any type:

```go
// Slice values
tags := map[string][]string{}

// Function values
operations := map[string]func(int, int) int{}

// Nested maps
matrix := map[string]map[string]int{}
```

## 8. Nested maps

Working with maps containing maps:

```go
students := map[string]map[string]int{
    "Alice": {"Math": 95, "Science": 92},
    "Bob":   {"Math": 87, "Science": 89},
}

fmt.Println(students["Alice"]["Math"]) // 95
```

### Safe access to nested maps

```go
subjects, ok := students["Charlie"]
if ok {
    score, ok := subjects["Math"]
    if ok {
        fmt.Println(score)
    }
}
```

## 9. Maps are reference types

Maps are reference types, meaning they are passed by reference to functions:

```go
func addAge(ages map[string]int, name string, age int) {
    ages[name] = age
}

ages := map[string]int{
    "Alice": 30,
}

addAge(ages, "Bob", 25)
fmt.Println(ages) // map[Alice:30 Bob:25]
```

## 10. Checking if a map is empty

```go
ages := map[string]int{}
fmt.Println(len(ages) == 0) // true

ages["Alice"] = 30
fmt.Println(len(ages) == 0) // false
```

## 11. Clearing a map

Go does not have a built-in clear function for all versions, but you can create a new map:

```go
ages := map[string]int{
    "Alice": 30,
    "Bob":   25,
}

// Clear by creating a new map
ages = make(map[string]int)
```

Or in Go 1.21+, use the `clear()` built-in:

```go
clear(ages)
```

## 12. Map initialization with capacity

You can pre-allocate a map with an initial capacity hint:

```go
ages := make(map[string]int, 10)
```

This is useful when you know approximately how many items the map will contain.

## 13. Common patterns

### Counting occurrences

```go
text := "hello world hello go"
words := strings.Fields(text)
counts := make(map[string]int)

for _, word := range words {
    counts[word]++
}

fmt.Println(counts) // map[go:1 hello:2 world:1]
```

### Creating a set with a map

Go does not have a built-in set type, but you can use a map:

```go
set := map[string]bool{
    "apple":  true,
    "banana": true,
    "cherry": true,
}

// Check membership
if set["apple"] {
    fmt.Println("apple is in the set")
}

// Add to set
set["date"] = true

// Remove from set
delete(set, "banana")
```

Or use an empty struct for less memory:

```go
set := map[string]struct{}{
    "apple":  {},
    "banana": {},
    "cherry": {},
}

if _, ok := set["apple"]; ok {
    fmt.Println("apple is in the set")
}
```

## 14. Summary

Maps are dynamic, unordered collections of key-value pairs. Key points:

- Declare maps with `make()` or map literals
- Use the comma-ok idiom to safely check if a key exists
- Map iteration order is random
- Use `len()` to get the number of items
- Use `delete()` to remove entries
- Maps are reference types
- The comma-ok idiom is essential for safe map access

The comma-ok idiom is a Go idiom that you will use frequently when working with maps.
