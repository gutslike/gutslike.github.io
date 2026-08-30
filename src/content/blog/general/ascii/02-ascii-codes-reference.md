---
title: "ASCII Codes Reference and Practical Usage"
description: "A practical guide to using ASCII codes in programming, with examples and common patterns"
pubDate: 2026-08-30
tags: ["ascii", "reference", "programming"]
---

## Common ASCII Code Ranges

### Printable Characters

- **Space**: 32 (' ')
- **Digits**: 48-57 ('0'-'9')
- **Uppercase**: 65-90 ('A'-'Z')
- **Lowercase**: 97-122 ('a'-'z')

### Useful Control Characters

- **9**: Tab (\\t)
- **10**: Line Feed (\\n)
- **13**: Carriage Return (\\r)
- **27**: Escape (ESC)
- **127**: Delete (DEL)

## Practical Applications

### Checking Character Types

```python
def is_digit(char):
    code = ord(char)
    return 48 <= code <= 57

def is_uppercase(char):
    code = ord(char)
    return 65 <= code <= 90

def is_lowercase(char):
    code = ord(char)
    return 97 <= code <= 122
```

### String Manipulation

```go
// Go example
package main

import "fmt"

func main() {
    char := 'A'
    fmt.Println(int(char))  // Output: 65

    // Case conversion using ASCII
    char = 'a'
    uppercase := char - 32  // 97 - 32 = 65 ('A')
    fmt.Println(string(uppercase))
}
```

### Working with Hex Dumps

Understanding ASCII helps when reading hex dumps:

```
48 65 6c 6c 6f 20 57 6f 72 6c 64
H  e  l  l  o     W  o  r  l  d
```

## Best Practices

- Always validate input before converting ASCII values
- Be aware of extended ASCII (128-255) limitations
- Use libraries for encoding/decoding when available
- Remember that ASCII is only for basic Latin characters

## Next Steps

Once comfortable with ASCII values, explore Unicode for international character support and extended character sets.
