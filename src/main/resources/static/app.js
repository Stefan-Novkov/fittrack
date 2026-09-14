const state = {
    token: localStorage.getItem("fittrackToken"),
    username: localStorage.getItem("fittrackUsername"),
    exercises: [],
    workouts: [],
    stats: null,
    activeView: "dashboard"
};

const els = {
    authView: document.querySelector("#authView"),
    appView: document.querySelector("#appView"),
    sessionLabel: document.querySelector("#sessionLabel"),
    logoutButton: document.querySelector("#logoutButton"),
    pageTitle: document.querySelector("#pageTitle"),
    toast: document.querySelector("#toast"),
    loginForm: document.querySelector("#loginForm"),
    registerForm: document.querySelector("#registerForm"),
    authHint: document.querySelector("#authHint"),
    authTabs: document.querySelectorAll("[data-auth-tab]"),
    navLinks: document.querySelectorAll("[data-view-link]"),
    views: {
        dashboard: document.querySelector("#dashboardView"),
        workouts: document.querySelector("#workoutsView"),
        exercises: document.querySelector("#exercisesView")
    },
    totalWorkouts: document.querySelector("#totalWorkouts"),
    totalExercises: document.querySelector("#totalExercises"),
    recentVolume: document.querySelector("#recentVolume"),
    recentWorkoutList: document.querySelector("#recentWorkoutList"),
    muscleGroupList: document.querySelector("#muscleGroupList"),
    workoutForm: document.querySelector("#workoutForm"),
    workoutExerciseRows: document.querySelector("#workoutExerciseRows"),
    workoutExerciseRowTemplate: document.querySelector("#workoutExerciseRowTemplate"),
    addWorkoutExerciseButton: document.querySelector("#addWorkoutExerciseButton"),
    workoutList: document.querySelector("#workoutList"),
    exerciseForm: document.querySelector("#exerciseForm"),
    exerciseSearch: document.querySelector("#exerciseSearch"),
    exerciseList: document.querySelector("#exerciseList"),
    refreshButton: document.querySelector("#refreshButton")
};

function showToast(message, isError = false) {
    els.toast.textContent = message;
    els.toast.classList.toggle("error", isError);
    els.toast.classList.remove("hidden");
    window.clearTimeout(showToast.timeout);
    showToast.timeout = window.setTimeout(() => els.toast.classList.add("hidden"), 3600);
}

async function api(path, options = {}) {
    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    };

    if (state.token && options.auth !== false) {
        headers.Authorization = `Bearer ${state.token}`;
    }

    const response = await fetch(path, {
        ...options,
        headers
    });

    if (response.status === 401 || response.status === 403) {
        signOut("Please log in again.");
        throw new Error("Your session has expired.");
    }

    if (!response.ok) {
        let message = "Something went wrong.";
        try {
            const body = await response.json();
            message = body.error || body.message || message;
        } catch {
            message = response.statusText || message;
        }
        throw new Error(message);
    }

    if (response.status === 204) {
        return null;
    }

    const text = await response.text();
    return text ? JSON.parse(text) : null;
}

function setAuthMode(mode) {
    els.authTabs.forEach((button) => {
        button.classList.toggle("active", button.dataset.authTab === mode);
    });
    els.loginForm.classList.toggle("hidden", mode !== "login");
    els.registerForm.classList.toggle("hidden", mode !== "register");
    els.authHint.textContent = mode === "login"
        ? "Welcome back. Pick up where your last session left off."
        : "Create an account and start logging your first workout.";
}

function setAuthenticated(isAuthenticated) {
    els.authView.classList.toggle("hidden", isAuthenticated);
    els.appView.classList.toggle("hidden", !isAuthenticated);
    els.logoutButton.classList.toggle("hidden", !isAuthenticated);
    els.sessionLabel.textContent = isAuthenticated && state.username
        ? `Signed in as ${state.username}`
        : "Signed out";
}

function signOut(message) {
    state.token = null;
    state.username = null;
    localStorage.removeItem("fittrackToken");
    localStorage.removeItem("fittrackUsername");
    setAuthenticated(false);
    if (message) showToast(message, true);
}

function formatDate(value) {
    if (!value) return "No date";
    return new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    }).format(new Date(value));
}

function getWorkoutVolume(workout) {
    return (workout.exercises || []).reduce((sum, item) => {
        return sum + ((item.sets || 0) * (item.reps || 0) * (item.weight || 0));
    }, 0);
}

function switchView(view) {
    state.activeView = view;
    Object.entries(els.views).forEach(([name, element]) => {
        element.classList.toggle("active", name === view);
    });
    els.navLinks.forEach((link) => {
        link.classList.toggle("active", link.dataset.viewLink === view);
    });
    els.pageTitle.textContent = view.charAt(0).toUpperCase() + view.slice(1);
    window.location.hash = view;
}

function emptyState(message, detail = "") {
    const element = document.createElement("div");
    element.className = "empty-state";
    const title = document.createElement("strong");
    title.textContent = message;
    element.append(title);
    if (detail) {
        const copy = document.createElement("span");
        copy.textContent = detail;
        element.append(copy);
    }
    return element;
}

function setBusy(form, isBusy, labelWhenBusy = "Working...") {
    const button = form.querySelector("button[type='submit']");
    if (!button) return;
    if (!button.dataset.originalText) {
        button.dataset.originalText = button.textContent;
    }
    button.textContent = isBusy ? labelWhenBusy : button.dataset.originalText;
    button.disabled = isBusy;
    form.classList.toggle("is-loading", isBusy);
}

function setTodayLabel() {
    document.querySelector("#todayLabel").textContent = new Intl.DateTimeFormat(undefined, {
        weekday: "long",
        month: "short",
        day: "numeric"
    }).format(new Date());
}

function toDatetimeLocalValue(date = new Date()) {
    const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return offsetDate.toISOString().slice(0, 16);
}

function setDefaultWorkoutDate() {
    const input = els.workoutForm.querySelector("[name='workoutDate']");
    if (input && !input.value) {
        input.value = toDatetimeLocalValue();
    }
}

function renderDashboard() {
    els.totalWorkouts.textContent = state.stats?.totalWorkouts ?? state.workouts.length;
    els.totalExercises.textContent = state.exercises.length;

    const recentVolume = state.workouts.slice(0, 5).reduce((sum, workout) => sum + getWorkoutVolume(workout), 0);
    els.recentVolume.textContent = `${Math.round(recentVolume).toLocaleString()} kg`;

    els.recentWorkoutList.replaceChildren();
    const recent = state.workouts.slice(0, 4);
    if (!recent.length) {
        els.recentWorkoutList.append(emptyState("No workouts yet.", "Save a workout and it will show up here."));
    } else {
        recent.forEach((workout) => els.recentWorkoutList.append(createWorkoutCard(workout, false)));
    }

    const groups = state.exercises.reduce((map, exercise) => {
        const group = exercise.muscleGroup || "Other";
        map.set(group, (map.get(group) || 0) + 1);
        return map;
    }, new Map());

    els.muscleGroupList.replaceChildren();
    if (!groups.size) {
        els.muscleGroupList.append(emptyState("No muscle groups yet.", "Add exercises with muscle groups to build this view."));
    } else {
        [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0])).forEach(([group, count]) => {
            const chip = document.createElement("span");
            chip.className = "chip";
            chip.append(document.createTextNode(`${group} `));
            const amount = document.createElement("strong");
            amount.textContent = count;
            chip.append(amount);
            els.muscleGroupList.append(chip);
        });
    }
}

function createWorkoutCard(workout, canDelete = true) {
    const card = document.createElement("article");
    card.className = "workout-card";

    const header = document.createElement("header");
    const titleGroup = document.createElement("div");
    const title = document.createElement("h3");
    title.textContent = workout.name;
    const meta = document.createElement("div");
    meta.className = "subtle";
    meta.textContent = `${formatDate(workout.workoutDate)} · ${Math.round(getWorkoutVolume(workout)).toLocaleString()} kg`;
    titleGroup.append(title, meta);
    header.append(titleGroup);

    if (canDelete) {
        const deleteButton = document.createElement("button");
        deleteButton.className = "ghost-button danger";
        deleteButton.type = "button";
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", () => {
            if (window.confirm(`Delete "${workout.name}"?`)) {
                deleteWorkout(workout.id);
            }
        });
        header.append(deleteButton);
    }

    card.append(header);

    if (workout.notes) {
        const notes = document.createElement("p");
        notes.className = "subtle";
        notes.textContent = workout.notes;
        card.append(notes);
    }

    const lines = document.createElement("div");
    lines.className = "exercise-lines";
    (workout.exercises || []).forEach((exercise) => {
        const line = document.createElement("div");
        line.className = "exercise-line";
        const name = document.createElement("span");
        name.textContent = exercise.exerciseName;
        const effort = document.createElement("strong");
        effort.textContent = `${exercise.sets} x ${exercise.reps} @ ${exercise.weight} kg`;
        line.append(name, effort);
        lines.append(line);
    });

    if (lines.children.length) {
        card.append(lines);
    }

    return card;
}

function renderWorkouts() {
    els.workoutList.replaceChildren();
    if (!state.workouts.length) {
        els.workoutList.append(emptyState("Create your first workout.", "Use the form on the left to log exercises, sets, reps, and weight."));
        return;
    }

    state.workouts.forEach((workout) => els.workoutList.append(createWorkoutCard(workout)));
}

function renderExercises() {
    const query = els.exerciseSearch.value.trim().toLowerCase();
    const filtered = state.exercises.filter((exercise) => {
        return !query
            || exercise.name.toLowerCase().includes(query)
            || (exercise.muscleGroup || "").toLowerCase().includes(query);
    });

    els.exerciseList.replaceChildren();
    if (!filtered.length) {
        els.exerciseList.append(emptyState("No exercises found.", "Try a different search or add a new exercise."));
        return;
    }

    filtered.forEach((exercise) => {
        const card = document.createElement("article");
        card.className = "exercise-card";
        const title = document.createElement("h3");
        title.textContent = exercise.name;
        const group = document.createElement("div");
        group.className = "subtle";
        group.textContent = exercise.muscleGroup || "No muscle group";
        card.append(title, group);

        if (exercise.description) {
            const description = document.createElement("p");
            description.className = "subtle";
            description.textContent = exercise.description;
            card.append(description);
        }

        els.exerciseList.append(card);
    });

    refreshWorkoutExerciseOptions();
}

function refreshWorkoutExerciseOptions() {
    const rows = els.workoutExerciseRows.querySelectorAll(".builder-row");
    rows.forEach((row) => {
        const select = row.querySelector("select");
        const selected = select.value;
        select.replaceChildren();
        if (!state.exercises.length) {
            const option = document.createElement("option");
            option.value = "";
            option.textContent = "Add an exercise first";
            select.append(option);
            select.disabled = true;
            return;
        }
        select.disabled = false;
        state.exercises.forEach((exercise) => {
            const option = document.createElement("option");
            option.value = exercise.id;
            option.textContent = exercise.name;
            select.append(option);
        });
        if (selected) select.value = selected;
    });
}

function addWorkoutExerciseRow() {
    const row = els.workoutExerciseRowTemplate.content.firstElementChild.cloneNode(true);
    const removeButton = row.querySelector("[data-remove-row]");
    removeButton.addEventListener("click", () => {
        row.remove();
        if (!els.workoutExerciseRows.children.length) addWorkoutExerciseRow();
    });
    els.workoutExerciseRows.append(row);
    refreshWorkoutExerciseOptions();
}

function renderAll() {
    renderDashboard();
    renderWorkouts();
    renderExercises();
}

async function loadData() {
    els.appView.classList.add("is-loading");
    try {
        const [stats, exercises, workouts] = await Promise.all([
            api("/api/stats/summary"),
            api("/api/exercises"),
            api("/api/workouts")
        ]);
        state.stats = stats;
        state.exercises = exercises || [];
        state.workouts = workouts || [];
        renderAll();
    } finally {
        els.appView.classList.remove("is-loading");
    }
}

async function deleteWorkout(id) {
    try {
        await api(`/api/workouts/${id}`, { method: "DELETE" });
        showToast("Workout deleted.");
        await loadData();
    } catch (error) {
        showToast(error.message, true);
    }
}

els.authTabs.forEach((button) => {
    button.addEventListener("click", () => setAuthMode(button.dataset.authTab));
});

els.loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    try {
        setBusy(event.currentTarget, true, "Logging in...");
        const result = await api("/api/auth/login", {
            method: "POST",
            auth: false,
            body: JSON.stringify(payload)
        });
        state.token = result.token;
        state.username = payload.username;
        localStorage.setItem("fittrackToken", state.token);
        localStorage.setItem("fittrackUsername", state.username);
        setAuthenticated(true);
        await loadData();
        showToast("Welcome back.");
    } catch (error) {
        showToast(error.message, true);
    } finally {
        setBusy(event.currentTarget, false);
    }
});

els.registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries([...formData.entries()].map(([key, value]) => [key, value.trim()]));

    try {
        setBusy(event.currentTarget, true, "Creating...");
        const result = await api("/api/auth/register", {
            method: "POST",
            auth: false,
            body: JSON.stringify(payload)
        });
        state.token = result.token;
        state.username = result.username || payload.username;
        localStorage.setItem("fittrackToken", state.token);
        localStorage.setItem("fittrackUsername", state.username);
        setAuthenticated(true);
        event.currentTarget.reset();
        await loadData();
        showToast("Account created. You are signed in.");
    } catch (error) {
        showToast(error.message, true);
    } finally {
        setBusy(event.currentTarget, false);
    }
});

els.logoutButton.addEventListener("click", () => signOut("Signed out."));
els.refreshButton.addEventListener("click", () => loadData().then(() => showToast("Updated.")));

els.navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
        event.preventDefault();
        switchView(link.dataset.viewLink);
    });
});

document.querySelectorAll("[data-go-view]").forEach((button) => {
    button.addEventListener("click", () => switchView(button.dataset.goView));
});

els.addWorkoutExerciseButton.addEventListener("click", addWorkoutExerciseRow);

els.workoutForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const exercises = [...els.workoutExerciseRows.querySelectorAll(".builder-row")]
        .map((row) => ({
            exerciseId: Number(row.querySelector("[name='exerciseId']").value),
            sets: Number(row.querySelector("[name='sets']").value),
            reps: Number(row.querySelector("[name='reps']").value),
            weight: Number(row.querySelector("[name='weight']").value)
        }))
        .filter((item) => item.exerciseId && item.sets && item.reps);

    if (!state.exercises.length) {
        showToast("Add an exercise before saving a workout.", true);
        return;
    }

    const payload = {
        name: formData.get("name"),
        notes: formData.get("notes"),
        workoutDate: formData.get("workoutDate") || null,
        exercises
    };

    try {
        setBusy(form, true, "Saving...");
        await api("/api/workouts", {
            method: "POST",
            body: JSON.stringify(payload)
        });
        showToast("Workout saved.");
        form.reset();
        els.workoutExerciseRows.replaceChildren();
        addWorkoutExerciseRow();
        setDefaultWorkoutDate();
        await loadData();
    } catch (error) {
        showToast(error.message, true);
    } finally {
        setBusy(form, false);
    }
});

els.exerciseForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());

    try {
        setBusy(form, true, "Adding...");
        await api("/api/exercises", {
            method: "POST",
            body: JSON.stringify(payload)
        });
        showToast("Exercise added.");
        form.reset();
        await loadData();
    } catch (error) {
        showToast(error.message, true);
    } finally {
        setBusy(form, false);
    }
});

els.exerciseSearch.addEventListener("input", renderExercises);

setTodayLabel();
addWorkoutExerciseRow();
setDefaultWorkoutDate();
setAuthenticated(Boolean(state.token));
const initialView = window.location.hash.replace("#", "");
if (["dashboard", "workouts", "exercises"].includes(initialView)) {
    switchView(initialView);
}
if (state.token) {
    loadData().catch((error) => showToast(error.message, true));
}
