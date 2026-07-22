---
title: "Python Basics: Variables and Data Types"
description: "A concise guide to Python variables, common data types, and truthiness."
pubDate: "Jul 22 2026"
---

Python variables are dynamically typed, which means their type can change during program execution. This makes Python flexible, but it is still important to understand the common data types you will use most often.

## Variables in Python

A variable stores a value that can be reused later.

```python
name = "Alice"
age = 25
```

You can also reassign a variable to a different type:

```python
x = 10
x = "ten"
```

## Common data types

### Integers

Integers store whole numbers.

```python
count = 10
negative = -3
```

Python also supports numbers written in other bases:

```python
binary = 0b1010
octal = 0o12
hexadecimal = 0x1A
```

### Floating-point numbers

Floats store decimal values.

```python
price = 19.99
temp = 3.5e2
```

### Strings

Strings hold text.

```python
message = "Hello, Python"
```

### Booleans

Booleans represent true or false values.

```python
is_active = True
is_finished = False
```

### None

`None` means “no value” or “empty value”.

```python
result = None
```

## F-strings

F-strings make it easy to insert variables into strings.

```python
name = "Python"
print(f"I am learning {name}")
```

## Truthiness in Python

Python treats many values as either truthy or falsy. This is useful in conditions.

Falsy values include:

- `False`
- `None`
- `0`, `0.0`, `0j`
- `""` (empty string)
- `[]`, `{}`, `()`, `set()`
- `range(0)`

Everything else is generally truthy.

```python
if []:
    print("This will not run")
```
