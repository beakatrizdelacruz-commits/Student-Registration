
const studentForm = document.getElementById("studentForm");
const studentName = document.getElementById("studentName");
const studentEmail = document.getElementById("studentEmail");
const studentProgram = document.getElementById("studentProgram");
const studentTable = document.getElementById("studentTable");
const submitBtn = document.getElementById("submitBtn");
const cancelBtn = document.getElementById("cancelBtn");
const message = document.getElementById("message");

// Load saved student records from the browser.
let students = [];

try {
    const savedStudents = JSON.parse(
        localStorage.getItem("students") || "[]"
    );

    if (Array.isArray(savedStudents)) {
        students = savedStudents.filter(student =>
            student &&
            typeof student.id === "string" &&
            typeof student.name === "string" &&
            typeof student.email === "string" &&
            typeof student.program === "string"
        );
    }
} catch (error) {
    students = [];
}

let editingId = null;
let messageTimer;

// Save student records to localStorage.
function saveStudents() {
    try {
        localStorage.setItem("students", JSON.stringify(students));
        return true;
    } catch (error) {
        showMessage("Unable to save data in this browser.", true);
        return false;
    }
}

// Display a message to the user.
function showMessage(text, isError = false) {
    clearTimeout(messageTimer);

    message.textContent = text;
    message.style.color = isError ? "#c82333" : "#218838";

    messageTimer = setTimeout(() => {
        message.textContent = "";
    }, 3000);
}

// Display all student records in the table.
function renderStudents() {
    studentTable.replaceChildren();

    if (students.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 4;
        cell.textContent = "No students found.";
        cell.style.textAlign = "center";

        row.appendChild(cell);
        studentTable.appendChild(row);
        return;
    }

    students.forEach(student => {
        const row = document.createElement("tr");

        const nameCell = document.createElement("td");
        const emailCell = document.createElement("td");
        const programCell = document.createElement("td");
        const actionsCell = document.createElement("td");

        nameCell.textContent = student.name;
        emailCell.textContent = student.email;
        programCell.textContent = student.program;

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.className = "edit-btn";
        editButton.type = "button";

        editButton.addEventListener("click", () => {
            editStudent(student.id);
        });

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";
        deleteButton.type = "button";

        deleteButton.addEventListener("click", () => {
            deleteStudent(student.id);
        });

        actionsCell.append(editButton, deleteButton);
        row.append(
            nameCell,
            emailCell,
            programCell,
            actionsCell
        );

        studentTable.appendChild(row);
    });
}

// Add a new student or update an existing student.
studentForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = studentName.value.trim();
    const email = studentEmail.value.trim();
    const program = studentProgram.value;

    if (!name || !email || !program) {
        showMessage("Please complete all fields.", true);
        return;
    }

    // Prevent duplicate email addresses.
    const duplicate = students.some(student =>
        student.email.toLowerCase() === email.toLowerCase() &&
        student.id !== editingId
    );

    if (duplicate) {
        showMessage("This email is already registered.", true);
        return;
    }

    const previousStudents = [...students];

    if (editingId !== null) {
        // UPDATE existing student information.
        students = students.map(student =>
            student.id === editingId
                ? { ...student, name, email, program }
                : student
        );
    } else {
        // ADD a new student.
        students.push({
            id: crypto.randomUUID(),
            name,
            email,
            program
        });
    }

    if (!saveStudents()) {
        students = previousStudents;
        renderStudents();
        return;
    }

    const wasEditing = editingId !== null;

    resetForm();
    renderStudents();

    showMessage(
        wasEditing
            ? "Student information updated successfully!"
            : "Student added successfully!"
    );
});

// Load the selected student's information into the form.
function editStudent(id) {
    const student = students.find(item => item.id === id);

    if (!student) return;

    editingId = id;

    studentName.value = student.name;
    studentEmail.value = student.email;
    studentProgram.value = student.program;

    submitBtn.textContent = "Update Student";
    cancelBtn.hidden = false;

    message.textContent = "Editing student information.";

    studentName.focus();
}

// Delete a student record.
function deleteStudent(id) {
    const student = students.find(item => item.id === id);

    if (!student) return;

    const confirmed = confirm(
        `Are you sure you want to delete ${student.name}?`
    );

    if (!confirmed) return;

    const previousStudents = [...students];

    students = students.filter(item => item.id !== id);

    if (!saveStudents()) {
        students = previousStudents;
        renderStudents();
        return;
    }

    if (editingId === id) {
        resetForm();
    }

    renderStudents();
    showMessage("Student deleted successfully!");
}

// Reset the form and exit edit mode.
function resetForm() {
    studentForm.reset();
    editingId = null;

    submitBtn.textContent = "Add Student";
    cancelBtn.hidden = true;
}

// Cancel editing without changing the saved record.
cancelBtn.addEventListener("click", function () {
    resetForm();
    message.textContent = "";
});

// Show saved records when the page loads.
renderStudents();
