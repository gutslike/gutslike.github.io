---
title: "Slices in Go"
description: "A comprehensive guide to slices in Go, covering declaration, capacity, growth, make(), and conversions between slices and arrays."
pubDate: "Aug 9 2026"
heroImage: "../../../../assets/blog-placeholder-1.jpg"
---

Slices are one of the most important data structures in Go. A slice is a dynamic view into an array, providing a flexible, powerful way to work with sequences of elements.

Unlike arrays, slices have no fixed length and can grow dynamically.

## 1. Understanding slices

A slice is a reference to a contiguous segment of an underlying array. A slice has three components:

- **pointer**: points to the first element of the underlying array
- **length**: the number of elements in the slice
- **capacity**: the total number of elements in the underlying array starting from the pointer

## 2. Declaring and initializing slices

### Basic declaration

To declare a slice, omit the size in the brackets:

```go
var nums []int
```

This creates a slice with `nil` value. It has zero length and zero capacity.

### Initialization with values

Use a slice literal:

```go
nums := []int{1, 2, 3, 4, 5}
```

The compiler infers that this is a slice (not an array) because you did not specify a size.

### Empty slice

An empty slice is different from a `nil` slice:

```go
nums := []int{}      // empty slice
var nums2 []int      // nil slice
```

Both have length 0, but a nil slice has no underlying array.

## 3. The `make()` function

The `make()` function creates a slice with a specified length and optionally a capacity.

### Creating a slice with length

```go
nums := make([]int, 5)
fmt.Println(len(nums))      // 5
fmt.Println(cap(nums))      // 5
fmt.Println(nums)           // [0 0 0 0 0]
```

All elements are initialized to their zero values.

### Creating a slice with length and capacity

```go
nums := make([]int, 3, 10)
fmt.Println(len(nums))      // 3
fmt.Println(cap(nums))      // 10
fmt.Println(nums)           // [0 0 0]
```

This creates a slice with length 3 but capacity 10. You can grow into the extra capacity.

## 4. Length and capacity

### `len()` returns the length

```go
nums := []int{10, 20, 30, 40, 50}
fmt.Println(len(nums)) // 5
```

### `cap()` returns the capacity

```go
nums := []int{10, 20, 30, 40, 50}
fmt.Println(cap(nums)) // 5
```

### Slicing a slice

When you create a slice from another slice, the capacity changes:

```go
nums := []int{10, 20, 30, 40, 50}
sub := nums[1:4]

fmt.Println(sub)           // [20 30 40]
fmt.Println(len(sub))      // 3
fmt.Println(cap(sub))      // 4 (points to index 1, can hold up to index 5)
```

The capacity is the distance from the starting index to the end of the underlying array.

## 5. Slice growth and the `append()` function

Slices grow dynamically using the `append()` function:

```go
nums := []int{1, 2, 3}
nums = append(nums, 4, 5)
fmt.Println(nums) // [1 2 3 4 5]
```

### How growth works

When you append to a slice and there is not enough capacity, Go allocates a new underlying array with a larger capacity and copies the elements.

The growth strategy typically doubles the capacity:

```go
nums := make([]int, 0, 1)
fmt.Println(cap(nums)) // 1

nums = append(nums, 1)
fmt.Println(cap(nums)) // 1

nums = append(nums, 2)
fmt.Println(cap(nums)) // 2 (doubled)

nums = append(nums, 3)
fmt.Println(cap(nums)) // 4 (doubled)

nums = append(nums, 4, 5)
fmt.Println(cap(nums)) // 8 (doubled)
```

When capacity must grow, Go allocates roughly double the previous capacity (the exact factor may vary).

### `append()` is not in-place

Always assign the result of `append()` back:

```go
nums := []int{1, 2, 3}
append(nums, 4)
fmt.Println(nums) // [1 2 3] (unchanged!)

nums = append(nums, 4)
fmt.Println(nums) // [1 2 3 4] (now it works)
```

## 6. Slice-to-array conversion

You cannot directly convert a slice to an array, but you can convert a slice to an array if you know the array size:

```go
slice := []int{1, 2, 3}
// arr := [3]int(slice) // This doesn't work

// Instead, copy elements
arr := [3]int{slice[0], slice[1], slice[2]}
fmt.Println(arr) // [1 2 3]
```

Or use `copy()`:

```go
slice := []int{1, 2, 3}
arr := [3]int{}
copy(arr[:], slice)
fmt.Println(arr) // [1 2 3]
```

## 7. Array-to-slice conversion

Converting an array to a slice is straightforward using slice notation:

```go
arr := [5]int{10, 20, 30, 40, 50}
slice := arr[:]

fmt.Println(slice) // [10 20 30 40 50]
fmt.Println(len(slice))   // 5
fmt.Println(cap(slice))   // 5
```

The resulting slice points to the original array. Modifications to the slice affect the array:

```go
arr := [5]int{10, 20, 30, 40, 50}
slice := arr[:]
slice[0] = 100

fmt.Println(arr[0]) // 100 (array changed)
```

## 8. Slicing operations

### Full slice

```go
nums := []int{1, 2, 3, 4, 5}
sub := nums[:]  // [1 2 3 4 5]
```

### From index to end

```go
sub := nums[2:]  // [3 4 5]
```

### From start to index

```go
sub := nums[:3]  // [1 2 3]
```

### From index to index

```go
sub := nums[1:4]  // [2 3 4]
```

### Step parameter (not available)

Note: Go does not support a step parameter in slices like Python does.

## 9. Copying slices

The `copy()` function copies elements from one slice to another:

```go
src := []int{1, 2, 3, 4, 5}
dst := make([]int, 3)

n := copy(dst, src)
fmt.Println(dst) // [1 2 3]
fmt.Println(n)   // 3 (number of elements copied)
```

`copy()` returns the number of elements copied.

## 10. Slices are reference types

Slices are reference types, meaning they point to an underlying array. If you assign a slice to another variable, both point to the same array:

```go
nums := []int{1, 2, 3}
copy := nums
copy[0] = 100

fmt.Println(nums[0]) // 100 (original affected)
```

To truly copy a slice, use the `copy()` function.

## 11. Iterating over slices

### Using index

```go
nums := []int{10, 20, 30}
for i := 0; i < len(nums); i++ {
    fmt.Println(nums[i])
}
```

### Using range

```go
for i, val := range nums {
    fmt.Printf("Index: %d, Value: %d\n", i, val)
}
```

### Using range without index

```go
for _, val := range nums {
    fmt.Println(val)
}
```

## 12. Removing elements from a slice

Go does not have a built-in function to remove elements, but you can use slicing:

```go
nums := []int{1, 2, 3, 4, 5}
index := 2 // Remove element at index 2

nums = append(nums[:index], nums[index+1:]...)
fmt.Println(nums) // [1 2 4 5]
```

## 13. Summary

Slices are dynamic collections that grow as needed. Key points:

- Slices have length and capacity
- Use `make()` to create slices with specific length and capacity
- Use `append()` to add elements and grow slices
- Slices are reference types pointing to an underlying array
- Use slice notation to create subslices
- Convert between arrays and slices using slice notation
- Use `copy()` to copy slice contents

Slices are the most common way to work with collections in Go.
