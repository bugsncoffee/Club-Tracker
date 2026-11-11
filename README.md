# Student Club Activity Tracker

A beginner-friendly university project built with plain HTML, CSS and JavaScript. It lets students explore clubs and request membership, while club leaders and admins can manage activities. The project saves its demo data in the browser's `localStorage`; it does not use a server or database.

## Features

- Choose a demo role: Student, Club Leader or Admin.
- Browse approved clubs and send a request to join.
- Suggest a club for admin approval.
- Approve or reject membership requests as a club leader.
- Create club events and record attendance.
- Post and read club announcements.
- View activity history and simple club and event reports.
- Complete and save a short skill check-in, with a skill-gap calculation.

## Run the project

1. Download or clone this repository.
2. Open the project folder in Visual Studio Code.
3. Open `index.html` using the Live Server extension.
4. Choose a role and enter your name.

No installation, build step or terminal command is required.

## Demo access codes

| Role | Code |
| --- | --- |
| Student | No code |
| Club Leader | `leader123` |
| Admin | `admin123` |

These are public demonstration codes stored in the front-end JavaScript. They are **not secure authentication** and should not be used to protect real accounts or data.

## Project files

- `index.html` — login form and main page structure.
- `style.css` — colors, layout, forms, cards, tables and responsive styles.
- `script.js` — role selection, page rendering, project features and local storage.

## Skill-gap calculation

The check-in asks for ratings from 1 to 5 in three skills. The app finds the average rating, then subtracts it from 5:

```text
Skill gap = 5 - average rating
```

For example, ratings of 3, 4 and 2 have an average of 3. The skill gap is `5 - 3 = 2`.

## Saved data

Clubs, join requests, events, announcements, role and assessment data are stored in the current browser. Data remains after refreshing the page, but it does not sync to another device or browser. Use the assessment page's **Reset assessment** button to clear that assessment. To clear all project data, clear this site's local storage in your browser's developer tools.

## Limitations

This is a front-end learning demo. Roles and access codes can be changed or inspected by a user, and the data is only stored in one browser. It is not a real login or secure membership system.
