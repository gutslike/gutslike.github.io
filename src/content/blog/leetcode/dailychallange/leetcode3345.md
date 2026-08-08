---
title: "Smallest Divisible Digit Product I"
description: "A simple explanation of the Smallest Divisible Digit Product I problem and a Go-based solution."
pubDate: "Aug 07 2026"
---

## Problem Summary

We are given two integers n and t.

We need to return the smallest number greater than or equal to n such that the product of its digits is divisible by t.

This means we keep checking numbers starting from n, compute the product of all digits, and stop at the first number whose digit product is divisible by t.

## Key Idea

The simplest approach is to just try numbers one by one.

For each number, we break it into digits and multiply them together.

If the resulting product is divisible by t, then we found the answer.

If not, we move to the next number and repeat the process.

This is straightforward because the problem only asks for the first valid number.

## Implementation in Go

```go
func smallestNumber(n int, t int) int {
    for {
        temp := n
        product := 1

        if temp == 0 {
            product = 0
        }

        for temp > 0 {
            product *= temp % 10
            temp /= 10
        }

        if product%t == 0 {
            return n
        }

        n++
    }
}
```

This solution is easy to understand and works well for the given problem constraints.
