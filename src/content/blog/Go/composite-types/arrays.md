---
title: "Arrays in Go"
description: "A comprehensive guide to arrays in Go, including declaration, initialization, iteration, and practical examples."
pubDate: "Aug 8 2026"
heroImage: "../../../../assets/blog-placeholder-1.jpg"
---

Arrays are a fundamental data structure in Go. An array is a fixed-size collection of elements of the same type.

Unlike slices (which we'll cover next), arrays have a fixed length that is determined when they are created and cannot change.

## 1. Array declaration and initialization

### Basic declaration

To declare an array, specify the type and the number of elements:

```go
var nums [5]int
```

This declares an array of 5 integers. All elements are initialized to their zero values (0 for integers).

### Initialization with values

You can initialize an array with values using an array literal:

```go
nums := [5]int{1, 2, 3, 4, 5}
```

You can also omit some values and they will be initialized to their zero values:

```go
nums := [5]int{1, 2, 3} // [1 2 3 0 0]
```

### Using the ellipsis

If you want the compiler to infer the array length from the number of elements, use `...`:

```go
nums := [...]int{1, 2, 3, 4, 5}
// Compiler infers the length as 5
```

### Named indexes

You can initialize specific indexes:

```go
nums := [5]int{0: 10, 2: 30, 4: 50}
// [10 0 30 0 50]
```

## 2. Accessing array elements

Use index notation to access elements (zero-based indexing):

```go
nums := [5]int{10, 20, 30, 40, 50}

fmt.Println(nums[0])  // 10
fmt.Println(nums[2])  // 30

nums[1] = 25
fmt.Println(nums[1])  // 25
```

### Out of bounds errors

Accessing an index outside the array bounds causes a panic:

```go
nums := [3]int{1, 2, 3}
fmt.Println(nums[5]) // Panic: index out of range
```

## 3. Array length

Use `len()` to get the length of an array:

```go
nums := [5]int{1, 2, 3, 4, 5}
fmt.Println(len(nums)) // 5
```

The length is always known and fixed at compile time.

## 4. Iterating over arrays

### Using a for loop with index

```go
nums := [5]int{10, 20, 30, 40, 50}

for i := 0; i < len(nums); i++ {
    fmt.Println(nums[i])
}
```

### Using range

The `range` keyword iterates over elements and returns the index and value:

```go
nums := [5]int{10, 20, 30, 40, 50}

for i, val := range nums {
    fmt.Printf("Index: %d, Value: %d\n", i, val)
}
```

If you only need the value, use `_` to ignore the index:

```go
for _, val := range nums {
    fmt.Println(val)
}
```

## 5. Arrays are value types

An important characteristic of arrays in Go is that they are **value types**, not reference types.

When you assign an array to a variable or pass it to a function, the entire array is copied:

```go
a := [3]int{1, 2, 3}
b := a
b[0] = 100

fmt.Println(a[0]) // 1 (unchanged)
fmt.Println(b[0]) // 100
```

This is different from slices, which are reference types.

### Arrays in function parameters

When you pass an array to a function, the array is copied:

```go
func modify(arr [3]int) {
    arr[0] = 100
}

nums := [3]int{1, 2, 3}
modify(nums)
fmt.Println(nums[0]) // 1 (unchanged)
```

To avoid copying, pass a pointer to the array:

```go
func modify(arr *[3]int) {
    arr[0] = 100
}

nums := [3]int{1, 2, 3}
modify(&nums)
fmt.Println(nums[0]) // 100
```

## 6. Multi-dimensional arrays

Arrays can contain elements that are themselves arrays:

```go
matrix := [2][3]int{
    {1, 2, 3},
    {4, 5, 6},
}

fmt.Println(matrix[0][1]) // 2
fmt.Println(matrix[1][2]) // 6
```

Iterating over a 2D array:

```go
for i := 0; i < len(matrix); i++ {
    for j := 0; j < len(matrix[i]); j++ {
        fmt.Printf("%d ", matrix[i][j])
    }
    fmt.Println()
}
```

## 7. Comparing arrays

Two arrays of the same type can be compared using `==`:

```go
a := [3]int{1, 2, 3}
b := [3]int{1, 2, 3}
c := [3]int{1, 2, 4}

fmt.Println(a == b) // true
fmt.Println(a == c) // false
```

## 8. Common patterns

### Finding the size of an array

```go
arr := [...]string{"a", "b", "c", "d"}
fmt.Println(len(arr)) // 4
```

### Checking if an element exists (linear search)

```go
arr := [5]int{10, 20, 30, 40, 50}
target := 30

found := false
for _, val := range arr {
    if val == target {
        found = true
        break
    }
}
fmt.Println(found) // true
```

## 9. When to use arrays

Use arrays when:

- You know the size at compile time
- The size should not change
- You need fixed memory allocation

For flexible, dynamic collections, use **slices** instead (covered in the next post).

## 10. Summary

Arrays in Go are fixed-size collections of elements of the same type. Key points:

- Arrays have a fixed length determined at creation
- Arrays are value types, so they are copied when assigned or passed to functions
- Use `len()` to get the array length
- Use indexing and `range` to iterate
- Multi-dimensional arrays are supported
- For dynamic collections, use slices instead

Arrays provide efficient, type-safe storage for collections of fixed size.
