
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-app.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-database.js";

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

function carregarReservas() {
  get(ref(db, "reservas")).then(snapshot => {
    const reservas = snapshot.val() || {};
    Object.values(reservas).forEach(r => {
      const div = document.getElementById("agenda-" + r.data);
      if (div) {
        const item = document.createElement("div");
        item.className = "bg-blue-100 p-1 rounded";
        item.textContent = `${r.inicio}–${r.fim} | ${r.sala} | ${r.nome}`;
        div.appendChild(item);
      }
    });
  });
}

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

  const id = `${data}-${inicio}-${sala}`;
  const novaReserva = { nome, data, inicio, fim, sala };
  await set(ref(db, "reservas/" + id), novaReserva);
  alert("Reserva adicionada!");
  location.reload();
});

carregarReservas();
