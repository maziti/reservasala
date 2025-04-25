
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-app.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-database.js";

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

document.getElementById("reservar").addEventListener("click", async () => {
  const nome = document.getElementById("nome").value;
  const data = document.getElementById("data").value;
  const horarioInicio = document.getElementById("horario_inicio").value;
  const horarioFim = document.getElementById("horario_fim").value;
  const sala = document.getElementById("sala").value;

  if (!nome || !data || !horarioInicio || !horarioFim || !sala) {
    alert("Preencha todos os campos!");
    return;
  }

  const id = `${data}-${horarioInicio}-${sala}`;
  const reservaRef = ref(db, "reservas/" + id);

  const novaReserva = {
    nome,
    data,
    horarioInicio,
    horarioFim,
    sala
  };

  try {
    await set(reservaRef, novaReserva);
    alert("Reserva feita com sucesso!");
    location.reload();
  } catch (error) {
    alert("Erro ao salvar reserva: " + error.message);
  }
});
