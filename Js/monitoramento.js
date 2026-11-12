document.addEventListener("DOMContentLoaded", () => {
    let lat = -8.0476;
    let lon = -34.8770;
    const apiKey = "0fe821307584f0b179775e10ac3b780d";

    const mapa = L.map("mapa").setView([lat, lon], 12);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapa);

    let marcador = L.marker([lat, lon]).addTo(mapa);

    // Carrega Recife inicialmente
    buscarClimaPorCoordenadas(lat, lon, "Recife, PE");

    // Clique direto no mapa
    mapa.on("click", (e) => {
        const novaLat = e.latlng.lat;
        const novaLon = e.latlng.lng;

        marcador.setLatLng([novaLat, novaLon]);
        buscarClimaPorCoordenadas(novaLat, novaLon);
    });

    // Elementos de busca
    const btnBusca = document.getElementById("search-btn");
    const inputBusca = document.getElementById("search-input");
    const selectEstado = document.getElementById("estado-select");

    if (btnBusca && inputBusca) {
        btnBusca.addEventListener("click", () => {
            const termo = inputBusca.value.trim();
            const estado = selectEstado ? selectEstado.value : "Pernambuco";
            if (termo) buscarLocalidadePorBairroOuCidade(termo, estado);
        });

        inputBusca.addEventListener("keyup", (event) => {
            if (event.key === "Enter") {
                const termo = inputBusca.value.trim();
                const estado = selectEstado ? selectEstado.value : "Pernambuco";
                if (termo) buscarLocalidadePorBairroOuCidade(termo, estado);
            }
        });
    }

    // 1. Geocodificação por Bairro + Estado via Nominatim (OpenStreetMap)
    async function buscarLocalidadePorBairroOuCidade(termoBusca, estadoSelecionado) {
        try {
            const queryCompleta = `${termoBusca}, ${estadoSelecionado}, Brasil`;
            const urlGeo = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&countrycodes=br&limit=5&q=${encodeURIComponent(queryCompleta)}`;

            const response = await fetch(urlGeo, {
                headers: {
                    "Accept-Language": "pt-BR"
                }
            });
            const resultados = await response.json();

            if (resultados && resultados.length > 0) {
                // Filtra para garantir que pertence ao estado escolhido
                const localEncontrado = resultados.find(item =>
                    item.address &&
                    item.address.state &&
                    item.address.state.toLowerCase() === estadoSelecionado.toLowerCase()
                ) || resultados[0];

                const coordLat = parseFloat(localEncontrado.lat);
                const coordLon = parseFloat(localEncontrado.lon);

                // Monta o nome preciso (Bairro + Cidade) a partir dos metadados do endereço
                const addr = localEncontrado.address || {};
                const bairro = addr.suburb || addr.neighbourhood || addr.quarter || addr.residential;
                const cidade = addr.city || addr.town || addr.municipality || addr.village;

                let nomeFormatado = termoBusca;
                if (bairro && cidade && bairro.toLowerCase() !== cidade.toLowerCase()) {
                    nomeFormatado = `${bairro}, ${cidade}`;
                } else if (cidade) {
                    nomeFormatado = cidade;
                } else if (bairro) {
                    nomeFormatado = `${bairro}, ${estadoSelecionado}`;
                }

                // Aproxima o zoom no bairro encontrado (nível 14) e move o marcador
                mapa.setView([coordLat, coordLon], 14);
                marcador.setLatLng([coordLat, coordLon]);

                // Busca o clima nas coordenadas exatas do bairro
                buscarClimaPorCoordenadas(coordLat, coordLon, nomeFormatado);
            } else {
                alert(`Não foi possível encontrar "${termoBusca}" em ${estadoSelecionado}. Verifique a ortografia ou tente incluir o nome da cidade.`);
            }
        } catch (error) {
            console.error("Erro ao geocodificar bairro/cidade:", error);
            alert("Erro ao buscar a localização. Tente novamente.");
        }
    }

    // 2. Busca o clima pelas coordenadas exatas
    async function buscarClimaPorCoordenadas(latitude, longitude, nomePersonalizado = null) {
        try {
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&lang=pt_br&appid=${apiKey}`;
            const response = await fetch(url);
            const data = await response.json();

            if (data.cod === 200) {
                processarDadosClima(data, latitude, longitude, nomePersonalizado);
            } else {
                console.error("Erro ao buscar clima por coordenadas.");
            }
        } catch (error) {
            console.error("Erro na requisição do clima:", error);
        }
    }

    // Gera o ícone animado personalizado diferenciando Dia (d) e Noite (n)
    function criarIconeClimaAnimado(weatherId, iconCode, temp) {
        let classeTema = "sol-ameno";
        let svgConteudo = "";
        const isNoite = iconCode && iconCode.endsWith("n");

        // 1. Chuva Forte / Tempestade
        if ((weatherId >= 200 && weatherId <= 232) || [502, 503, 504, 522, 531].includes(weatherId)) {
            classeTema = "chuva-forte";
            svgConteudo = `
                <svg class="weather-svg" viewBox="0 0 48 48">
                    <path class="cloud-float" d="M14 27h20a7 7 0 0 0 1-13.9A10 10 0 0 0 16 11a8 8 0 0 0-2 16z" fill="#ffffff"/>
                    <polygon class="lightning-bolt" points="25,24 19,34 24,34 21,43 31,31 26,31" fill="#fde047"/>
                    <line class="rain-drop" x1="15" y1="29" x2="13" y2="37" stroke="#fca5a5" stroke-width="2.5" stroke-linecap="round"/>
                    <line class="rain-drop" x1="33" y1="29" x2="31" y2="37" stroke="#fca5a5" stroke-width="2.5" stroke-linecap="round"/>
                </svg>
            `;
        }
        // 2. Chuva Leve / Garoa
        else if ((weatherId >= 300 && weatherId <= 321) || (weatherId >= 500 && weatherId <= 531)) {
            classeTema = "chuva-leve";
            svgConteudo = `
                <svg class="weather-svg" viewBox="0 0 48 48">
                    <path class="cloud-float" d="M14 27h20a7 7 0 0 0 1-13.9A10 10 0 0 0 16 11a8 8 0 0 0-2 16z" fill="#e0f2fe"/>
                    <line class="rain-drop" x1="17" y1="29" x2="15" y2="36" stroke="#7dd3fc" stroke-width="2.5" stroke-linecap="round"/>
                    <line class="rain-drop" x1="28" y1="29" x2="26" y2="36" stroke="#7dd3fc" stroke-width="2.5" stroke-linecap="round"/>
                </svg>
            `;
        }
        // 3. Frio ou Neve
        else if ((weatherId >= 600 && weatherId <= 622) || weatherId === 511 || temp <= 16) {
            classeTema = "frio";
            svgConteudo = `
                <svg class="weather-svg" viewBox="0 0 48 48">
                    <path class="cloud-float" d="M14 25h20a6.5 6.5 0 0 0 1-12.9A9.5 9.5 0 0 0 16 10a7.5 7.5 0 0 0-2 15z" fill="#e0f2fe"/>
                    <circle class="snow-flake" cx="19" cy="30" r="2.2" fill="#ffffff"/>
                    <circle class="snow-flake" cx="29" cy="30" r="2.2" fill="#a5f3fc"/>
                </svg>
            `;
        }
        // 4. Nublado / Névoa
        else if ((weatherId >= 801 && weatherId <= 804) || (weatherId >= 701 && weatherId <= 781)) {
            classeTema = "nublado";
            svgConteudo = `
                <svg class="weather-svg" viewBox="0 0 48 48">
                    <path class="cloud-float" d="M12 32h22a6.5 6.5 0 0 0 1-12.9A9.5 9.5 0 0 0 16 17a7.5 7.5 0 0 0-4 15z" fill="#f8fafc"/>
                </svg>
            `;
        }
        // 5. Céu Limpo (Dia vs Noite)
        else {
            if (isNoite) {
                classeTema = "noite-limpa";
                svgConteudo = `
                    <svg class="weather-svg" viewBox="0 0 48 48">
                        <path d="M26 10a11 11 0 1 0 12 15 12 12 0 0 1-12-15z" fill="#e2e8f0"/>
                        <circle cx="14" cy="16" r="1.5" fill="#fde047" class="rain-drop"/>
                        <circle cx="18" cy="32" r="1.2" fill="#ffffff" class="snow-flake"/>
                    </svg>
                `;
            } else {
                const isCalorForte = temp >= 29;
                classeTema = isCalorForte ? "sol-forte" : "sol-ameno";
                const corSol = isCalorForte ? "#fef08a" : "#fde047";

                svgConteudo = `
                    <svg class="weather-svg" viewBox="0 0 48 48">
                        <g class="sun-rays" stroke="${corSol}" stroke-width="3" stroke-linecap="round">
                            <line x1="24" y1="5" x2="24" y2="10"/>
                            <line x1="24" y1="38" x2="24" y2="43"/>
                            <line x1="5" y1="24" x2="10" y2="24"/>
                            <line x1="38" y1="24" x2="43" y2="24"/>
                        </g>
                        <circle class="sun-core" cx="24" cy="24" r="9.5" fill="${corSol}"/>
                    </svg>
                `;
            }
        }

        return L.divIcon({
            className: "custom-weather-pin",
            html: `
                <div class="weather-marker-wrapper ${classeTema}">
                    <div class="weather-pulse"></div>
                    <div class="weather-badge">
                        ${svgConteudo}
                    </div>
                    <div class="weather-pointer"></div>
                </div>
            `,
            iconSize: [64, 64],
            iconAnchor: [32, 62],
            popupAnchor: [0, -60]
        });
    }

    function processarDadosClima(data, latitude, longitude, nomePersonalizado = null) {
        const { name } = data;
        const { id: weatherId, icon, description } = data.weather[0];
        const { temp, humidity } = data.main;
        const { speed } = data.wind;

        const descricaoFormatada = description.charAt(0).toUpperCase() + description.slice(1);
        const ventoKmh = (speed * 3.6).toFixed(1);
        const nomeLocal = nomePersonalizado || name || "Área Selecionada";

        document.getElementById("cidade-nome").textContent = "Clima em " + nomeLocal;
        document.getElementById("temperatura").textContent = temp.toFixed(1) + "°C";
        document.getElementById("clima-descricao").textContent = descricaoFormatada;
        document.getElementById("clima-icone").src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
        document.getElementById("clima-umidade").textContent = `Umidade: ${humidity}%`;
        document.getElementById("clima-vento").textContent = `Velocidade do Vento: ${ventoKmh} km/h`;
        document.getElementById("clima-coordenadas").textContent = `Lat: ${latitude.toFixed(4)} | Lon: ${longitude.toFixed(4)}`;

        const iconeAnimado = criarIconeClimaAnimado(weatherId, icon, temp);
        marcador.setIcon(iconeAnimado);
        marcador.bindPopup(`<b>${nomeLocal}</b><br>${temp.toFixed(1)}°C — ${descricaoFormatada}`).openPopup();
    }

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