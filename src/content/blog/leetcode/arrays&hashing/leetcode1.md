---
title: "Two Sum"
description: "A simple explanation of the Two Sum problem and a Go-based hash map solution."
pubDate: "Aug 09 2026"
---

## Problem Summary

You are given an array of integers `nums` and an integer `target`. Return the indices of the two numbers such that they add up to `target`.

You may assume that each input has exactly one solution, and you may not use the same element twice.

You can return the answer in any order.

## Key Idea

A very efficient way to solve this is to keep track of numbers we have already seen.

While iterating through the array, for each value `num`, compute the complement:

`comp = target - num`

If `comp` was already seen before, then the current index and the earlier index form the answer.

Otherwise, store the current number in a map with its index so it can be checked later.

This gives us an average time complexity of $O(n)$ and uses $O(n)$ extra space.

## Implementation in Go

```go
func twoSum(nums []int, target int) []int {
    seen := make(map[int]int)

    for i, num := range nums {
        complement := target - num
        if index, found := seen[complement]; found {
            return []int{index, i}
        }
        seen[num] = i
    }

    return []int{}
}
```

## Why this works

At each step, the map stores the value we have already seen and its index.

If the current number plus some earlier number equals the target, we immediately return their indices.

Since each number is processed once, the solution is efficient and clean.
