document.addEventListener("DOMContentLoaded", () => {
    // Coordenadas e Chave de API (A mesma da Home)
    let lat = -8.0476;
    let lon = -34.8770;
    const apiKey = "0fe821307584f0b179775e10ac3b780d";

    // Inicialização do Mapa Leaflet
    const mapa = L.map("mapa").setView([lat, lon], 12);

    // Camada Gratuita do OpenStreetMap
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapa);

    // Marcador inicial
    let marcador = L.marker([lat, lon]).addTo(mapa);

    // Buscar clima inicial para Recife ao carregar a página
    buscarClimaPorCoordenadas(lat, lon);

    // Evento de Clique no Mapa (Busca direta por Coordenadas)
    mapa.on("click", (e) => {
        const novaLat = e.latlng.lat;
        const novaLon = e.latlng.lng;

        // Atualiza a posição do marcador imediatamente
        marcador.setLatLng([novaLat, novaLon]);

        // Busca o clima utilizando a latitude e longitude exatas do clique
        buscarClimaPorCoordenadas(novaLat, novaLon);
    });

    // Eventos da Barra de Busca (Busca por Nome da Cidade digitada)
    const btnBusca = document.getElementById("search-btn");
    const inputBusca = document.getElementById("search-input");

    if (btnBusca && inputBusca) {
        btnBusca.addEventListener("click", () => {
            const cidade = inputBusca.value.trim();
            if (cidade) buscarClimaPorNome(cidade);
        });

        inputBusca.addEventListener("keyup", (event) => {
            if (event.key === "Enter") {
                const cidade = inputBusca.value.trim();
                if (cidade) buscarClimaPorNome(cidade);
            }
        });
    }

    // 1. Função de busca por Coordenadas (Usada ao clicar no mapa)
    async function buscarClimaPorCoordenadas(latitude, longitude) {
        try {
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&lang=pt_br&appid=${apiKey}`;
            
            const response = await fetch(url);
            const data = await response.json();

            if (data.cod === 200) {
                processarDadosClima(data, latitude, longitude);
            } else {
                console.error("Erro ao buscar clima por coordenadas.");
            }
        } catch (error) {
            console.error("Erro na requisição do clima:", error);
        }
    }

    // 2. Função de busca por Nome (Usada ao digitar na barra de pesquisa)
    async function buscarClimaPorNome(cidade) {
        try {
            const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cidade)}&units=metric&lang=pt_br&appid=${apiKey}`;
            
            const response = await fetch(url);
            const data = await response.json();

            if (data.cod === 200) {
                const coordLat = data.coord.lat;
                const coordLon = data.coord.lon;

                // Move o mapa e o marcador para a cidade pesquisada
                mapa.setView([coordLat, coordLon], 12);
                marcador.setLatLng([coordLat, coordLon]);

                processarDadosClima(data, coordLat, coordLon);
            } else {
                alert("Cidade não encontrada.");
            }
        } catch (error) {
            console.error("Erro ao buscar clima por nome:", error);
        }
    }

    // Função central para atualizar a interface com os dados recebidos da API
    function processarDadosClima(data, latitude, longitude) {
        const { name } = data;
        const { icon, description } = data.weather[0];
        const { temp, humidity } = data.main;
        const { speed } = data.wind;

        // Formatação da descrição com a primeira letra maiúscula
        const descricaoFormatada = description.charAt(0).toUpperCase() + description.slice(1);

        // Atualiza os elementos HTML da página de monitoramento
        document.getElementById("cidade-nome").textContent = "Clima em " + name;
        document.getElementById("temperatura").textContent = temp.toFixed(1) + "°C";
        document.getElementById("clima-descricao").textContent = descricaoFormatada;
        document.getElementById("clima-icone").src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
        document.getElementById("clima-umidade").textContent = `Umidade: ${humidity}%`;
        document.getElementById("clima-vento").textContent = `Velocidade do vento: ${speed} km/h`;
        document.getElementById("clima-coordenadas").textContent = `Lat: ${latitude.toFixed(2)} | Lon: ${longitude.toFixed(2)}`;
    }

    /* Função de Logout */
    const btnSair = document.querySelector("#btn-sair");
    if (btnSair) {
        btnSair.addEventListener("click", function (event) {
            event.preventDefault();
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = "index.html";
        });
    }
});