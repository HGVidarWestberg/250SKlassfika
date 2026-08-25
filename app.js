const firebaseConfig = {
  apiKey: "AIzaSyBtGI9rWk3ZXyklIoduFcK6XzeyhixoPh4",
  authDomain: "fir-klassfika.firebaseapp.com",
  databaseURL: "https://fir-klassfika-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "fir-klassfika",
  storageBucket: "fir-klassfika.firebasestorage.app",
  messagingSenderId: "852558408007",
  appId: "1:852558408007:web:1773fa46a7268cea3d4462",
  measurementId: "G-W5FJ1XTXJP"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const membersRef = database.ref("Members");
const list = document.querySelector("#members-list");
const selectedNames = document.querySelector("#selected-names");
const rotationTitle = document.querySelector("#rotation-title");
const pairDetail = document.querySelector("#pair-detail");
const status = document.querySelector("#status");
const completeButton = document.querySelector("#complete-week");
let members = [];

function setStatus(message, isError = false) {
  status.textContent = message;
  status.classList.toggle("error", isError);
}

function nextMembers() {
  return [...members].sort((a, b) => a.cookieValue - b.cookieValue || a.shadowValue - b.shadowValue).slice(0, 2);
}

function render() {
  const selected = nextMembers();
  rotationTitle.textContent = selected.length ? "Bring the cookies" : "Add some members first";
  selectedNames.replaceChildren(...selected.map(member => {
    const chip = document.createElement("span");
    chip.className = "name-chip";
    chip.textContent = member.name;
    return chip;
  }));
  pairDetail.textContent = selected.length ? `${selected.map(member => member.name).join(" and ")} have the fewest cookie turns.` : "The pair is selected from the shared Firebase list.";
  completeButton.disabled = selected.length !== 2;
  list.replaceChildren(...(members.length ? members.map(member => {
    const row = document.createElement("tr");
    row.innerHTML = `<td></td><td class="number"></td><td class="number"></td><td><button class="danger" type="button" data-remove="${encodeURIComponent(member.id)}">Remove</button></td>`;
    row.children[0].textContent = member.name;
    row.children[1].textContent = member.cookieValue;
    row.children[2].textContent = member.shadowValue;
    return row;
  }) : [Object.assign(document.createElement("tr"), { innerHTML: '<td class="empty" colspan="4">No members yet.</td>' })]));
}

membersRef.on("value", snapshot => {
  members = Object.entries(snapshot.val() || {}).map(([name, member]) => ({
    id: name,
    name,
    cookieValue: Number(member["cookie value"] || 0),
    shadowValue: Number(member["shadow value"] || 0)
  })).sort((a, b) => a.name.localeCompare(b.name));
  render();
}, error => setStatus(`Could not load members: ${error.message}`, true));

document.querySelector("#add-form").addEventListener("submit", async event => {
  event.preventDefault();
  const input = document.querySelector("#member-name");
  const name = input.value.trim();
  if (!name) return;
  if (/[.#$\[\]/]/.test(name)) {
    setStatus("Names cannot contain . # $ [ ] or /.", true);
    return;
  }
  try {
    await membersRef.transaction(current => {
      const currentMembers = current || {};
      if (currentMembers[name]) return;
      currentMembers[name] = { "cookie value": 0, "shadow value": Object.keys(currentMembers).length + 1 };
      return currentMembers;
    });
    input.value = "";
    setStatus(`${name} added.`);
  } catch (error) { setStatus(`Could not add member: ${error.message}`, true); }
});

document.querySelector("#members-list").addEventListener("click", async event => {
  const button = event.target.closest("[data-remove]");
  if (!button || !confirm("Remove this member?")) return;
  const memberName = decodeURIComponent(button.dataset.remove);
  try {
    await membersRef.transaction(current => {
      const currentMembers = current || {};
      delete currentMembers[memberName];
      Object.values(currentMembers).forEach((member, index) => { member["shadow value"] = index + 1; });
      return currentMembers;
    });
    setStatus("Member removed.");
  }
  catch (error) { setStatus(`Could not remove member: ${error.message}`, true); }
});

document.querySelector("#scramble").addEventListener("click", async () => {
  try {
    await membersRef.transaction(current => {
      const currentMembers = current || {};
      const shuffledNames = Object.keys(currentMembers).sort(() => Math.random() - 0.5);
      shuffledNames.forEach((name, index) => { currentMembers[name]["shadow value"] = index + 1; });
      return currentMembers;
    });
    setStatus("Shadow values scrambled.");
  }
  catch (error) { setStatus(`Could not scramble values: ${error.message}`, true); }
});

document.querySelector("#reset-cookie-values").addEventListener("click", async () => {
  if (!members.length || !confirm("Reset cookie counts for every member?")) return;
  try {
    await membersRef.transaction(current => {
      const currentMembers = current || {};
      Object.values(currentMembers).forEach(member => { member["cookie value"] = 0; });
      return currentMembers;
    });
    setStatus("Cookie counts reset for every member.");
  }
  catch (error) { setStatus(`Could not reset cookie counts: ${error.message}`, true); }
});

completeButton.addEventListener("click", async () => {
  const selected = nextMembers();
  try {
    await membersRef.transaction(current => {
      const currentMembers = current || {};
      const currentSelection = Object.entries(currentMembers)
        .map(([id, member]) => ({ id, ...member }))
        .sort((a, b) => Number(a["cookie value"] || 0) - Number(b["cookie value"] || 0) || Number(a["shadow value"] || 0) - Number(b["shadow value"] || 0))
        .slice(0, 2);
      currentSelection.forEach(member => { currentMembers[member.id]["cookie value"] = Number(member["cookie value"] || 0) + 1; });
      return currentMembers;
    });
    setStatus("This week's cookie turns are recorded.");
  } catch (error) { setStatus(`Could not record the week: ${error.message}`, true); }
});
