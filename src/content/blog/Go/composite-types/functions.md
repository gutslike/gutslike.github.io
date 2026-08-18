---
title: "Functions in Go"
description: "A comprehensive guide to functions in Go, including basics, variadic functions, multiple returns, anonymous functions, closures, and call by value semantics."
pubDate: "Aug 15 2026"
heroImage: "../../../../assets/blog-placeholder-1.jpg"
---

Functions are reusable blocks of code that perform a specific task. Functions are central to writing organized, maintainable Go code.

Go has powerful function features including multiple return values, variadic parameters, closures, and first-class functions.

## 1. Function basics

### Function declaration

```go
func greet(name string) {
    fmt.Println("Hello,", name)
}

greet("Alice") // Hello, Alice
```

A function has:

- **Name**: `greet`
- **Parameters**: `name string`
- **Body**: The code inside braces

### Functions with return values

```go
func add(a, b int) int {
    return a + b
}

result := add(3, 5)
fmt.Println(result) // 8
```

### Multiple parameters with the same type

```go
func add(a, b int) int {
    return a + b
}

func multiply(x, y, z float64) float64 {
    return x * y * z
}
```

## 2. Multiple return values

Go functions can return multiple values:

```go
func divide(a, b float64) (float64, error) {
    if b == 0 {
        return 0, errors.New("division by zero")
    }
    return a / b, nil
}

result, err := divide(10, 2)
if err != nil {
    fmt.Println("Error:", err)
} else {
    fmt.Println("Result:", result) // Result: 5
}
```

### Ignoring return values

```go
result, _ := divide(10, 2) // Ignore the error

_, err := divide(10, 0) // Ignore the result
if err != nil {
    fmt.Println("Error:", err)
}
```

## 3. Named return values

Return values can be named, acting as variables initialized to their zero values:

```go
func divide(a, b float64) (result float64, err error) {
    if b == 0 {
        err = errors.New("division by zero")
        return
    }
    result = a / b
    return
}
```

Named returns make the function signature more self-documenting.

The bare `return` statement returns all named return values.

## 4. Variadic functions

Variadic functions accept a variable number of arguments:

```go
func sum(numbers ...int) int {
    total := 0
    for _, num := range numbers {
        total += num
    }
    return total
}

fmt.Println(sum(1, 2, 3))       // 6
fmt.Println(sum(1, 2, 3, 4, 5)) // 15
```

The `...` operator indicates that the function accepts any number of arguments of that type.

Inside the function, `numbers` is a slice.

### Passing a slice as variadic arguments

```go
nums := []int{1, 2, 3, 4, 5}
total := sum(nums...) // Spread operator
fmt.Println(total)    // 15
```

### Variadic with other parameters

```go
func greetMany(greeting string, names ...string) {
    for _, name := range names {
        fmt.Println(greeting + ", " + name)
    }
}

greetMany("Hello", "Alice", "Bob", "Charlie")
```

Variadic parameters must be the last parameter.

## 5. Anonymous functions

Anonymous functions are functions without a name:

```go
func() {
    fmt.Println("Anonymous function")
}() // Note: () at the end calls the function
```

### Anonymous functions with parameters and returns

```go
f := func(x, y int) int {
    return x + y
}

result := f(3, 5)
fmt.Println(result) // 8
```

### Assigning to a variable

```go
square := func(x int) int {
    return x * x
}

fmt.Println(square(5)) // 25
```

### Passing functions as arguments

```go
func process(f func(int) int, value int) int {
    return f(value)
}

result := process(func(x int) int {
    return x * 2
}, 5)
fmt.Println(result) // 10
```

## 6. Closures

A closure is a function that references variables from its enclosing scope:

```go
func makeCounter() func() int {
    count := 0
    return func() int {
        count++
        return count
    }
}

counter := makeCounter()
fmt.Println(counter()) // 1
fmt.Println(counter()) // 2
fmt.Println(counter()) // 3
```

The returned function "closes over" the `count` variable, maintaining its state between calls.

### Closure with parameters

```go
func makeAdder(x int) func(int) int {
    return func(y int) int {
        return x + y
    }
}

add5 := makeAdder(5)
fmt.Println(add5(3))  // 8
fmt.Println(add5(10)) // 15
```

### Multiple closures share the same variable

```go
var funcs []func()
for i := 1; i <= 3; i++ {
    funcs = append(funcs, func() {
        fmt.Println(i)
    })
}

for _, f := range funcs {
    f()
}
// Output: 3 3 3 (all print 3, not 1 2 3)
```

To fix this, capture the value in each iteration:

```go
for i := 1; i <= 3; i++ {
    i := i // Capture current value
    funcs = append(funcs, func() {
        fmt.Println(i)
    })
}

for _, f := range funcs {
    f()
}
// Output: 1 2 3
```

## 7. Call by value

Go passes arguments by value, meaning the function receives a copy of the argument:

```go
func increment(x int) {
    x++
}

num := 5
increment(num)
fmt.Println(num) // 5 (unchanged)
```

The original `num` is not modified because `x` is a copy.

### Modifying with pointers

To modify the original, pass a pointer:

```go
func increment(x *int) {
    *x++
}

num := 5
increment(&num)
fmt.Println(num) // 6 (modified)
```

### Slices are reference types

Slices are reference types, so modifications to slice elements affect the original:

```go
func modifySlice(nums []int) {
    nums[0] = 100
}

nums := []int{1, 2, 3}
modifySlice(nums)
fmt.Println(nums[0]) // 100 (modified)
```

But reassigning the slice variable does not affect the original:

```go
func replaceSlice(nums []int) {
    nums = []int{10, 20, 30}
}

nums := []int{1, 2, 3}
replaceSlice(nums)
fmt.Println(nums) // [1 2 3] (unchanged)
```

## 8. Defer statement

The `defer` statement schedules a function call to run when the surrounding function returns:

```go
func printHello() {
    defer fmt.Println("World")
    fmt.Println("Hello")
}

printHello()
// Output:
// Hello
// World
```

### Multiple defers

Multiple defers run in reverse order (LIFO):

```go
fmt.Println("Start")
defer fmt.Println("1")
defer fmt.Println("2")
defer fmt.Println("3")
fmt.Println("End")

// Output:
// Start
// End
// 3
// 2
// 1
```

### Defer for cleanup

Defer is commonly used for cleanup:

```go
func readFile(filename string) {
    file, err := os.Open(filename)
    if err != nil {
        panic(err)
    }
    defer file.Close() // Ensure file is closed

    // Read from file
}
```

## 9. Practical examples

### Function type for callbacks

```go
type Handler func(error)

func doSomething(callback Handler) {
    err := someOperation()
    callback(err)
}

doSomething(func(err error) {
    if err != nil {
        fmt.Println("Error:", err)
    }
})
```

### Factory function

```go
func newCounter(start int) func() int {
    return func() int {
        start++
        return start
    }
}

c := newCounter(0)
fmt.Println(c()) // 1
fmt.Println(c()) // 2
```

## 10. Summary

Functions in Go are powerful and flexible. Key points:

- Functions can return multiple values
- Named returns act as variables
- Variadic functions accept variable arguments
- Anonymous functions and closures enable functional programming
- Go passes arguments by value (pointers for modification)
- `defer` schedules cleanup operations
- Functions are first-class citizens (can be passed as arguments)

Functions are essential for writing modular, testable code.
