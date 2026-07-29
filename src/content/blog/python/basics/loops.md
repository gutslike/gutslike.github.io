---
title: "Python Basics: Loops"
description: "A concise introduction to for loops and while loops in Python."
pubDate: "Jul 29 2026"
---

Loops are used to repeat actions multiple times without writing the same code again.

## For loop

A for loop is commonly used to iterate over a sequence.

```python
for i in range(3):
    print(i)
```

## While loop

A while loop keeps running as long as a condition is true.

```python
count = 0

while count < 3:
    print(count)
    count += 1
```

## Break and continue

- `break` stops the loop early.
- `continue` skips the current iteration and moves to the next one.

```python
for number in range(5):
    if number == 3:
        break
    print(number)
```

Loops are useful for processing lists, repeating tasks, and automating repetitive work.
