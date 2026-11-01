/* Funções da Pág. Home */

// Objeto para gerenciamento do Clima via OpenWeatherMap
let clima = {
  "apikey": "0fe821307584f0b179775e10ac3b780d",
  fetchClima: function (cidade) {
    // MUDANÇA 1: Adicionado "&lang=pt_br" no final da URL para pedir a tradução à API
    fetch("https://api.openweathermap.org/data/2.5/weather?q="
      + cidade
      + "&units=metric&lang=pt_br&appid="
      + this.apikey
    )
      .then((response) => response.json())
      .then((data) => this.displayClima(data));
  },

  displayClima: function (data) {
    const { name } = data;
    const { icon, description } = data.weather[0];
    const { temp, humidity } = data.main;
    const { speed } = data.wind;

    // MUDANÇA 2: Deixamos a primeira letra da descrição maiúscula automaticamente (Ex: "céu limpo" vira "Céu limpo")
    const descricaoFormatada = description.charAt(0).toUpperCase() + description.slice(1);

    document.querySelector(".cidade").innerText = "Clima em " + name;
    document.querySelector(".icon").src = "https://openweathermap.org/img/wn/" + icon + ".png";
    document.querySelector(".descricao").innerText = descricaoFormatada;
    document.querySelector(".temp").innerText = temp.toFixed(1) + "°C"; // Opcional: arredonda a temperatura se quiser
    document.querySelector(".umidade").innerText = "Umidade: " + humidity + "%";
    document.querySelector(".vento").innerText = "Velocidade do vento: " + speed + " km/h";
    document.querySelector(".clima").classList.remove("carregando");
  },

  search: function () {
    this.fetchClima(document.querySelector(".search-bar").value);
  }
};

// Eventos de Busca por Clima
document.querySelector(".butao").addEventListener("click", function () {
  clima.search();
});

document.querySelector(".search-bar").addEventListener("keyup", function (event) {
  if (event.key == "Enter") {
    clima.search();
  }
});

// Inicialização da busca com valor padrão
clima.fetchClima("Recife");


/* Função de Logout */
function fazerLogout(event) {
  // Limpa os dados armazenados de sessão do usuário
  localStorage.clear();
  sessionStorage.clear();

  // Redireciona explicitamente para a tela de login
  window.location.href = "index.html";
}

// Vincula o evento de logout ao botão "Sair"
const btnSair = document.querySelector("#btn-sair");
if (btnSair) {
  btnSair.addEventListener("click", function (event) {
    event.preventDefault(); // Evita comportamento nativo antes de limpar a sessão
    fazerLogout(event);
  });
}

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCuGDSIIpHCyOqsS-9hIWHQh6S40lT-1Es",
  authDomain: "site-olho-no-tempo.firebaseapp.com",
  projectId: "site-olho-no-tempo",
  storageBucket: "site-olho-no-tempo.firebasestorage.app",
  messagingSenderId: "151682343947",
  appId: "1:151682343947:web:397e8a2bdf614ff71a930e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Monitora o estado da sessão e preenche o nome do usuário
onAuthStateChanged(auth, (user) => {
  if (!user) {
    // Se não houver usuário logado, redireciona de volta para o login
    window.location.href = "index.html";
  } else {
    // Usuário está logado, vamos buscar o nome cadastrado (displayName)
    const nomeCompleto = user.displayName;
    const elementoSaudacao = document.getElementById('saudacaoUsuario');

    if (elementoSaudacao) {
      if (nomeCompleto) {
        elementoSaudacao.innerText = `Seja bem-vindo, ${nomeCompleto}!`;
      } else {
        elementoSaudacao.innerText = `Seja bem-vindo!`;
      }
    }
  }
});

// Ação do Botão Sair
document.addEventListener('DOMContentLoaded', () => {
  const btnSair = document.getElementById('btn-sair');
  if (btnSair) {
    btnSair.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await signOut(auth);
        localStorage.removeItem('usuario_logado');
        window.location.href = "index.html";
      } catch (error) {
        console.error("Erro ao terminar sessão:", error);
      }
    });
  }
});