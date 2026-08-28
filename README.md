# LostFound — Anurag University

A full-stack Lost & Found web application designed exclusively for students and members of Anurag University. The platform allows users to report lost or found items, browse available reports, search for items, and connect with the person who posted an item.

---

## 1. Project Objective / Problem Statement

### Problem Statement

Students frequently lose personal belongings such as ID cards, wallets, books, mobile phones, earphones, bags, certificates, and other valuable items on campus.

Currently, information about lost and found belongings is often shared through:

- WhatsApp groups
- College groups
- Word of mouth
- Notice boards
- Class groups

These methods make it difficult to:

- Find a specific lost item quickly
- Know whether someone has found an item
- Search through previous lost/found reports
- Organize information about lost belongings
- Prevent people outside the university from accessing the system

### Objective

The objective of **LostFound** is to provide a centralized digital platform where Anurag University students can:

1. Report lost items.
2. Report items they have found.
3. Browse lost and found items.
4. Search for specific items.
5. Filter items by category and type.
6. View detailed information about an item.
7. Manage their own reports.
8. Restrict registration to university email addresses.

The goal is to make the process of recovering lost belongings **faster, easier, and more organized**.

---

# 2. Proposed Solution

LostFound is a full-stack web application consisting of a React frontend and a Node.js/Express backend.

Users can create an account using their university email address and then post lost or found items.

Each report can contain information such as:

- Item title
- Description
- Category
- Lost/Found status
- Location
- Date
- Image
- User who posted the report

The application provides search and filtering functionality so users can quickly find relevant reports.

### System Architecture

```text
                    ┌──────────────────────┐
                    │      User Browser    │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  React + Vite        │
                    │  Frontend            │
                    │  Hosted on Vercel    │
                    └──────────┬───────────┘
                               │
                         REST API / Axios
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Node.js + Express     │
                    │ Backend               │
                    │ Hosted on Render     │
                    └──────┬─────────┬─────┘
                           │         │
                 ┌─────────┘         └──────────┐
                 ▼                              ▼
        ┌─────────────────┐            ┌─────────────────┐
        │ MongoDB Atlas   │            │ Cloudinary      │
        │ Database        │            │ Image Storage   │
        └─────────────────┘            └─────────────────┘