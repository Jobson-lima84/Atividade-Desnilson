import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getAuth,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCuGDSIIpHCyOqsS-9hIWHQh6S40lT-1Es",
  authDomain: "site-olho-no-tempo.firebaseapp.com",
  projectId: "site-olho-no-tempo",
  storageBucket: "site-olho-no-tempo.firebasestorage.app",
  messagingSenderId: "151682343947",
  appId: "1:151682343947:web:397e8a2bdf614ff71a930e",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const apiKey = "0fe821307584f0b179775e10ac3b780d";

// 1. Geocodificação por Bairro/Cidade + Estado via Nominatim (OpenStreetMap)
async function buscarLocalidadePorBairroOuCidade(
  termoBusca,
  estadoSelecionado,
) {
  try {
    const queryCompleta = `${termoBusca}, ${estadoSelecionado}, Brasil`;
    const urlGeo = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&countrycodes=br&limit=5&q=${encodeURIComponent(queryCompleta)}`;

    const response = await fetch(urlGeo, {
      headers: {
        "Accept-Language": "pt-BR",
      },
    });
    const resultados = await response.json();

    if (resultados && resultados.length > 0) {
      const localEncontrado =
        resultados.find(
          (item) =>
            item.address &&
            item.address.state &&
            item.address.state.toLowerCase() ===
              estadoSelecionado.toLowerCase(),
        ) || resultados[0];

      const coordLat = parseFloat(localEncontrado.lat);
      const coordLon = parseFloat(localEncontrado.lon);

      const addr = localEncontrado.address || {};
      const bairro =
        addr.suburb || addr.neighbourhood || addr.quarter || addr.residential;
      const cidade =
        addr.city || addr.town || addr.municipality || addr.village;

      let nomeFormatado = termoBusca;
      if (bairro && cidade && bairro.toLowerCase() !== cidade.toLowerCase()) {
        nomeFormatado = `${bairro}, ${cidade}`;
      } else if (cidade) {
        nomeFormatado = cidade;
      } else if (bairro) {
        nomeFormatado = `${bairro}, ${estadoSelecionado}`;
      }

      buscarClimaPorCoordenadas(coordLat, coordLon, nomeFormatado);
    } else {
      alert(
        `Não foi possível encontrar "${termoBusca}" em ${estadoSelecionado}. Verifique a ortografia ou tente incluir o nome da cidade.`,
      );
    }
  } catch (error) {
    console.error("Erro ao geocodificar bairro/cidade:", error);
    alert("Erro ao buscar a localização. Tente novamente.");
  }
}

// 2. Busca o clima pelas coordenadas exatas
async function buscarClimaPorCoordenadas(
  latitude,
  longitude,
  nomePersonalizado = null,
) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&lang=pt_br&appid=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.cod === 200) {
      displayClima(data, nomePersonalizado);
    } else {
      console.error("Erro ao buscar clima por coordenadas.");
    }
  } catch (error) {
    console.error("Erro na requisição do clima:", error);
  }
}

function displayClima(data, nomePersonalizado = null) {
  const { name } = data;
  const { icon, description } = data.weather[0];
  const { temp, humidity } = data.main;
  const { speed } = data.wind;

  const descricaoFormatada =
    description.charAt(0).toUpperCase() + description.slice(1);
  const nomeLocal = nomePersonalizado || name;
  const ventoKmh = (speed * 3.6).toFixed(1);

  document.querySelector(".cidade").innerText = "Clima em " + nomeLocal;
  document.querySelector(".icon").src =
    "https://openweathermap.org/img/wn/" + icon + ".png";
  document.querySelector(".descricao").innerText = descricaoFormatada;
  document.querySelector(".temp").innerText = temp.toFixed(1) + "°C";
  document.querySelector(".umidade").innerText = "Umidade: " + humidity + "%";
  document.querySelector(".vento").innerText =
    "Velocidade do vento: " + ventoKmh + " km/h";
  document.querySelector(".clima").classList.remove("carregando");
}

function executarBusca() {
  const inputBusca = document.querySelector(".search-bar");
  const selectEstado = document.getElementById("estado-select");
  const termo = inputBusca ? inputBusca.value.trim() : "";
  const estado = selectEstado ? selectEstado.value : "Pernambuco";

  if (termo) {
    buscarLocalidadePorBairroOuCidade(termo, estado);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const btnBusca = document.querySelector(".butao");
  const inputBusca = document.querySelector(".search-bar");

  if (btnBusca) {
    btnBusca.addEventListener("click", executarBusca);
  }

  if (inputBusca) {
    inputBusca.addEventListener("keyup", (event) => {
      if (event.key === "Enter") {
        executarBusca();
      }
    });
  }

  // Carrega Recife inicialmente
  buscarClimaPorCoordenadas(-8.0476, -34.877, "Recife, PE");

  // Ação do Botão Sair
  const btnSair = document.getElementById("btn-sair");
  if (btnSair) {
    btnSair.addEventListener("click", async (e) => {
      e.preventDefault();
      try {
        await signOut(auth);
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "index.html";
      } catch (error) {
        console.error("Erro ao terminar sessão:", error);
      }
    });
  }
});

// Monitora o estado da sessão e preenche o nome do usuário
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "index.html";
  } else {
    const nomeCompleto = user.displayName;
    const elementoSaudacao = document.getElementById("saudacaoUsuario");

    if (elementoSaudacao) {
      elementoSaudacao.innerText = nomeCompleto
        ? `Seja bem-vindo, ${nomeCompleto}!`
        : "Seja bem-vindo!";
    }
  }
});
