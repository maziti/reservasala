
const firebaseConfig = {
    apiKey: "AIzaSyCvFbiSbZehmHfE9ynoxjKhJ1Oj9I6vCIM",
    authDomain: "reserva-salas-76930.firebaseapp.com",
    databaseURL: "https://reserva-salas-76930-default-rtdb.firebaseio.com",
    projectId: "reserva-salas-76930",
    storageBucket: "reserva-salas-76930.firebasestorage.app",
    messagingSenderId: "368015832793",
    appId: "1:368015832793:web:1ca2ca6ee9649b96e1f0c8",
    measurementId: "G-6HQS9G0RNC"
};

// Inicializando Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Função para adicionar reserva
document.getElementById("reservar").addEventListener("click", () => {
    const nome = document.getElementById("nome").value;
    const data = document.getElementById("data").value;
    const horario = document.getElementById("horario").value;
    const sala = document.getElementById("sala").value;

    if (!nome || !data || !horario || !sala) {
        alert("Por favor, preencha todos os campos!");
        return;
    }

    // Criar um ID único para a reserva
    const reservaId = `${data}-${horario}-${sala}`;

    const reservaData = {
        nome: nome,
        data: data,
        horario: horario,
        sala: sala
    };

    // Salvando a reserva no banco de dados
    database.ref('reservas/' + reservaId).set(reservaData)
        .then(() => {
            alert("Reserva realizada com sucesso!");
            loadHistorico();
        })
        .catch(error => {
            alert("Erro ao realizar reserva: " + error.message);
        });
});

// Função para carregar o histórico de reservas
function loadHistorico() {
    const reservaList = document.getElementById("lista-reservas");
    reservaList.innerHTML = "";
    
    database.ref('reservas').once('value', (snapshot) => {
        const reservas = snapshot.val();
        for (const key in reservas) {
            const reserva = reservas[key];
            const li = document.createElement("li");
            li.textContent = `${reserva.nome} - ${reserva.data} ${reserva.horario} - ${reserva.sala}`;
            reservaList.appendChild(li);
        }
    });
}

// Carregar histórico ao abrir a página
window.onload = loadHistorico;
