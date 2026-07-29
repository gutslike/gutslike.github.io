---
title: "Python Basics: Lists, Tuples, Sets, and Dictionaries"
description: "A concise guide to Python's core collection types and when to use each."
pubDate: "Jul 29 2026"
---

Python provides several built-in data structures for storing groups of values. Each one has a different purpose.

## Lists

Lists are ordered and mutable, which means you can change them after creation.

```python
fruits = ["apple", "banana"]
fruits.append("cherry")
print(fruits)  # ['apple', 'banana', 'cherry']
```

## Tuples

Tuples are ordered but immutable. They are useful when you want a fixed collection of values.

```python
point = (10, 20)
print(point[0])  # 10
```

## Sets

Sets store unique values and are useful when you need to remove duplicates.

```python
numbers = {1, 2, 2, 3}
print(numbers)  # {1, 2, 3}
```

## Dictionaries

Dictionaries store data as key-value pairs.

```python
student = {"name": "Alice", "age": 21}
print(student["name"])  # Alice
```

## When to use each

- Use a list for ordered and changeable items.
- Use a tuple for fixed collections.
- Use a set for unique values.
- Use a dictionary for labeled data.
