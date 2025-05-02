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

if (localStorage.getItem("admin") === "true") {
  autenticado = true;
  document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) logoutBtn.style.display = "inline-block";
  });
}

const meses = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const diasSemana = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

function gerarCalendario() {
  const hoje = new Date();
  const dias = [];
  for (let i = 0; i < 60; i++) dias.push(new Date(hoje.getTime() + i * 86400000));

  const diasPorMes = {};
  dias.forEach(d => {
    const key = `${d.getMonth()}-${d.getFullYear()}`;
    if (!diasPorMes[key]) diasPorMes[key] = [];
    diasPorMes[key].push(d);
  });

  const container = document.getElementById("calendario");
  container.innerHTML = "";

  for (const chave in diasPorMes) {
    const [mesIdx, ano] = chave.split("-");
    const mesDias = diasPorMes[chave];

    const bloco = document.createElement("div");
    bloco.className = "bg-white p-6 rounded shadow mt-6";

    const titulo = document.createElement("h2");
    titulo.className = "text-xl font-bold mb-4 text-gray-700";
    titulo.textContent = `${meses[mesIdx]}/${ano}`;
    bloco.appendChild(titulo);

    const diasHeader = document.createElement("div");
    diasHeader.className = "grid grid-cols-7 gap-2 text-center font-semibold text-white bg-gray-600 rounded";
    diasSemana.forEach(d => {
      diasHeader.innerHTML += `<div class="p-2">${d}</div>`;
    });
    bloco.appendChild(diasHeader);

    const grid = document.createElement("div");
    grid.className = "grid grid-cols-7 gap-2 mt-2";

    const primeiroDia = new Date(mesDias[0]);
    const offset = primeiroDia.getDay();
    grid.innerHTML += '<div class="p-4"></div>'.repeat(offset);

    mesDias.forEach(dia => {
      const dataStr = dia.toISOString().split("T")[0];
      const dataBR = dia.toLocaleDateString("pt-BR");

      const celula = document.createElement("div");
      celula.className = "p-2 border rounded bg-gray-50 h-48 overflow-auto text-left text-sm";
      celula.innerHTML = `
        <div class="font-bold">${dia.getDate()}</div>
        <div class="text-xs text-gray-500">${dataBR}</div>
        <div id="agenda-${dataStr}" class="mt-1 text-xs text-gray-700 space-y-1"></div>
      `;
      grid.appendChild(celula);
    });

    bloco.appendChild(grid);
    container.appendChild(bloco);
  }
}

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
    localStorage.setItem("admin", "true");
    toggleModal(false);
    location.reload();
  } else {
    alert("Credenciais inválidas!");
  }
});

window.toggleModal = (show) => {
  document.getElementById("authModal").style.display = show ? "flex" : "none";
};

window.logoutAdmin = () => {
  localStorage.removeItem("admin");
  location.reload();
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

  const snapshot = await get(ref(db, "reservas"));
  const reservas = snapshot.val() || {};

  const conflito = Object.values(reservas).some(r =>
    r.data === data &&
    r.sala === sala &&
    (
      (inicio >= r.inicio && inicio < r.fim) ||
      (fim > r.inicio && fim <= r.fim) ||
      (inicio <= r.inicio && fim >= r.fim)
    ) &&
    (!reservaEditando || reservaEditando !== `${r.data}-${r.inicio}-${r.sala}`)
  );

  if (conflito) {
    alert("Conflito de horário com outra reserva!");
    return;
  }

  const id = reservaEditando || `${data}-${inicio}-${sala}`;
  const novaReserva = { nome, data, inicio, fim, sala };
  await set(ref(db, "reservas/" + id), novaReserva);
  alert("Reserva salva!");
  location.reload();
});

gerarCalendario();
carregarReservas();