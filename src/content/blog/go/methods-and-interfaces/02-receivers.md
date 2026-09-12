---
title: "Value vs. Pointer Receivers"
description: "How to choose between value and pointer receivers, and how they mutate state in Go."
pubDate: 2026-09-12
series: "methods-and-interfaces"
order: 2
---

## What is a Receiver?

As we saw earlier, a method is just a function with a receiver argument. However, you can pass that receiver in two ways: by **value** or by **pointer**.

Understanding the difference is critical to avoiding unexpected bugs where your struct doesn't seem to update when you tell it to.

---

## Value Receivers

When you use a value receiver, Go passes a **copy** of the original struct into the method. 

```go
type Counter struct {
    Count int
}

// (c Counter) is a VALUE receiver
func (c Counter) Increment() {
    c.Count++ 
    // This only increments the COPY!
}
```

If you call this method, the original struct will remain completely unchanged.

### When to use Value Receivers:
- You do not need to modify the state of the struct.
- The struct is small (like a few ints or strings), making copying cheap.
- You want to ensure immutability (the method is guaranteed not to mutate the original).

---

## Pointer Receivers

When you use a pointer receiver, Go passes the **memory address** of the original struct into the method.

```go
// (c *Counter) is a POINTER receiver
func (c *Counter) Increment() {
    c.Count++
    // This modifies the ORIGINAL struct
}
```

Now, calling `Increment()` actually updates the counter you expect it to.

### When to use Pointer Receivers:
- You **need to modify** the receiver (e.g., updating a counter, changing a status).
- The struct is very large. Passing a pointer is much cheaper than creating a massive copy of the struct every time the method is called.
- Consistency: If *some* methods on the struct need a pointer receiver, you should generally use pointer receivers for *all* methods on that struct to avoid confusion.

---

## The Go Compiler Magic (Automatic Dereferencing)

Go makes dealing with pointers incredibly easy by doing some heavy lifting under the hood. You don't need to manually dereference pointers or get addresses to call methods.

```go
func main() {
    // c is a VALUE (Counter)
    c := Counter{Count: 0}
    
    // Increment() requires a POINTER (*Counter).
    // Does this crash? No! 
    c.Increment() 
    
    // Go automatically translates the above to:
    // (&c).Increment()
}
```

The reverse is also true. If you have a pointer to a struct, you can call a method that takes a value receiver, and Go will automatically dereference the pointer for you.

### Summary Rule of Thumb
If you need to change the data, or the struct is massive: **use a pointer receiver**. Otherwise, a value receiver is usually fine.
