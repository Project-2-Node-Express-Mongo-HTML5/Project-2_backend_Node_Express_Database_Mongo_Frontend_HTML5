# Weekend Project Manager

**Authors:** David Ahn and Alison Avery
**Course:** Project 2 – Node + Express + Mongo + HTML5
**License:** MIT

---

## Overview

Weekend Project Manager is a fullstack web application designed to help users organize personal projects and receive recommendations on what to work on next. Many people accumulate hobby ideas but struggle to decide what to work on when free time becomes available.

This application separates **project management** from **decision context**, allowing users to store projects with attributes such as effort level, priority, and status, while also defining reusable decision profiles based on time, season, and energy.

The system uses a **Node + Express backend**, a **MongoDB database (Node driver)**, and a **vanilla JavaScript frontend** that dynamically renders data using REST APIs.

The goal is to reduce decision fatigue by ranking projects according to the user’s current situation while still functioning independently as a structured project tracker.

---

## Live Demo

*(Link)*

---

## Features

### Project Lifecycle Engine (Ideas Collection)

* Create new projects with title, effort level, estimated time, and priority
* Edit existing projects
* Archive or delete projects
* Mark projects as completed or abandoned
* View and sort projects by priority or status
* Track completion patterns over time

### Decision Context Engine (Profiles Collection)

* Create reusable decision profiles such as "Low Energy Evening"
* Input available time, energy level, and season
* Receive ranked project recommendations
* See explanation for why a project was recommended
* Save and reuse profiles for quick selection

---

## User Personas

### Sara – Busy Multi Hobbyist

Sara is a software developer with limited weekend time. She wants a simple way to store hobby ideas and quickly determine which project fits her available time window.

### Matt – Structured Learner

Matt prefers structured systems and wants to match projects to available time blocks while tracking progress over time.

### Jamie – Creative Starter

Jamie frequently starts new projects but struggles to finish them. She benefits from clear prioritization and recommendation guidance.

---

## User Stories

### Project Lifecycle (Ideas)

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

## Architecture

This project follows a **3-tier architecture**:

### Client

* Static HTML5
* CSS
* Vanilla JavaScript (ES6 Modules)
* Fetch API for REST calls

### Server

* Node.js
* Express.js
* RESTful API endpoints

#### Ideas (Projects)

* `GET /ideas`
* `POST /ideas`
* `PATCH /projects/:id`
* `DELETE /projects/:id`

#### Profiles

* `GET /profiles`
* `POST /profiles`

#### Recommendation Engine

* `GET /recommend?profileId=<id>`

> `/recommend` is a read only computation endpoint that derives ranked results from existing collections and does not create or modify database records.

### Database (MongoDB Node Driver)

Two collections:

#### `ideas`

* title
* effort
* estimatedTime
* priority
* status
* timestamps

#### `profiles`

* name
* season
* timeAvailable
* energyLevel

MongoDB runs in Docker for local development.

---


## Design Mockup

### System Architecture Wireframe

The diagram illustrates the client server database architecture and ownership separation between the Project Lifecycle Engine and the Decision Context Engine.

![Weekend Project Queue Manager Architecture](docs/wireframe.png)


## Technologies Used

* Node.js
* Express.js
* MongoDB (Official Node Driver)
* HTML5
* CSS
* Vanilla JavaScript (ES Modules)
* Docker

---

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Project-2-Node-Express-Mongo-HTML5/Project-2_backend_Node_Express_Database_Mongo_Frontend_HTML5.git
cd Project-2_backend_Node_Express_Database_Mongo_Frontend_HTML5
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start MongoDB (Docker)

```bash
docker run --name mongodb -p 27017:27017 -d mongodb/mongodb-community-server:latest
```

### 4. Start the Server

```bash
npm start
```

Then visit:

```
http://localhost:8080
```

---

## Project Structure

```text
/frontend        → Static HTML, CSS, JS
/routes          → Express route modules
/db              → Database connector module
/data            → Sample data (if applicable)
backend.js       → Express server entry point
```

---

## Compliance With Project Requirements

* Uses Node + Express
* Uses MongoDB (Node driver, no Mongoose)
* Uses only vanilla JavaScript for client-side rendering
* Implements at least two MongoDB collections with CRUD operations
* Includes forms
* Organized using ES Modules (no CommonJS `require`)
* No template engines used


---

## License

MIT License
