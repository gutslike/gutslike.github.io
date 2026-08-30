---
title: "Terminal Escape Sequences Explained"
description: "Master terminal escape sequences for cursor control, clearing, and advanced terminal manipulation"
pubDate: 2026-08-30
tags: ["terminal", "escape-sequences", "programming"]
---

## What are Terminal Escape Sequences?

Terminal escape sequences are special character sequences that control cursor movement, clear the screen, change text attributes, and perform other terminal operations. They're essential for creating interactive CLI applications.

## Common Escape Sequences

### Cursor Movement

| Sequence            | Effect                           |
| ------------------- | -------------------------------- |
| `\033[H`            | Move cursor to home (0,0)        |
| `\033[<row>;<col>H` | Move cursor to specific position |
| `\033[A`            | Move cursor up one line          |
| `\033[B`            | Move cursor down one line        |
| `\033[C`            | Move cursor right one column     |
| `\033[D`            | Move cursor left one column      |
| `\033[nA`           | Move cursor up n lines           |

### Screen Control

| Sequence  | Effect                           |
| --------- | -------------------------------- |
| `\033[2J` | Clear entire screen              |
| `\033[K`  | Clear from cursor to end of line |
| `\033[2K` | Clear entire line                |
| `\033[s`  | Save cursor position             |
| `\033[u`  | Restore cursor position          |

### Visibility

| Sequence    | Effect      |
| ----------- | ----------- |
| `\033[?25h` | Show cursor |
| `\033[?25l` | Hide cursor |

## Practical Examples

### Clear Screen and Move Cursor

```python
def clear_screen():
    print('\033[2J', end='')
    print('\033[H', end='')

def move_cursor(row, col):
    print(f'\033[{row};{col}H', end='')

clear_screen()
move_cursor(5, 10)
print("Hello at position 5,10")
```

### Hide Cursor During Animation

```bash
#!/bin/bash

# Hide cursor
echo -ne '\033[?25l'

# Your animation code here
for i in {1..10}; do
    echo -ne '\033[2J\033[H'  # Clear screen
    echo "Frame $i"
    sleep 0.1
done

# Show cursor
echo -ne '\033[?25h'
```

### Go Example - Terminal Progress

```go
package main

import (
    "fmt"
    "time"
)

func main() {
    fmt.Print("\033[?25l") // Hide cursor
    defer fmt.Print("\033[?25h") // Show cursor on exit

    for i := 0; i <= 100; i += 10 {
        fmt.Print("\033[2K\033[H") // Clear and home
        fmt.Printf("Progress: %d%%\n", i)
        time.Sleep(time.Millisecond * 100)
    }
}
```

## Building Interactive TUIs

### Basic Pattern

```python
import sys
import time

def render_screen(state):
    # Clear screen
    print('\033[2J\033[H', end='')

    # Draw UI
    print("─" * 40)
    print(f"State: {state}")
    print("─" * 40)

    sys.stdout.flush()

state = 0
while True:
    render_screen(state)
    state += 1
    time.sleep(0.5)
```

## Advanced Sequences

### Set Title

```
\033]0;Window Title\007
```

### Bell/Alert

```
\007 or \033[BEL
```

### Alternate Screen Buffer

```
\033[?1049h  # Enable alternate buffer
\033[?1049l  # Disable alternate buffer
```

This is useful for full-screen applications that don't want to leave content in the terminal history.

## Compatibility Considerations

- ANSI escape sequences are supported on Unix/Linux and modern Windows terminals
- Some Windows console applications require special handling
- Mobile terminals may have limited support
- Always provide fallbacks for unsupported terminals

## Debugging Escape Sequences

### Visualizing Hidden Characters

```bash
# Show escape sequences with visible characters
cat file.txt | cat -v
```

### Using od (Octal Dump)

```bash
# See hex representation of escape sequences
echo -e "\033[31mRed\033[0m" | od -c
```

## Performance Tips

- Batch screen updates instead of printing line by line
- Use selective clearing (`\033[K`) instead of full screen clear
- Buffer output before printing
- Minimize flush operations

## Conclusion

Terminal escape sequences are powerful tools for creating professional CLI applications. Understanding them allows you to build responsive, interactive terminal interfaces that work across different platforms.
