---
title: "Python Basics: Operators"
description: "A concise overview of Python operators and how they are used in everyday code."
pubDate: "Jul 22 2026"
---

Operators are used to perform actions on values and variables. In Python, they help with math, comparisons, logic, and assignment.

## Arithmetic operators

These are used for basic mathematical calculations.

```python
x = 10
y = 3

print(x + y)   # 13
print(x - y)   # 7
print(x * y)   # 30
print(x / y)   # 3.333...
print(x % y)   # 1
print(x ** y)  # 1000
print(x // y)  # 3
```

- `/` returns a float.
- `//` performs floor division and returns an integer value rounded down.

## Assignment operators

Assignment operators store or update values in variables.

```python
x = 5
x += 3     # x = x + 3
x -= 2     # x = x - 2
x *= 4     # x = x * 4
```

## Comparison operators

These compare two values and return a boolean result.

```python
print(5 == 5)   # True
print(5 != 3)   # True
print(7 > 4)    # True
print(2 < 6)    # True
```

## Logical operators

Logical operators combine conditions.

```python
age = 20
print(age > 18 and age < 30)  # True
print(age < 18 or age > 25)   # False
print(not(age == 20))         # False
```

## Identity and membership operators

- `is` and `is not` check whether two variables refer to the same object.
- `in` and `not in` check whether a value exists inside a sequence.

```python
word = "python"
print("p" in word)      # True
print("x" not in word)  # True
```

## Ternary operator

Python also supports a short conditional expression.

```python
age = 20
status = "adult" if age >= 18 else "minor"
print(status)
```

## Operator precedence

When multiple operators appear in one expression, Python follows a precedence order.

```python
print(2 + 3 * 4)   # 14
print((2 + 3) * 4) # 20
```

Parentheses are useful when you want to control the order of evaluation.
