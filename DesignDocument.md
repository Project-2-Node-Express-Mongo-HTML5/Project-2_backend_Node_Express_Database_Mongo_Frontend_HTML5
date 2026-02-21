# Weekend Project Manager

**Authors:** David Ahn and Alison Avery

**Course:** Project 2 – Node + Express + Mongo + HTML5

**License:** MIT

---

# Project Description

Weekend Project Manager is a full stack web application designed to help users organize personal projects and intelligently decide what to work on next. Many individuals accumulate hobby ideas, unfinished tasks, or learning goals but experience decision fatigue when free time becomes available.

This application separates two core concerns:

## Project Lifecycle Management

Users can create, update, archive, delete, and track projects over time. Each project includes structured attributes such as estimated time, effort level, intrinsic priority, seasonality, and status. The system functions independently as a complete project tracker and provides insight into long-term productivity patterns.

## Decision Context Management

Users can define reusable decision profiles based on constraints (time available, season, energy level). The system evaluates all eligible projects and generates ranked recommendations with transparent explanations.

By combining structured CRUD data management with a transparent scoring algorithm, the system reduces analysis paralysis while remaining modular and architecturally clean.

The application is built using:

* **Node.js + Express** (REST backend)
* **MongoDB (Official Node Driver)**
* **HTML5 + Modular CSS**
* **Vanilla JavaScript (ES Modules)**
* **Docker (local MongoDB environment)**

---

# System Goals

The primary goals of this system are:

1. Provide clean, independent CRUD management for projects.
2. Provide clean, independent CRUD management for decision profiles.
3. Implement a computation only recommendation endpoint.
4. Maintain separation of concerns between data storage and decision logic.
5. Deliver transparent, explainable recommendation output.

---

## User Personas

### Sara – Busy Multi Hobbyist

Sara is a software developer with limited weekend time. She wants a simple way to store hobby projects and quickly determine which project fits her available time window.

### Matt – Structured Learner

Matt prefers structured systems and wants to match projects to available time blocks while tracking progress over time.

### Jamie – Creative Starter

Jamie frequently starts new projects but struggles to finish them. She benefits from clear prioritization and recommendation guidance.

---

## User Stories

### Project Lifecycle (Projects)

* As a user, I want to create projects with effort level, estimated time, and intrinsic priority, so they can be objectively evaluated later.
* As a user, I want to edit or archive projects when my interests change, so my system stays realistic.
* As a user, I want to mark projects as completed or abandoned with timestamps, so I can see long-term patterns.
* As a user, I want to view completion history and completion rate, so I can reflect on how I actually use my time.
* As a user, I want to see projects ranked by internal priority score, independent of recommendations.

### Decision Context (Profiles)

* As a user, I want to define decision profiles (ex. “Low energy evening”, “2 free hours Saturday”), so I don’t have to think every time.
* As a user, I want to input current constraints (time available, energy level, season), so the system can reason for me.
* As a user, I want the app to score projects against my current context, so I receive ranked recommendations instead of raw lists.
* As a user, I want to see why a project was recommended (time fit, season match, energy alignment), so the system feels transparent.
* As a user, I want to save and reuse decision profiles, so choosing becomes a one-click action.

---

# Data Model Design

## projects Collection

Each project document contains:

* `_id` (ObjectId)
* `title` (String)
* `description` (String, optional)
* `estimatedTimeMinutes` (Number)
* `effortLevel` ("low" | "medium" | "high")
* `intrinsicPriority` (Number 1–5)
* `season` ("spring" | "summer" | "fall" | "winter" | null)
* `status` ("active" | "completed" | "archived" | "abandoned")
* `createdAt` (Date)
* `completedAt` (Date | null)

Design considerations:

* Status allows lifecycle tracking without deleting historical data.
* Intrinsic priority is independent of contextual scoring.
* Timestamps enable future analytics (completion rate, time trends).

## profiles Collection

Each decision profile document contains:

* `_id` (ObjectId)
* `name` (String)
* `availableTimeMinutes` (Number)
* `energyLevel` ("low" | "medium" | "high")
* `season` ("spring" | "summer" | "fall" | "winter" | null)
* `createdAt` (Date)

Design considerations:

* Profiles are reusable constraint templates.
* No derived data is stored; all recommendations are computed dynamically.

---

# API Design

The backend exposes RESTful endpoints:

## Projects

| Method | Endpoint      | Description           |
| ------ | ------------- | --------------------- |
| GET    | /projects     | Retrieve all projects |
| POST   | /projects     | Create new project    |
| PATCH  | /projects/:id | Update project fields |
| DELETE | /projects/:id | Delete project        |

## Profiles

| Method | Endpoint      | Description           |
| ------ | ------------- | --------------------- |
| GET    | /profiles     | Retrieve all profiles |
| POST   | /profiles     | Create new profile    |
| PATCH  | /profiles/:id | Update profile        |
| DELETE | /profiles/:id | Delete profile        |

## Recommendation

| Method | Endpoint   | Description                    |
| ------ | ---------- | ------------------------------ |
| POST   | /recommend | Compute ranked recommendations |

The `/recommend` endpoint reads from both collections and returns ranked project results without persisting computed scores.

---

# Recommendation Algorithm

The recommendation system is designed to be transparent and deterministic.

Steps performed by `/recommend`:

1. Fetch all active projects.
2. Retrieve the selected decision profile.
3. Filter out projects that exceed available time.
4. Compute a weighted score for each remaining project based on:

   * Time fit (closer to available time scores higher)
   * Energy alignment (exact match scores highest)
   * Season match
   * Intrinsic priority
5. Sort projects by descending score.
6. Return the top 3 ranked projects.
7. Include an explanation breakdown for each score.

No derived scores are stored in MongoDB. All results are computed at request time to ensure consistency and transparency.

---

# 4. Design Mockups

## System Architecture Wireframe

The diagram illustrates the client server database architecture and ownership separation between the Project Lifecycle Engine and the Decision Context Engine.

![Weekend Project Queue Manager Architecture](docs/wireframe.png)

![Frontend Design](docs/frontend-wire.png)


---

### Architecture Explanation

The application follows a clear **3‑Tier Architecture**:

### Client Layer

* Static HTML5 structure
* Modular CSS styling
* Vanilla JavaScript (ES Modules)
* Fetch API for REST communication

The frontend is intentionally framework-free to demonstrate understanding of core web fundamentals.

### Server Layer

* Node.js runtime
* Express RESTful routes
* Route modules:

  * `/projects`
  * `/profiles`
  * `/recommend`

Separation into route modules enforces modularity and clean organization.

### Database Layer

* MongoDB (Node Driver)
* Two independent collections:

  * `projects`
  * `profiles`

The `/recommend` endpoint reads from both collections and computes ranked results dynamically without storing derived data.

---

# UI Layout Description

The interface is divided into two primary panels:

### Left Panel – Project Lifecycle

* Form to create new projects
* List view of stored projects
* Controls to edit, archive, delete, and update status

### Right Panel – Decision Context & Recommendation

* Form to create decision profiles
* Dropdown to select saved profiles
* "Get Recommendation" button
* Recommendation result cards displaying:

  * Project title
  * Computed score
  * Explanation list

This layout reinforces separation of concerns between structured project management and contextual decision logic.

---

# Local Development Environment

MongoDB runs inside a Docker container to ensure environment consistency and reproducibility.

Typical connection string:

`mongodb://localhost:27017`

Benefits of Docker integration:

* Eliminates local installation conflicts
* Provides isolated database instance
* Ensures consistent environment across machines

---

# Architectural Justification

The system design ensures:

* Independent CRUD management of projects
* Independent CRUD management of profiles
* A pure computation endpoint (`/recommend`)
* Clear separation between data storage and decision logic
* Proper RESTful API design
* Modular route organization
* No duplication of derived data

The application functions as:

1. A structured project tracking system
2. A context aware decision engine

This dual functionality increases practical usefulness while satisfying full stack architectural principles and academic project requirements.

---

# 6. License

MIT License
