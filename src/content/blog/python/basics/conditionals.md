---
title: "Python Basics: Conditionals"
description: "A concise overview of if, elif, else, and match-case statements in Python."
pubDate: "Jul 29 2026"
---

Conditional statements let your program make decisions. In Python, the most common form is the if-elif-else structure.

## If statement

```python
age = 18

if age >= 18:
    print("Adult")
```

## If-Else

```python
score = 75

if score >= 60:
    print("Passed")
else:
    print("Failed")
```

## Elif

```python
grade = 85

if grade >= 90:
    print("A")
elif grade >= 80:
    print("B")
else:
    print("C")
```

## Match-Case

Python also supports match-case for cleaner branching with fixed values.

```python
day = "Monday"

match day:
    case "Monday":
        print("Start of the week")
    case "Friday":
        print("Almost weekend")
    case _:
        print("Other day")
```

Conditionals help your code respond differently based on changing input or state.
