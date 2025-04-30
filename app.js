
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-app.js";
import { getDatabase, ref, set, get, remove } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-database.js";

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
    const fim = new Date();
    fim.setDate(hoje.getDate() + 30);

    const reservasPorDia = {};

    Object.values(reservas).forEach(r => {
      const dataReserva = new Date(r.data);
      if (dataReserva >= hoje && dataReserva <= fim) {
        if (!reservasPorDia[r.data]) {
          reservasPorDia[r.data] = [];
        }
        reservasPorDia[r.data].push(r);
      }
    });

    const datasOrdenadas = Object.keys(reservasPorDia).sort();

    datasOrdenadas.forEach(data => {
      const card = document.createElement("div");
      card.className = "bg-white rounded-lg shadow p-4";

      const titulo = document.createElement("h3");
      titulo.className = "text-lg font-semibold mb-2";
      titulo.textContent = new Date(data).toLocaleDateString("pt-BR", {
        weekday: "long", year: "numeric", month: "long", day: "numeric"
      });
      card.appendChild(titulo);

      reservasPorDia[data].sort((a, b) => a.inicio.localeCompare(b.inicio)).forEach(r => {
        const item = document.createElement("div");
        item.className = "flex justify-between items-center border-t py-2";

        item.innerHTML = `
          <div>
            <p class="font-medium">${r.sala}</p>
            <p>${r.inicio} às ${r.fim} - <strong>${r.nome}</strong></p>
          </div>
          <div>
            <button onclick="auth('edit', ${r.id})" class="text-blue-600 hover:underline mr-2">Editar</button>
            <button onclick="auth('delete', ${r.id})" class="text-red-600 hover:underline">Excluir</button>
          </div>
        `;
        card.appendChild(item);
      });

      historicoDiv.appendChild(card);
    });

    if (datasOrdenadas.length === 0) {
      historicoDiv.innerHTML = "<p class='text-gray-500'>Nenhuma reserva nos próximos 30 dias.</p>";
    }
  });
}

window.auth = function(action, id) {
  reservaEditando = { action, id };
  toggleModal(true);
};

window.toggleModal = function(show) {
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
