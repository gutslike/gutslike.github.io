---
title: "Contains Duplicate"
description: "A simple explanation of the Contains Duplicate problem and a Go-based solution using a map."
pubDate: "Aug 04 2026"
---

## Problem Summary

The problem says-
Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.

the requirements are very simple, we just need to check for duplicates.
the brute force approach would be to just check every element one by one using a nested loop.We ought to be better than that.
But how do we do that optimally?

## Key Idea

Now comes in a rule of sets - a set cannot have duplicates, each element can only occur once.

Hence , we just need to run a single loop in which we can check if the current value is in the set ? if it is, return true . and if it is not, add the current element to the set and run the next iteration of the loop.

if the loop has completed without returning true, it means there were no duplicates. So , we can just return false.

## Implementation in Go

Implementation in go-

go does not have a built in set data structure, we will have to work around this by creating a map with keys and empty values.
seen := make(map[int]struct{})

and because the empty struct occupies 0 bytes, its ver optimal to use an empt struct instead of a true false boolean.

```go
func containsDuplicate(nums []int) bool {
    seen := make(map[int]struct{})

    for _, num := range nums {
        if _, exists := seen[num]; exists {
            return true
        }
        seen[num] = struct{}{}
    }
    return false
}
```
