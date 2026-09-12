---
title: "Methods and Functions"
description: "Understanding the difference between standalone functions and methods attached to types in Go."
pubDate: 2026-09-12
series: "methods-and-interfaces"
order: 1
---

## Functions vs. Methods

In Go, both functions and methods exist, but they serve different purposes when organizing your code. If you're coming from an Object-Oriented background (like Java or Python), you're used to classes. Go doesn't have classes, but it does allow you to attach behavior to data using **methods**.

### Standalone Functions

A standard function takes inputs, does something, and returns an output. It isn't explicitly tied to any specific struct or type.

```go
package main

import "fmt"

type User struct {
    Name  string
    Email string
}

// A standalone function
func Greet(u User) string {
    return "Hello, " + u.Name
}

func main() {
    user := User{Name: "Alice", Email: "alice@example.com"}
    fmt.Println(Greet(user))
}
```

This is fine, but as your codebase grows, having `GreetUser(u)`, `UpdateUserEmail(u, email)`, and `DeleteUser(u)` floating around globally can get messy.

### Enter Methods

A **method** is just a function with a special "receiver" argument. It binds the function to a specific type, allowing you to call the method using dot notation (`user.Greet()`).

```go
package main

import "fmt"

type User struct {
    Name  string
    Email string
}

// A method attached to the User type
// The (u User) part is called the "receiver"
func (u User) Greet() string {
    return "Hello, " + u.Name
}

func main() {
    user := User{Name: "Alice", Email: "alice@example.com"}
    // Called using dot notation
    fmt.Println(user.Greet())
}
```

### Why Use Methods?

1. **Organization:** Methods group behavior with the data it operates on. `user.Greet()` feels more natural than `Greet(user)` when `Greet` is strictly a user-related action.
2. **Namespace:** You can have a `Greet()` method on a `User` struct and a completely different `Greet()` method on an `Admin` struct without name collisions. Standalone functions would require you to name them `GreetUser()` and `GreetAdmin()`.
3. **Interfaces:** As we'll see later, Go interfaces are satisfied implicitly by implementing specific *methods*, not functions.

### The Mental Model

Think of methods as syntactic sugar over functions. Under the hood, a method is just a function where the receiver is passed as the first implicit argument. Keep your notes simple: **Functions do things. Methods are things that types can do.**
