/*Funções da Pagina Home*/
let clima = {
  "apikey": "0fe821307584f0b179775e10ac3b780d",
  fetchClima: function (cidade) {
    fetch("https://api.openweathermap.org/data/2.5/weather?q="
      + cidade
      + "&units=metric&appid="
      + this.apiKey
    )
      .then((response) => response.json())
      .then((data) => this.displayClima(data));
  },

  displayClima: function(data) {
    const { name } = data;
    const { icon, description } = data.weather[0];
    const { temp, humidity } = data.main;
    const { speed } = data.wind;
    console.log(name,icon,description,temp,humidity,speed);
    document.querySelector(".cidade").innerText = "Clima em " + name;
    document.querySelector(".icon").src = "https://openweathermap.org/img/wn/" + icon + ".png";
    document.querySelector(".descricao").innerText = description;
    document.querySelector(".temp").innerText = temp + "°C";
    document.querySelector(".umidade").innerText = "Umidade: " + humidity + "%";
    document.querySelector(".vento").innerText = "Velocidade do vento: " + speed + " km/h";
  }
};