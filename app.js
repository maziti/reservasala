
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-app.js";
import { getDatabase, ref, set, onValue, remove, update } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-database.js";

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

document.getElementById("reservar").addEventListener("click", async () => {
  const nome = document.getElementById("nome").value;
  const data = document.getElementById("data").value;
  const inicio = document.getElementById("horario_inicio").value;
  const fim = document.getElementById("horario_fim").value;
  const sala = document.getElementById("sala").value;

  if (!nome || !data || !inicio || !fim) {
    alert("Preencha todos os campos.");
    return;
  }

  const id = `${data}-${inicio}-${sala}`;
  const reservaRef = ref(db, "reservas/" + id);

  // Verificar conflitos
  onValue(ref(db, "reservas"), (snapshot) => {
    const reservas = snapshot.val();
    for (let key in reservas) {
      const r = reservas[key];
      if (r.data === data && r.sala === sala &&
          ((inicio >= r.inicio && inicio < r.fim) || (fim > r.inicio && fim <= r.fim) || (inicio <= r.inicio && fim >= r.fim))) {
        alert("Conflito de horário com outra reserva!");
        return;
      }
    }

    const novaReserva = { nome, data, inicio, fim, sala };
    set(reservaRef, novaReserva)
      .then(() => alert("Reserva feita com sucesso!"))
      .catch(e => alert("Erro ao reservar: " + e.message));
  }, { onlyOnce: true });
});

// Exibir histórico
function carregarHistorico() {
  const historicoDiv = document.getElementById("historico");
  historicoDiv.innerHTML = "";
  const hoje = new Date();
  const limite = new Date(hoje);
  limite.setDate(hoje.getDate() - 15);

  onValue(ref(db, "reservas"), (snapshot) => {
    const reservas = snapshot.val();
    for (let id in reservas) {
      const r = reservas[id];
      const dataReserva = new Date(r.data);
      if (dataReserva >= limite && dataReserva <= hoje) {
        const div = document.createElement("div");
        div.innerHTML = `
          <b>${r.sala}</b> - ${r.data} ${r.inicio} às ${r.fim} por ${r.nome}
          ${autenticado ? `
            <button onclick="excluirReserva('${id}')">Excluir</button>
          ` : ""}
        `;
        historicoDiv.appendChild(div);
      }
    }
  });
}

window.excluirReserva = (id) => {
  if (!autenticado) {
    document.getElementById("loginModal").style.display = "block";
    return;
  }

  remove(ref(db, "reservas/" + id))
    .then(() => alert("Reserva excluída!"))
    .then(carregarHistorico)
    .catch(e => alert("Erro ao excluir: " + e.message));
};

window.confirmarLogin = () => {
  const email = document.getElementById("loginEmail").value;
  const senha = document.getElementById("loginSenha").value;
  if (email === "ti@mazi.com.br" && senha === "@Mazi#2017@") {
    autenticado = true;
    alert("Login realizado com sucesso!");
    document.getElementById("loginModal").style.display = "none";
    carregarHistorico();
  } else {
    alert("Credenciais inválidas!");
  }
};

carregarHistorico();
