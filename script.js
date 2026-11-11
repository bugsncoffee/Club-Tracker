// This demo saves information in the browser's localStorage.
const keys = { clubs: "clubs", requests: "requests", events: "events", announcements: "announcements", assessment: "assessment", name: "clubUser", role: "clubRole" };
const starterClubs = [
  { id: 1, name: "Art Society", category: "Arts", logo: "🎨", description: "Draw, paint and make things together.", status: "Approved" },
  { id: 2, name: "Tech Club", category: "Technology", logo: "💡", description: "Explore new technology and build ideas.", status: "Approved" },
  { id: 3, name: "Green Campus", category: "Community", logo: "🌱", description: "Help make our campus greener.", status: "Approved" }
];
const skills = ["Communication", "Teamwork", "Leadership"];
// These public codes are only for demonstrating roles in a class project.
const demoCodes = { leader: "leader123", admin: "admin123" };
let page = "overview";
let messageTimer;

function data(key, fallback) {
  try {
    const saved = localStorage.getItem(keys[key]);
    return saved === null ? fallback : JSON.parse(saved);
  } catch (error) {
    console.error("Could not read saved data:", error);
    return fallback;
  }
}
function save(key, value) {
  try { localStorage.setItem(keys[key], JSON.stringify(value)); }
  catch (error) { console.error("Could not save data:", error); notify("Could not save. Check browser storage settings."); }
}
function clubs() { return data("clubs", starterClubs); }
function requests() { return data("requests", []); }
function events() { return data("events", []); }
function userName() { return localStorage.getItem(keys.name) || "Student"; }
function userRole() { return localStorage.getItem(keys.role) || ""; }
function safe(text) {
  return String(text).replace(/[&<>"']/g, function (char) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char];
  });
}
function notify(text) {
  const box = document.getElementById("message");
  box.textContent = text;
  box.classList.add("show");
  clearTimeout(messageTimer);
  messageTimer = setTimeout(function () { box.classList.remove("show"); }, 2400);
}
function clubName(id) {
  const club = clubs().find(function (item) { return item.id === Number(id); });
  return club ? club.name : "Unknown club";
}
function members(id) {
  return requests().filter(function (item) { return item.clubId === Number(id) && item.status === "Approved"; });
}
function panel(title, content) { return `<section class="panel"><h3>${title}</h3>${content}</section>`; }
function clubOptions() {
  return clubs().filter(function (club) { return club.status === "Approved"; })
    .map(function (club) { return `<option value="${club.id}">${safe(club.name)}</option>`; }).join("");
}

function startApp() {
  const loggedIn = Boolean(userRole());
  document.getElementById("login").hidden = loggedIn;
  document.getElementById("app").hidden = !loggedIn;
  if (!loggedIn) return;
  const menu = ["overview", "clubs", "announcements", "history", "assessment"];
  if (userRole() === "leader") menu.push("requests", "events", "reports");
  if (userRole() === "admin") menu.push("approvals", "reports");
  document.getElementById("currentUser").textContent = userName() + " · " + userRole();
  document.getElementById("navigation").innerHTML = menu.map(function (item) {
    return `<button data-page="${item}" class="${page === item ? "active" : ""}">${item[0].toUpperCase() + item.slice(1)}</button>`;
  }).join("");
  render();
}
function render() {
  const pages = { overview: showOverview, clubs: showClubs, requests: showRequests, events: showEvents,
    announcements: showAnnouncements, history: showHistory, reports: showReports, approvals: showApprovals, assessment: showAssessment };
  document.getElementById("content").innerHTML = pages[page]();
}
function showOverview() {
  const clubCount = clubs().filter(function (club) { return club.status === "Approved"; }).length;
  const memberCount = requests().filter(function (item) { return item.status === "Approved"; }).length;
  return `<h2>Hello, ${safe(userName())}!</h2><p class="muted">Welcome to your club activity tracker.</p>
    <div class="stats"><div class="stat">Approved clubs<strong>${clubCount}</strong></div><div class="stat">Members<strong>${memberCount}</strong></div><div class="stat">Events<strong>${events().length}</strong></div></div>
    ${panel("Get started", "Join a club, attend an event, or share an update.")}`;
}
function showClubs() {
  const cards = clubs().filter(function (club) { return club.status === "Approved"; }).map(function (club) {
    const request = requests().find(function (item) { return item.clubId === club.id && item.student === userName(); });
    const action = userRole() !== "student" ? "" : request && request.status === "Approved" ? "Member" :
      request && request.status === "Pending" ? "Pending" : `<button data-action="join" data-id="${club.id}">Join</button>`;
    return `<article class="card"><span>${safe(club.logo)} · ${safe(club.category)}</span><h3>${safe(club.name)}</h3><p>${safe(club.description)}</p><div class="row"><span class="tag">${members(club.id).length} members</span>${action}</div></article>`;
  }).join("");
  return `<h2>Clubs</h2><div class="grid">${cards || "No approved clubs yet."}</div>${panel("Suggest a club", `<form id="clubForm" class="form-grid">
    <label>Name<input name="name" required></label><label>Category<input name="category" required></label><label>Logo (emoji)<input name="logo" value="⭐"></label>
    <label class="wide">Description<textarea name="description" required></textarea></label><button class="wide">Send for admin approval</button></form>`)}`;
}
function showRequests() {
  const rows = requests().filter(function (item) { return item.status === "Pending"; }).map(function (item) {
    return `<tr><td>${safe(item.student)}</td><td>${safe(clubName(item.clubId))}</td><td><button data-action="decision" data-id="${item.id}" data-status="Approved">Approve</button> <button class="secondary" data-action="decision" data-id="${item.id}" data-status="Rejected">Reject</button></td></tr>`;
  }).join("");
  return `<h2>Membership requests</h2>${panel("Waiting for review", rows ? `<table><tr><th>Student</th><th>Club</th><th>Action</th></tr>${rows}</table>` : "No pending requests.")}`;
}
function showEvents() {
  const cards = events().map(function (event) {
    const people = members(event.clubId).map(function (member) {
      const checked = (event.attendance || []).includes(member.student) ? "checked" : "";
      return `<label class="row"><span><input type="checkbox" value="${safe(member.student)}" ${checked}> ${safe(member.student)}</span></label>`;
    }).join("");
    return panel(safe(event.title), `<p>${safe(event.date)} · ${safe(event.time)} · ${safe(event.venue)} · ${safe(clubName(event.clubId))}</p><p>${safe(event.description)}</p>
      <form class="attendance" data-id="${event.id}">${people || "No approved members yet."}<button>Save attendance</button></form>`);
  }).join("");
  const form = clubOptions() ? `<form id="eventForm" class="form-grid"><label>Title<input name="title" required></label><label>Club<select name="club">${clubOptions()}</select></label>
    <label>Date<input name="date" type="date" required></label><label>Time<input name="time" type="time" required></label><label>Venue<input name="venue" required></label>
    <label class="wide">Description<textarea name="description" required></textarea></label><button class="wide">Create event</button></form>` : "Approve a club first.";
  return `<h2>Events & attendance</h2>${panel("Create event", form)}${cards}`;
}
function showAnnouncements() {
  const posts = data("announcements", []).slice().reverse().map(function (item) {
    return `<div class="row"><div><strong>${safe(item.title)}</strong><p>${safe(item.message)}</p><span class="tag">${safe(clubName(item.clubId))} · ${safe(item.date)}</span></div></div>`;
  }).join("");
  const form = userRole() === "leader" ? panel("Post announcement", `<form id="announcementForm"><label>Club<select name="club">${clubOptions()}</select></label>
    <label>Title<input name="title" required></label><label>Message<textarea name="message" required></textarea></label><button>Publish</button></form>`) : "";
  return `<h2>Announcements</h2>${form}${panel("Latest updates", posts || "No announcements yet.")}`;
}
function showHistory() {
  const joins = requests().filter(function (item) { return userRole() !== "student" || item.student === userName(); }).map(function (item) {
    return `<div class="row">${safe(item.student)} · ${safe(clubName(item.clubId))}<span>${safe(item.status)}</span></div>`;
  }).join("");
  const pastEvents = events().map(function (item) {
    return `<div class="row">${safe(item.title)} · ${safe(item.date)}<span>${(item.attendance || []).length} attended</span></div>`;
  }).join("");
  return `<h2>Activity history</h2>${panel("Memberships", joins || "No membership activity.")}${panel("Events", pastEvents || "No events yet.")}`;
}
function showReports() {
  const clubRows = clubs().filter(function (club) { return club.status === "Approved"; }).map(function (club) {
    const held = events().filter(function (event) { return event.clubId === club.id && event.date < new Date().toISOString().slice(0, 10); }).length;
    return `<tr><td>${safe(club.name)}</td><td>${members(club.id).length}</td><td>${held}</td></tr>`;
  }).join("");
  const eventRows = events().map(function (event) {
    return `<tr><td>${safe(event.title)}</td><td>${safe(clubName(event.clubId))}</td><td>${(event.attendance || []).length}</td></tr>`;
  }).join("");
  return `<h2>Reports</h2>${panel("Members and events per club", `<table><tr><th>Club</th><th>Members</th><th>Events held</th></tr>${clubRows}</table>`)}
    ${panel("Attendance per event", `<table><tr><th>Event</th><th>Club</th><th>Attended</th></tr>${eventRows}</table>`)}`;
}
function showApprovals() {
  const pending = clubs().filter(function (club) { return club.status === "Pending"; }).map(function (club) {
    return `<div class="row">${safe(club.logo)} ${safe(club.name)} · ${safe(club.description)}<button data-action="approve" data-id="${club.id}">Approve</button></div>`;
  }).join("");
  return `<h2>Club approvals</h2>${panel("Waiting for review", pending || "No clubs waiting for approval.")}`;
}
function showAssessment() {
  const saved = data("assessment", null);
  const inputs = skills.map(function (skill) {
    const value = saved ? saved.ratings[skill] : 3;
    return `<label>${skill} <input type="range" min="1" max="5" name="${skill}" value="${value}"> <output>${value}</output></label>`;
  }).join("");
  const result = saved ? `<p>Average: ${saved.average.toFixed(1)} / 5 · Gap: ${saved.gap.toFixed(1)}</p>` : "<p>Choose ratings and save to calculate your skill gap.</p>";
  return `<h2>Skill check-in</h2>${panel("Rate your confidence (1 to 5)", `<form id="assessmentForm">${inputs}<button>Save assessment</button></form>${result}<button class="secondary" data-action="reset">Reset assessment</button>`)}`;
}

function submitForm(event) {
  event.preventDefault();
  const form = event.target;
  const value = function (field) { return form.elements[field].value.trim(); };
  if (form.id === "clubForm") {
    const list = clubs();
    list.push({ id: Date.now(), name: value("name"), category: value("category"), logo: value("logo") || "⭐", description: value("description"), status: "Pending" });
    save("clubs", list);
    notify("Club sent for approval.");
  } else if (form.id === "eventForm") {
    const list = events();
    list.push({ id: Date.now(), title: value("title"), clubId: Number(value("club")), date: value("date"), time: value("time"), venue: value("venue"), description: value("description"), attendance: [] });
    save("events", list);
    notify("Event created.");
  } else if (form.id === "announcementForm") {
    const list = data("announcements", []);
    list.push({ title: value("title"), message: value("message"), clubId: Number(value("club")), date: new Date().toLocaleDateString() });
    save("announcements", list);
    notify("Announcement published.");
  } else if (form.id === "assessmentForm") {
    const ratings = {};
    skills.forEach(function (skill) { ratings[skill] = Number(form.elements[skill].value); });
    const average = Object.values(ratings).reduce(function (sum, rating) { return sum + rating; }, 0) / skills.length;
    save("assessment", { ratings: ratings, average: average, gap: 5 - average });
    notify("Assessment saved.");
  }
  render();
}
function handleAction(button) {
  if (!button.dataset.page && !button.dataset.action) return;
  const id = button.dataset.id;
  if (button.dataset.page) { page = button.dataset.page; startApp(); return; }
  if (button.dataset.action === "join") {
    const list = requests();
    list.push({ id: Date.now(), clubId: Number(id), student: userName(), status: "Pending" });
    save("requests", list);
    notify("Join request sent.");
  } else if (button.dataset.action === "decision") {
    const list = requests();
    const request = list.find(function (item) { return String(item.id) === id; });
    if (request) request.status = button.dataset.status;
    save("requests", list);
    notify("Request updated.");
  } else if (button.dataset.action === "approve") {
    const list = clubs();
    const club = list.find(function (item) { return String(item.id) === id; });
    if (club) club.status = "Approved";
    save("clubs", list);
    notify("Club approved.");
  } else if (button.dataset.action === "reset") {
    localStorage.removeItem(keys.assessment);
    notify("Assessment reset.");
  }
  render();
}
function saveAttendance(form) {
  const list = events();
  const event = list.find(function (item) { return String(item.id) === form.dataset.id; });
  if (!event) return;
  event.attendance = Array.from(form.querySelectorAll("input:checked")).map(function (input) { return input.value; });
  save("events", list);
  notify("Attendance saved.");
  render();
}

document.getElementById("loginForm").addEventListener("submit", function (event) {
  event.preventDefault();
  const form = event.target;
  const selectedRole = form.elements.role.value;
  const requiredCode = demoCodes[selectedRole];

  if (requiredCode && form.elements.accessCode.value !== requiredCode) {
    document.getElementById("loginError").textContent = "That role access code is not correct.";
    return;
  }

  document.getElementById("loginError").textContent = "";
  localStorage.setItem(keys.name, form.elements.name.value.trim());
  localStorage.setItem(keys.role, selectedRole);
  page = "overview";
  startApp();
});
document.getElementById("visitorRole").addEventListener("change", function (event) {
  const needsCode = event.target.value !== "student";
  const codeField = document.getElementById("codeField");
  const codeInput = document.getElementById("accessCode");
  codeField.hidden = !needsCode;
  codeInput.required = needsCode;
  codeInput.value = "";
  document.getElementById("loginError").textContent = "";
});
document.getElementById("switchUser").addEventListener("click", function () {
  localStorage.removeItem(keys.role);
  page = "overview";
  startApp();
});
document.getElementById("navigation").addEventListener("click", function (event) {
  const button = event.target.closest("button");
  if (button) handleAction(button);
});
document.getElementById("content").addEventListener("click", function (event) {
  const button = event.target.closest("button");
  if (button) handleAction(button);
});
document.getElementById("content").addEventListener("submit", function (event) {
  if (event.target.classList.contains("attendance")) {
    event.preventDefault();
    saveAttendance(event.target);
  } else submitForm(event);
});
document.getElementById("content").addEventListener("input", function (event) {
  if (event.target.type === "range") event.target.nextElementSibling.value = event.target.value;
});

if (localStorage.getItem(keys.clubs) === null) save("clubs", starterClubs);
["requests", "events", "announcements"].forEach(function (key) {
  if (localStorage.getItem(keys[key]) === null) save(key, []);
});
startApp();
