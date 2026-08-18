---
title: "Strings in Go"
description: "A comprehensive guide to working with strings in Go, including runes, encoding, manipulation, and common string operations."
pubDate: "Aug 10 2026"
heroImage: "../../../../assets/blog-placeholder-1.jpg"
---

Strings are one of the most commonly used data types in Go. A string is an immutable sequence of bytes that represents text.

Understanding how Go handles strings is essential because Go's approach differs from many other languages.

## 1. String basics

### Declaration and initialization

```go
var greeting string = "Hello, Go!"
message := "Welcome"
```

Strings in Go are immutable, meaning once created, you cannot change individual characters.

### String literals

Go provides two types of string literals:

**Interpreted string literals** (in double quotes):

```go
s := "Hello\nWorld"  // \n is interpreted as a newline
```

**Raw string literals** (in backticks):

```go
s := `Hello\nWorld`  // \n is literal, not a newline
```

Raw strings are useful for multi-line text and paths:

```go
path := `C:\Users\name\file.txt`
sql := `SELECT * FROM users
WHERE age > 18`
```

## 2. Strings as sequences of bytes

Strings in Go are implemented as sequences of bytes. When you index a string, you get bytes, not runes:

```go
s := "Hello"
fmt.Println(s[0])       // 72 (ASCII for 'H')
fmt.Println(s[1])       // 101 (ASCII for 'e')
```

### Length of a string

`len()` returns the number of bytes, not the number of characters:

```go
s := "Hello"
fmt.Println(len(s))     // 5

s = "Hello, 世"
fmt.Println(len(s))     // 9 (the Chinese character takes 3 bytes in UTF-8)
```

## 3. Runes and UTF-8

A **rune** is a single Unicode character, represented as a 32-bit integer.

When you need to work with individual characters (especially non-ASCII), convert the string to a slice of runes:

```go
s := "Hello, 世界"
runes := []rune(s)

fmt.Println(len(runes))  // 9 (9 characters)
fmt.Println(runes[7])    // 19990 (Unicode value of '世')
```

### Iterating with range

The `range` keyword iterates over runes, not bytes:

```go
s := "Hello, 世界"
for i, r := range s {
    fmt.Printf("Index: %d, Rune: %c, Value: %d\n", i, r, r)
}
```

This properly handles multi-byte Unicode characters.

## 4. String conversion

### Converting strings to bytes

```go
s := "Hello"
bytes := []byte(s)
fmt.Println(bytes) // [72 101 108 108 111]
```

### Converting bytes to string

```go
bytes := []byte{72, 101, 108, 108, 111}
s := string(bytes)
fmt.Println(s) // Hello
```

### Converting runes to string

```go
runes := []rune{'H', 'e', 'l', 'l', 'o'}
s := string(runes)
fmt.Println(s) // Hello
```

## 5. String concatenation

### Using the `+` operator

```go
s1 := "Hello"
s2 := "World"
result := s1 + " " + s2
fmt.Println(result) // Hello World
```

### Using `strings.Builder` (recommended for multiple concatenations)

```go
import "strings"

var builder strings.Builder
builder.WriteString("Hello")
builder.WriteString(" ")
builder.WriteString("World")
result := builder.String()
fmt.Println(result) // Hello World
```

The `strings.Builder` approach is more efficient when concatenating many strings.

## 6. String comparison

Strings can be compared using comparison operators:

```go
s1 := "apple"
s2 := "banana"

fmt.Println(s1 == s2)  // false
fmt.Println(s1 < s2)   // true (lexicographic order)
fmt.Println(s1 > s2)   // false
```

## 7. Common string operations

### Checking if a string contains a substring

```go
import "strings"

s := "Hello, World"
fmt.Println(strings.Contains(s, "World"))  // true
fmt.Println(strings.Contains(s, "Go"))     // false
```

### Finding the index of a substring

```go
index := strings.Index(s, "World")
fmt.Println(index) // 7
```

### Converting case

```go
s := "Hello, World"
fmt.Println(strings.ToLower(s))   // hello, world
fmt.Println(strings.ToUpper(s))   // HELLO, WORLD
```

### Trimming whitespace

```go
s := "  Hello, World  "
fmt.Println(strings.TrimSpace(s)) // Hello, World
```

### Splitting a string

```go
s := "apple,banana,cherry"
parts := strings.Split(s, ",")
fmt.Println(parts) // [apple banana cherry]
```

### Joining strings

```go
parts := []string{"apple", "banana", "cherry"}
result := strings.Join(parts, ",")
fmt.Println(result) // apple,banana,cherry
```

### Replacing substrings

```go
s := "Hello, World"
result := strings.ReplaceAll(s, "World", "Go")
fmt.Println(result) // Hello, Go
```

### Counting occurrences

```go
s := "banana"
count := strings.Count(s, "a")
fmt.Println(count) // 3
```

## 8. String formatting

### Using `fmt.Sprintf`

```go
name := "Alice"
age := 30
message := fmt.Sprintf("Name: %s, Age: %d", name, age)
fmt.Println(message) // Name: Alice, Age: 30
```

## 9. String immutability

Strings are immutable in Go:

```go
s := "hello"
// s[0] = 'H' // This causes a compile error
```

To modify a string, create a new string:

```go
s := "hello"
s = "H" + s[1:]
fmt.Println(s) // Hello
```

Or convert to a slice of runes, modify, and convert back:

```go
s := "hello"
runes := []rune(s)
runes[0] = 'H'
s = string(runes)
fmt.Println(s) // Hello
```

## 10. Parsing strings

### Parsing integers

```go
import "strconv"

s := "123"
num, err := strconv.Atoi(s)
if err != nil {
    fmt.Println("Error:", err)
} else {
    fmt.Println(num) // 123
}
```

### Parsing floats

```go
s := "3.14"
f, err := strconv.ParseFloat(s, 64)
if err != nil {
    fmt.Println("Error:", err)
} else {
    fmt.Println(f) // 3.14
}
```

### Converting numbers to strings

```go
num := 123
s := strconv.Itoa(num)
fmt.Println(s) // "123"

f := 3.14
s = strconv.FormatFloat(f, 'f', 2, 64)
fmt.Println(s) // "3.14"
```

## 11. Summary

Strings in Go are immutable sequences of UTF-8 encoded bytes. Key points:

- Strings are immutable
- Use double quotes for interpreted literals, backticks for raw literals
- `len()` returns byte count, not character count
- Use `range` to iterate over characters (runes)
- Convert between strings, bytes, and runes as needed
- Use the `strings` package for common operations
- Use `strings.Builder` for efficient concatenation

The `strings` package provides many utility functions for working with text effectively.
