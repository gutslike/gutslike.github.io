---
title: "Valid Anagram"
description: "A simple explanation of the Valid Anagram problem using Go."
pubDate: "Aug 06 2026"
---

# Valid Anagram

## Problem Summary

The problem says-
Given two strings s and t, return true if t is an anagram of s, and false otherwise.

An anagram means that both strings contain the same characters with the same frequencies, just in a different order.

For example, "listen" and "silent" are anagrams, while "hello" and "world" are not.

A basic approach could be to sort both strings and compare them, but there is a more efficient way.

## Key Idea

Instead of sorting, we can count how many times each character appears.

If the strings have different lengths, they cannot be anagrams.

If they have the same length, we can use a frequency array and increase the count for each letter in s, then decrease it while we iterate through t.

At the end, every count should be zero. If any count is non-zero, then the strings are not anagrams.

## Implementation in Go

```go
func isAnagram(s string, t string) bool {
    count := [26]int{}

    if len(s) != len(t) {
        return false
    }

    for _, c := range s {
        count[c-'a']++
    }

    for _, c := range t {
        count[c-'a']--
    }

    for _, value := range count {
        if value != 0 {
            return false
        }
    }

    return true
}
```

This solution runs in O(n) time and uses O(1) extra space because the alphabet size is fixed at 26.
