
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

let autenticado = false;
let reservaEditando = null;

function carregarReservas() {
  get(ref(db, "reservas")).then(snapshot => {
    const reservas = snapshot.val() || {};
    Object.values(reservas).forEach(r => {
      const div = document.getElementById("agenda-" + r.data);
      if (div) {
        const item = document.createElement("div");
        item.className = "bg-blue-100 p-1 rounded flex justify-between items-center";
        item.innerHTML = `
          <span>${r.inicio}–${r.fim} | ${r.sala} | ${r.nome}</span>
          ${autenticado ? `
            <div class="ml-2 space-x-1">
              <button onclick="editar('${r.data}', '${r.inicio}', '${r.sala}')" class="text-blue-600">✏️</button>
              <button onclick="excluir('${r.data}', '${r.inicio}', '${r.sala}')" class="text-red-600">🗑️</button>
            </div>` : ""}
        `;
        div.appendChild(item);
      }
    });
  });
}

window.editar = (data, inicio, sala) => {
  const id = `${data}-${inicio}-${sala}`;
  get(ref(db, "reservas/" + id)).then(snapshot => {
    const r = snapshot.val();
    if (!r) return;
    document.getElementById("nome").value = r.nome;
    document.getElementById("data").value = r.data;
    document.getElementById("inicio").value = r.inicio;
    document.getElementById("fim").value = r.fim;
    document.getElementById("sala").value = r.sala;
    reservaEditando = id;
  });
};

window.excluir = async (data, inicio, sala) => {
  const id = `${data}-${inicio}-${sala}`;
  await remove(ref(db, "reservas/" + id));
  alert("Reserva excluída.");
  location.reload();
};

document.getElementById("authConfirm").addEventListener("click", () => {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;
  if (email === "ti@mazi.com.br" && senha === "@Mazi#2017@") {
    autenticado = true;
    toggleModal(false);
    location.reload();
  } else {
    alert("Credenciais inválidas!");
  }
});

window.toggleModal = (show) => {
  document.getElementById("authModal").style.display = show ? "flex" : "none";
};

document.getElementById("reservaForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const nome = document.getElementById("nome").value;
  const data = document.getElementById("data").value;
  const inicio = document.getElementById("inicio").value;
  const fim = document.getElementById("fim").value;
  const sala = document.getElementById("sala").value;

  if (fim <= inicio) {
    alert("Horário final deve ser maior que o inicial.");
    return;
  }

  const id = reservaEditando || `${data}-${inicio}-${sala}`;
  const novaReserva = { nome, data, inicio, fim, sala };
  await set(ref(db, "reservas/" + id), novaReserva);
  alert("Reserva salva!");
  location.reload();
});

carregarReservas();
