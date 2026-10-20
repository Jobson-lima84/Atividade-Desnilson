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
