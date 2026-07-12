---
title: "CDN and SANITY"
description: "Lorem ipsum dolor sit amet"
pubDate: "Jul 08 2022"
heroImage: "../../../assets/blog-placeholder-3.jpg"
---

Todays blog covers how i got familiar with cdn.
In the past i have come accross cdn but only for using some svgs in my projects. All i knew about cdn was as a link format that fetches content.But that changed with the need to implement cdn in my own project for the images i uploaded.
The requirement- The website i made uses links for images in the products. These links during develpment were just placeholder images but as e head towards poduction, the use of our own images is required.So now we had to have
a place where our images are uploaded,
the links of those images,
and make the images load faster.

Thus came in sanity.io It provides the services we need- we can host our images here, the images can be fetched using a link, and they have their own cdn which provides these images to the recepient.

Now, how does cdn help and what is it.

### What is a CDN?

A **CDN (Content Delivery Network)** is a globally distributed network of servers that delivers web content to users based on their geographic location. Instead of loading a website from a single central server, a CDN stores copies of that site's static assets (like images, CSS, and JavaScript) on servers closer to the user.

**Why is it used?**

- **Speed:** It significantly reduces latency by serving content from a server near the user, making websites load faster.
- **Reliability:** It provides redundancy. If one server goes down, traffic is automatically routed to another, preventing downtime.
- **Scalability:** It handles high traffic spikes (like a viral post or a product launch) without crashing the origin server.
- **Security:** Many CDNs offer built-in DDoS protection and SSL/TLS encryption to secure data.

---

### What is Sanity?

**Sanity** (specifically **Sanity.io**) is a **headless CMS (Content Management System)**. Unlike traditional CMS platforms (like WordPress) where the content database and the frontend website are tightly coupled, Sanity separates the two. It provides a backend for authors to manage content via a real-time collaborative editor (Sanity Studio), while delivering that content via APIs to any frontend (websites, apps, smart devices, etc.).

**Why is it used?**

- **Omnichannel Delivery:** You write content once and can easily push it to a website, mobile app, smartwatch, or voice assistant simultaneously.
- **Developer Flexibility:** It allows developers to use their preferred frontend frameworks (like React, Vue, Next.js) without being locked into a specific theme or template engine.
- **Real-time Collaboration:** Multiple authors can edit content at the same time and see changes instantly, similar to Google Docs.
- **Structured Content:** It enforces a structured approach to data, making content easier to reuse and manage at scale.
- **Customizability:** The editing environment (Sanity Studio) is fully customizable using React components, allowing teams to tailor the workflow to their specific needs.
