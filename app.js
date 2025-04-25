import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-app.js";
import { getDatabase, ref, set, get, remove, child } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCvFbiSbZehmHfE9ynoxjKhJ1Oj9I6vCIM",
  authDomain: "reserva-salas-76930.firebaseapp.com",
  databaseURL: "https://reserva-salas-76930-default-rtdb.firebaseio.com",
  projectId: "reserva-salas-76930",
  storageBucket: "reserva-salas-76930.appspot.com",
  messagingSenderId: "368015832793",
  appId: "1:368015832793:web:1ca2ca6ee9649b96e1f0c8"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
let reservaEditando = null;

document.getElementById("reservaForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const nome = document.getElementById("nome").value;
  const data = document.getElementById("data").value;
  const inicio = document.getElementById("inicio").value;
  const fim = document.getElementById("fim").value;
  const sala = document.getElementById("sala").value;

  if (fim <= inicio) {
    alert("O horário final deve ser maior que o inicial.");
    return;
  }

  const snapshot = await get(ref(db, "reservas"));
  const reservas = snapshot.val() || {};

  const conflito = Object.values(reservas).some(r =>
    r.sala === sala && r.data === data &&
    ((inicio >= r.inicio && inicio < r.fim) ||
     (fim > r.inicio && fim <= r.fim) ||
     (inicio <= r.inicio && fim >= r.fim)) &&
    (!reservaEditando || reservaEditando.id !== r.id)
  );

  if (conflito) {
    alert("Conflito de horário para essa sala!");
    return;
  }

  const id = reservaEditando ? reservaEditando.id : Date.now();
  const novaReserva = { id, nome, data, inicio, fim, sala };

  await set(ref(db, "reservas/" + id), novaReserva);
  reservaEditando = null;
  document.getElementById("reservaForm").reset();
  renderHistorico();
});

function renderHistorico() {
  const historicoDiv = document.getElementById("historico");
  historicoDiv.innerHTML = "";

  get(ref(db, "reservas")).then(snapshot => {
    const reservas = snapshot.val() || {};
    const hoje = new Date();
    const dataLimite = new Date();
    dataLimite.setDate(hoje.getDate() - 15);

    const reservasFiltradas = Object.values(reservas)
      .filter(r => new Date(r.data) >= dataLimite)
      .sort((a, b) => a.data.localeCompare(b.data) || a.inicio.localeCompare(b.inicio));

    for (const r of reservasFiltradas) {
      const div = document.createElement("div");
      div.className = "border p-2 rounded bg-gray-50 flex justify-between items-center";
      div.innerHTML = `
        <div>
          <p><strong>${r.nome}</strong> - ${r.sala}</p>
          <p>${r.data} | ${r.inicio} - ${r.fim}</p>
        </div>
        <div class="space-x-2">
          <button onclick="auth('edit', ${r.id})" class="text-blue-500">Editar</button>
          <button onclick="auth('delete', ${r.id})" class="text-red-500">Excluir</button>
        </div>
      `;
      historicoDiv.appendChild(div);
    }
  });
}

window.auth = function (action, id) {
  reservaEditando = { action, id };
  toggleModal(true);
};

window.toggleModal = function (show) {
  document.getElementById("authModal").style.display = show ? "flex" : "none";
};

document.getElementById("authConfirm").addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  if (email === "ti@mazi.com.br" && senha === "@Mazi#2017@") {
    toggleModal(false);
    const reservas = (await get(ref(db, "reservas"))).val() || {};
    const reserva = reservas[reservaEditando.id];

    if (!reserva) return;

    if (reservaEditando.action === "delete") {
      await remove(ref(db, "reservas/" + reserva.id));
    } else if (reservaEditando.action === "edit") {
      document.getElementById("nome").value = reserva.nome;
      document.getElementById("data").value = reserva.data;
      document.getElementById("inicio").value = reserva.inicio;
      document.getElementById("fim").value = reserva.fim;
      document.getElementById("sala").value = reserva.sala;
    }

    renderHistorico();
  } else {
    alert("Credenciais inválidas!");
  }
});

renderHistorico();