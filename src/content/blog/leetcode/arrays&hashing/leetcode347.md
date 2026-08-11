---
title: "Top K Frequent Elements"
description: "A Go-based bucket sort approach to find the k most frequent elements in an integer array."
pubDate: "Aug 11 2026"
---

## Problem Summary

Given an integer array `nums` and an integer `k`, return the `k` most frequent elements.

The order of the final result does not matter.

## Key Idea

Count how often each number appears, then group numbers by frequency.

Using a bucket array indexed by frequency lets us collect the most frequent values efficiently.

Because frequencies range from `1` to `len(nums)`, the bucket array has a bounded size.

## Implementation in Go

```go
func topKFrequent(nums []int, k int) []int {
    freq := make(map[int]int)
    buckets := make([][]int, len(nums)+1)

    for _, num := range nums {
        freq[num]++
    }

    for num, count := range freq {
        buckets[count] = append(buckets[count], num)
    }

    result := make([]int, 0, k)

    for i := len(buckets) - 1; i >= 0 && len(result) < k; i-- {
        for _, num := range buckets[i] {
            result = append(result, num)
            if len(result) == k {
                break
            }
        }
    }

    return result
}
```

## Why this works

First, build a frequency map for all numbers.

Then place each number into a bucket corresponding to its frequency.

Since the highest possible frequency is `len(nums)`, bucket indices are bounded and easy to scan from high to low.

Collect the numbers from the top buckets until you have `k` results.

## Complexity

- Time: $O(n)$
- Space: $O(n)$

Here, $n$ is the number of elements in `nums`.

Counting frequencies takes $O(n)$, and filling plus scanning the buckets also stays linear.

The buckets and frequency map require space proportional to the input size.
