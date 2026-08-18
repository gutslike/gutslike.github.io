---
title: "Structs in Go"
description: "A comprehensive guide to structs in Go, including field access, struct tags, JSON marshaling, and embedding for composition."
pubDate: "Aug 12 2026"
heroImage: "../../../../assets/blog-placeholder-1.jpg"
---

Structs are composite data types that group variables of different types together. A struct is Go's way of implementing objects and records.

Structs are fundamental to writing organized, maintainable Go code.

## 1. Struct declaration

### Basic struct definition

```go
type Person struct {
    Name string
    Age  int
    Email string
}
```

### Creating struct instances

```go
// Using positional arguments (must match field order)
p1 := Person{"Alice", 30, "alice@example.com"}

// Using named fields (recommended)
p2 := Person{
    Name:  "Bob",
    Age:   25,
    Email: "bob@example.com",
}

// Partial initialization
p3 := Person{Name: "Charlie"}
// Age and Email are zero values
```

### Accessing fields

```go
p := Person{Name: "Alice", Age: 30}
fmt.Println(p.Name) // Alice
fmt.Println(p.Age)  // 30

p.Age = 31
fmt.Println(p.Age)  // 31
```

## 2. Struct pointers

When you pass a struct to a function, it is copied by value. To modify the original, use a pointer:

```go
func updateAge(p *Person, newAge int) {
    p.Age = newAge
}

person := Person{Name: "Alice", Age: 30}
updateAge(&person, 31)
fmt.Println(person.Age) // 31
```

### Accessing fields through pointers

Go automatically dereferences pointers to structs, so you can use dot notation directly:

```go
p := &Person{Name: "Alice", Age: 30}
fmt.Println(p.Name)  // Alice (not p.(*Person).Name)
p.Age = 31
```

## 3. Struct tags

Struct tags are metadata attached to struct fields. They are strings that provide additional information about the field.

### JSON tags

The most common use of struct tags is for JSON marshaling and unmarshaling:

```go
type Person struct {
    Name  string `json:"name"`
    Age   int    `json:"age"`
    Email string `json:"email"`
}
```

### JSON marshaling

```go
import "encoding/json"

p := Person{Name: "Alice", Age: 30, Email: "alice@example.com"}

// Convert struct to JSON
jsonData, err := json.Marshal(p)
if err != nil {
    fmt.Println("Error:", err)
}
fmt.Println(string(jsonData))
// Output: {"name":"Alice","age":30,"email":"alice@example.com"}
```

### JSON unmarshaling

```go
jsonData := []byte(`{"name":"Bob","age":25,"email":"bob@example.com"}`)

var p Person
err := json.Unmarshal(jsonData, &p)
if err != nil {
    fmt.Println("Error:", err)
}
fmt.Println(p) // {Bob 25 bob@example.com}
```

### JSON tag options

```go
type Person struct {
    Name  string `json:"name"`
    Age   int    `json:"age"`
    Email string `json:"email,omitempty"`      // Omit if empty
    ID    int    `json:"-"`                     // Ignore this field
}
```

The `omitempty` option prevents empty fields from appearing in the JSON output.

The `-` option ignores the field entirely.

### Pretty-printing JSON

```go
jsonData, _ := json.MarshalIndent(p, "", "  ")
fmt.Println(string(jsonData))
```

### Other common tags

```go
type Product struct {
    ID    int    `db:"product_id" json:"id"`
    Name  string `db:"name" json:"name" validate:"required"`
    Price float64 `db:"price" json:"price" validate:"min=0"`
}
```

Different packages use tags for different purposes: `db` for database mapping, `validate` for validation.

## 4. Embedding structs

Embedding allows one struct to include another struct's fields without explicitly naming them. This is Go's way of achieving composition.

### Basic embedding

```go
type Address struct {
    Street string
    City   string
    Country string
}

type Person struct {
    Name string
    Age  int
    Address // Embedded struct
}
```

### Accessing embedded fields

```go
p := Person{
    Name: "Alice",
    Age:  30,
    Address: Address{
        Street:  "123 Main St",
        City:    "New York",
        Country: "USA",
    },
}

// Access embedded fields directly
fmt.Println(p.City)      // New York
fmt.Println(p.Country)   // USA

// Or through the embedded type
fmt.Println(p.Address.City) // New York
```

### Embedding with shadowing

If a field name exists in both the outer and embedded struct, the outer struct's field takes precedence:

```go
type Base struct {
    Name string
}

type Extended struct {
    Name string // Shadows Base.Name
    Base       // Embedded
}

e := Extended{Name: "Outer", Base: Base{Name: "Inner"}}
fmt.Println(e.Name)      // Outer
fmt.Println(e.Base.Name) // Inner
```

## 5. Methods on structs

You can define methods on struct types:

```go
func (p Person) Greet() string {
    return "Hello, my name is " + p.Name
}

p := Person{Name: "Alice", Age: 30}
fmt.Println(p.Greet()) // Hello, my name is Alice
```

### Receiver types

Use a value receiver for methods that do not modify the struct:

```go
func (p Person) Description() string {
    return fmt.Sprintf("%s is %d years old", p.Name, p.Age)
}
```

Use a pointer receiver for methods that do modify the struct:

```go
func (p *Person) Birthday() {
    p.Age++
}

p := &Person{Name: "Alice", Age: 30}
p.Birthday()
fmt.Println(p.Age) // 31
```

## 6. Empty structs

An empty struct has no fields:

```go
type Marker struct{}

m := Marker{}
```

Empty structs are useful as placeholders or to indicate the absence of data while maintaining type safety.

They use no memory:

```go
fmt.Println(unsafe.Sizeof(Marker{})) // 0
```

## 7. Comparing structs

Structs can be compared if all their fields are comparable:

```go
p1 := Person{Name: "Alice", Age: 30}
p2 := Person{Name: "Alice", Age: 30}
p3 := Person{Name: "Bob", Age: 25}

fmt.Println(p1 == p2) // true
fmt.Println(p1 == p3) // false
```

## 8. Anonymous structs

You can create structs without defining a named type:

```go
person := struct {
    Name string
    Age  int
}{
    Name: "Alice",
    Age:  30,
}

fmt.Println(person.Name) // Alice
```

Anonymous structs are useful for small, one-off data structures.

## 9. Struct field visibility

Fields that start with an uppercase letter are exported (visible outside the package). Fields that start with a lowercase letter are unexported (private):

```go
type Product struct {
    Name  string // Exported
    price float64 // Unexported
}

p := Product{Name: "Widget", price: 9.99}
// In another package: p.price is not accessible
```

## 10. Common patterns

### Configuration structs

```go
type Config struct {
    Host     string
    Port     int
    Database string
    Timeout  int
}
```

### Options pattern

```go
type ServerOptions struct {
    Port    int
    Timeout int
    MaxConn int
}

func NewServer(opts ServerOptions) *Server {
    // Use opts to configure server
}
```

### Struct initialization helper

```go
func NewPerson(name string, age int) *Person {
    return &Person{
        Name: name,
        Age:  age,
    }
}
```

## 11. Summary

Structs are composite types that group related data together. Key points:

- Define structs with named fields
- Use struct tags for metadata (JSON, database mapping, validation)
- Embed structs to compose types and reuse fields
- Define methods on struct types
- Use pointers for methods that modify the struct
- Compare structs if all fields are comparable
- Fields starting with uppercase are exported

Structs are essential for organizing code and modeling real-world data in Go.
