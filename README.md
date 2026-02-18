# Weekend Project Manager

**Author:** Alison Avery & David Ahn  
**Class Link:** (https://johnguerra.co/classes/webDevelopment_online_spring_2026/)

## Project Objective

A personal decision engine for people with many ideas and little free time. Unlike a to-do list, this system separates projects from decision context, allowing users to generate recommendations based on available time, energy level, season, and personal priorities.

## Screenshot

![App Screenshot](./screenshot.png)

## Features

- Create and manage projects with effort levels and priorities
- Track project completion history
- View statistics and completion rates
- Filter and sort projects
- Decision engine for smart recommendations (coming soon)

## Tech Stack

- **Frontend:** Vanilla HTML5, CSS3, JavaScript
- **Backend:** Node.js, Express
- **Database:** MongoDB (native driver, no Mongoose)

## Installation

1. Clone the repository
2. Install dependencies:
```bash
   npm install
```
3. Create a `.env` file:
```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017
   DB_NAME=weekend_project_manager
```
4. Start MongoDB:
```bash
   brew services start mongodb-community
```
5. Start the server:
```bash
   npm run dev
```
6. Open browser to `http://localhost:3000`

## Usage

1. Click "New Project" to create a project
2. Fill in project details (name, time, effort, priority)
3. View all projects or filter by status
4. Mark projects as complete or abandoned
5. View statistics to track your progress

## License

MIT