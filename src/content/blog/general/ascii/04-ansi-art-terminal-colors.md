---
title: "ANSI Art and Terminal Colors"
description: "Bring color and styling to ASCII art using ANSI escape codes and terminal colors"
pubDate: 2026-08-30
tags: ["ansi-art", "terminal-colors", "escape-codes"]
---

## What is ANSI Art?

ANSI art extends ASCII art by adding color, text styling, and cursor positioning using ANSI escape sequences. This allows you to create vibrant, colorful text-based graphics that were popular during the BBS era and remain relevant today.

## ANSI Escape Sequences Basics

An ANSI escape sequence starts with the ESC character (ASCII 27) followed by a bracket `[` and command codes.

### Basic Format

```
\x1b[<code>m
```

Where:

- `\x1b` is the ESC character (hexadecimal 1b = decimal 27)
- `[` is the opening bracket
- `<code>` is the command
- `m` ends the sequence

## Text Styling

### Common Styling Codes

| Code | Effect                               |
| ---- | ------------------------------------ |
| 0    | Reset/Normal                         |
| 1    | Bold                                 |
| 2    | Dim                                  |
| 3    | Italic                               |
| 4    | Underline                            |
| 7    | Reverse (swap foreground/background) |
| 9    | Strikethrough                        |

## Foreground Colors

Standard terminal colors (30-37 for normal, 90-97 for bright):

| Code  | Color                  |
| ----- | ---------------------- |
| 30/90 | Black/Gray             |
| 31/91 | Red/Bright Red         |
| 32/92 | Green/Bright Green     |
| 33/93 | Yellow/Bright Yellow   |
| 34/94 | Blue/Bright Blue       |
| 35/95 | Magenta/Bright Magenta |
| 36/96 | Cyan/Bright Cyan       |
| 37/97 | White/Bright White     |

## Background Colors

Background colors use codes 40-47 (normal) and 100-107 (bright).

## Practical Examples

### Colored Text in Python

```python
# Python example
class Colors:
    RESET = '\033[0m'
    RED = '\033[31m'
    GREEN = '\033[32m'
    BLUE = '\033[34m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

print(f"{Colors.BOLD}{Colors.GREEN}Success!{Colors.RESET}")
print(f"{Colors.RED}Error message{Colors.RESET}")
print(f"{Colors.UNDERLINE}Underlined text{Colors.RESET}")
```

### Colored Art in Bash

```bash
#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${RED}█████${NC} ${GREEN}█████${NC} ${BLUE}█████${NC}"
```

### Go Example

```go
package main

import "fmt"

func main() {
    const (
        RED = "\033[31m"
        GREEN = "\033[32m"
        RESET = "\033[0m"
    )

    fmt.Println(RED + "Red text" + RESET)
    fmt.Println(GREEN + "Green text" + RESET)
}
```

## Advanced Techniques

### 256-Color Mode

For more colors, use:

```
\033[38;5;<color>m  # Foreground
\033[48;5;<color>m  # Background
```

Where color is 0-255.

### True Color (24-bit)

Modern terminals support RGB:

```
\033[38;2;<r>;<g>;<b>m  # Foreground RGB
\033[48;2;<r>;<g>;<b>m  # Background RGB
```

## Compatibility Notes

- ANSI escape codes work in most Unix/Linux terminals
- Windows PowerShell 7+ and Windows Terminal support them
- Older systems and some applications may not render them correctly
- Always test your output across different terminals

## Tools

- **Rich** (Python): Makes it easy to create colorful terminal output
- **Chalk** (JavaScript): Add colors to console output
- **Coloring** (Go): Color output library
- **Term** (Rust): Terminal manipulation

## Conclusion

ANSI escape codes let you add professional styling and colors to terminal applications. Understanding them opens up possibilities for beautiful CLI tools and visual effects.
