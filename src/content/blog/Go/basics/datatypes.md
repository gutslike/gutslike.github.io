---
title: "Data Types in Go"
description: "A concise guide to integers, floating-point numbers, complex numbers, booleans, runes, strings, and type conversions in Go."
pubDate: "Aug 09 2026"
heroImage: "../../../../assets/blog-placeholder-1.jpg"
---

Go is a statically typed language, which means every variable has a type and that type is checked at compile time. Understanding Go's built-in data types is essential because they control how values are stored, compared, and converted.

In this guide, we will look at the most common data types in Go:

- integers
- floating-point numbers
- complex numbers
- booleans
- runes
- strings
- type conversions

## 1. Integer types

Integers are used to store whole numbers, such as 10, -5, or 2048.

Go provides both signed and unsigned integer types.

### Signed integers

Signed integers can hold both positive and negative values.

```go
var a int = -10
var b int8 = -50
var c int16 = -2000
var d int32 = -30000
var e int64 = -9000000000
```

The most commonly used signed integer type is `int`, because it matches the native size of the machine architecture:

- on 32-bit systems, `int` is usually 32-bit
- on 64-bit systems, `int` is usually 64-bit

### Unsigned integers

Unsigned integers can hold only non-negative values.

```go
var x uint = 10
var y uint8 = 255
var z uint16 = 5000
var p uint32 = 40000
var q uint64 = 9000000000
```

Unsigned types are useful when you know the value should never be negative, such as lengths, indexes, or counts.

### Important note

The size of integer types matters. A `uint8` can hold values from `0` to `255`, while `int16` can hold values from `-32768` to `32767`.

Using the wrong integer size can cause overflow or unexpected behavior.

```go
var age uint8 = 255
age = age + 1 // overflow can occur
```

In most general-purpose code, `int` is the default choice unless there is a specific reason to use a smaller or larger type.

## 2. Floating-point numbers

Floating-point numbers are used for decimal values.

Go has two floating-point types:

```go
var price float32 = 19.99
var pi float64 = 3.141592653589793
```

### `float32`

- smaller memory footprint
- less precision
- useful when memory matters more than exact decimal accuracy

### `float64`

- more precision
- commonly used as the default floating-point type in Go

```go
var tax float64 = 0.075
fmt.Println(tax * 100) // 7.5
```

Floating-point values are not always exact in binary representation, so some calculations may produce tiny rounding errors.

```go
fmt.Println(0.1 + 0.2) // 0.30000000000000004
```

This is normal in many programming languages and is important to remember when comparing floating-point numbers.

## 3. Complex numbers

Go supports complex numbers, which are numbers with both a real and an imaginary part.

There are two types:

```go
var c1 complex64 = complex(2, 3)
var c2 complex128 = complex(5, 7)
```

Here:

- `2` is the real part
- `3` is the imaginary part

You can access the real and imaginary parts using built-in functions:

```go
fmt.Println(real(c1)) // 2
fmt.Println(imag(c1)) // 3
```

Complex numbers are useful in scientific, engineering, and signal-processing applications, though they are not used as often in everyday application logic.

## 4. Boolean type

The boolean type is `bool`, and it can only hold two values:

- `true`
- `false`

```go
var isReady bool = true
var isLoggedIn bool = false
```

Booleans are commonly used in conditions and loops:

```go
if isReady {
    fmt.Println("Start the process")
}

if age >= 18 {
    fmt.Println("Adult")
} else {
    fmt.Println("Minor")
}
```

Booleans are essential for decision-making in programs and are one of the most important built-in types in Go.

## 5. Runes

A `rune` is Go's type for a single Unicode character.

It is an alias for `int32`.

```go
var ch rune = 'A'
var heart rune = '♥'
```

Runes are especially useful when working with characters from languages beyond English.

```go
fmt.Println('A') // 65
fmt.Println(rune('A')) // 65
```

You can also iterate over a string using `range`, which gives you the index and the rune value:

```go
for i, r := range "Hello, 世界" {
    fmt.Printf("index=%d rune=%c\n", i, r)
}
```

This is important because Go strings are made of bytes, and `range` helps you work with Unicode text correctly.

## 6. Strings

Strings are used to represent text in Go.

```go
var greeting string = "Hello, Go!"
```

### Interpreted string literals

Interpreted strings are enclosed in double quotes and process escape sequences.

```go
var msg string = "Hello\nWorld"
fmt.Println(msg)
```

Output:

```go
Hello
World
```

Escape sequences like `\n`, `\t`, and `\"` are interpreted.

### Raw string literals

Raw strings are enclosed with backticks and do not process escapes.

```go
var raw string = `Hello\nWorld`
fmt.Println(raw)
```

Output:

```go
Hello\nWorld
```

Raw strings are often used for multi-line text, SQL queries, JSON examples, and documentation snippets.

```go
message := `This is a raw string.
It can span multiple lines.`
fmt.Println(message)
```

### String immutability

Strings in Go are immutable. Once created, you cannot change individual characters directly.

```go
s := "hello"
// s[0] = 'H' // This will cause a compile error
```

If you want to modify a string, you usually build a new string or convert it to a slice of bytes or runes.

## 7. Type conversions

Go requires explicit conversion between different types. This is called type conversion.

```go
a := 10
b := float64(a)
```

Here, `a` is an `int`, and we convert it to `float64`.

### Example conversions

```go
var x int = 42
var y float64 = float64(x)

var p float64 = 3.14
var q int = int(p)
```

When converting from float to int, the decimal part is truncated.

```go
fmt.Println(int(3.99)) // 3
```

### Converting between string and numeric types

You can also convert strings to numbers and numbers to strings, though this often requires the `strconv` package.

```go
import "strconv"

num := 123
s := strconv.Itoa(num)

n, _ := strconv.Atoi("456")
```

### Important caution

Type conversion can lose information.

```go
var large float64 = 1e20
var small int = int(large)
```

This may produce a value that is not meaningful, because floating-point numbers can lose precision.

Always convert carefully and only when the conversion is valid for your use case.

## 8. Summary

Go has several built-in data types, and each one has a purpose:

- `int` and `uint` handle whole numbers
- `float32` and `float64` handle decimals
- `complex64` and `complex128` handle complex numbers
- `bool` handles true/false decisions
- `rune` represents a Unicode character
- `string` stores text

Type conversions are explicit in Go, which helps catch mistakes early and makes programs more predictable.

Understanding these types is the foundation of writing correct and efficient Go programs.
