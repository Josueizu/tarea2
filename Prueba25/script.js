class CardGame {
  constructor() {
    this.START_GAME_API = 'https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1';
    this.DRAW_CARD_API = 'https://deckofcardsapi.com/api/deck/';

    this.deckId = null;
    this.jugadorPuntos = 0;
    this.maquinaPuntos = 0;
    this.partidasJugadas = 0;
    this.resultados = [];

    this.init();
  }

  init() {
    this.registerEventListeners();
    this.obtenerNuevaBaraja().then(() => {
      this.habilitarBotones();
    });
  }

  registerEventListeners() {
    document.getElementById('iniciar-btn').addEventListener('click', () => this.iniciarJuego());
    document.getElementById('otra-carta-btn').addEventListener('click', () => this.jugarOtraCarta());
    document.getElementById('finalizar-btn').addEventListener('click', () => this.turnoMaquina());
    document.getElementById('jugar-nuevo-btn').addEventListener('click', () => this.jugarDeNuevo());
  }
  
  obtenerNuevaBaraja() {
    return fetch(this.START_GAME_API)
      .then(response => response.json())
      .then(data => {
        this.deckId = data.deck_id;
      });
  }

  obtenerCarta() {
    return fetch(`${this.DRAW_CARD_API}${this.deckId}/draw/?count=1`)
      .then(response => response.json())
      .then(data => {
        const carta = data.cards[0];
        let valor = this.obtenerValorCarta(carta.value);
        return {
          valor,
          palo: carta.suit,
          imagen: carta.image
        };
      });
  }

  obtenerValorCarta(valor) {
    if (valor === 'KING' || valor === 'QUEEN' || valor === 'JACK') {
      return 10;
    } else if (valor === 'ACE') {
      return 1;
    } else {
      return parseInt(valor);
    }
  }

  mostrarCarta(jugador, carta) {
    const cartasDiv = document.getElementById(`${jugador}-cartas`);
    const puntosSpan = document.getElementById(`${jugador}-puntos`);

    const cartaImg = document.createElement('img');
    cartaImg.src = carta.imagen;
    cartasDiv.appendChild(cartaImg);

    if (jugador === 'jugador') {
      this.jugadorPuntos += carta.valor;
      puntosSpan.textContent = this.jugadorPuntos;
    } else {
      this.maquinaPuntos += carta.valor;
      puntosSpan.textContent = this.maquinaPuntos;
    }
  }

  deshabilitarBotones() {
    document.getElementById('iniciar-btn').disabled = true;
    document.getElementById('otra-carta-btn').disabled = true;
    document.getElementById('finalizar-btn').disabled = true;
    document.getElementById('jugar-nuevo-btn').disabled = false;
  }

  habilitarBotones() {
    document.getElementById('iniciar-btn').disabled = false;
    document.getElementById('otra-carta-btn').disabled = false;
    document.getElementById('finalizar-btn').disabled = false;
    document.getElementById('jugar-nuevo-btn').disabled = true;
  }

  iniciarJuego() {
    this.obtenerNuevaBaraja().then(() => {
      this.jugadorPuntos = 0;
      this.maquinaPuntos = 0;
  
      document.getElementById('jugador-cartas').innerHTML = '';
      document.getElementById('maquina-cartas').innerHTML = '';
      document.getElementById('jugador-puntos').textContent = '0';
      document.getElementById('maquina-puntos').textContent = '0';
      document.getElementById('resultado').textContent = '';
  
      this.habilitarBotones();
  
      for (let i = 0; i < 2; i++) {
        this.obtenerCarta().then(carta => {
          this.mostrarCarta('jugador', carta);
        });
      }

      for (let i = 0; i < 2; i++) {
        this.obtenerCarta().then(carta => {
          this.mostrarCarta('maquina', carta);
        });
      }
    });
  }
  

  jugarOtraCarta() {
    this.obtenerCarta().then(carta => {
      this.mostrarCarta('jugador', carta);
      if (this.jugadorPuntos > 21) {
        console.log('Has perdido. Te has pasado de 21.');
        this.deshabilitarBotones();
        document.getElementById('resultado').textContent = 'Has perdido. Te has pasado de 21.';
        this.determinarGanador();
      }
    });
  }

  turnoMaquina() {
    if (this.maquinaPuntos < 17) {
      this.obtenerCarta().then(carta => {
        this.mostrarCarta('maquina', carta);
        if (this.maquinaPuntos > 21) {
          console.log('La máquina ha perdido. Se ha pasado de 21.');
          this.deshabilitarBotones();
          document.getElementById('resultado').textContent = 'La máquina ha perdido. Se ha pasado de 21.';
          this.determinarGanador();
        } else {
          this.turnoMaquina();
        }
      });
    } else {
      this.determinarGanador();
    }
  }

  determinarGanador() {
    if (this.jugadorPuntos > 21) {
      console.log('Has perdido. Te has pasado de 21.');
      document.getElementById('resultado').textContent = 'Has perdido. Te has pasado de 21.';
    } else if (this.maquinaPuntos > 21) {
      console.log('La máquina ha perdido. Se ha pasado de 21.');
      document.getElementById('resultado').textContent = 'La máquina ha perdido. Se ha pasado de 21.';
    } else if (this.jugadorPuntos > this.maquinaPuntos) {
      console.log('¡Has ganado!');
      document.getElementById('resultado').textContent = '¡Has ganado!';
    } else if (this.maquinaPuntos > this.jugadorPuntos) {
      console.log('La máquina ha ganado.');
      document.getElementById('resultado').textContent = 'La máquina ha ganado.';
    } else {
      console.log('Empate.');
      document.getElementById('resultado').textContent = 'Empate.';
    }

    const resultadoPartida = document.getElementById('resultado').textContent;
    this.resultados.push({
      jugadorPuntos: this.jugadorPuntos,
      maquinaPuntos: this.maquinaPuntos,
      resultado: resultadoPartida,
      fechaHora: this.obtenerFechaHoraActual()
    });

    this.mostrarEstadisticas();
    this.deshabilitarBotones();
  }

  obtenerFechaHoraActual() {
    const fechaHoraActual = new Date();
    const fecha = fechaHoraActual.toLocaleDateString();
    const hora = fechaHoraActual.toLocaleTimeString();
    return `${fecha} ${hora}`;
  }

  mostrarEstadisticas() {
    const estadisticasDiv = document.getElementById('estadisticas');
    estadisticasDiv.innerHTML = '';
  
    const tablaGeneral = document.createElement('table');
    tablaGeneral.innerHTML = `
      <tr>
        <th>Partidas Jugadas</th>
        <th>Ganadas</th>
        <th>Empatadas</th>
        <th>Perdidas</th>
      </tr>
      <tr>
        <td>${this.partidasJugadas}</td>
        <td>${this.resultados.filter(resultado => resultado.resultado === '¡Has ganado!').length}</td>
        <td>${this.resultados.filter(resultado => resultado.resultado === 'Empate.').length}</td>
        <td>${this.resultados.filter(resultado => resultado.resultado === 'Has perdido. Te has pasado de 21.' || resultado.resultado === 'La máquina ha ganado.').length}</td>
      </tr>
    `;
  
    estadisticasDiv.appendChild(tablaGeneral);
  
    const estadisticasPartidasDiv = document.getElementById('estadisticas-partidas');
    estadisticasPartidasDiv.innerHTML = '';
  
    const limiteResultados = 5;
    if (this.resultados.length > limiteResultados) {
      this.resultados = this.resultados.slice(this.resultados.length - limiteResultados);
    }
  
    const tablaPartidas = document.createElement('table');
    tablaPartidas.id = 'tabla-partidas';
    tablaPartidas.innerHTML = `
      <tr>
        <th>Partida</th>
        <th>Jugador Puntos</th>
        <th>Máquina Puntos</th>
        <th>Resultado</th>
        <th>Fecha y Hora</th>
      </tr>
    `;
  
    for (let i = 0; i < this.resultados.length; i++) {
      const partida = this.resultados[i];
      const fila = document.createElement('tr');
      fila.innerHTML = `
        <td>${i + 1}</td>
        <td>${partida.jugadorPuntos}</td>
        <td>${partida.maquinaPuntos}</td>
        <td>${partida.resultado}</td>
        <td>${partida.fechaHora}</td>
      `;
      tablaPartidas.appendChild(fila);
    }
  
    estadisticasPartidasDiv.appendChild(tablaPartidas);
  }
  
  

  jugarDeNuevo() {
    this.partidasJugadas++;
    this.jugadorPuntos = 0;
    this.maquinaPuntos = 0;

    document.getElementById('jugador-cartas').innerHTML = '';
    document.getElementById('maquina-cartas').innerHTML = '';
    document.getElementById('jugador-puntos').textContent = '0';
    document.getElementById('maquina-puntos').textContent = '0';
    document.getElementById('resultado').textContent = '';

    this.habilitarBotones();
  }
}

const loader = document.getElementById('loader');

function showLoader() {
  loader.classList.remove('hidden');
}

function hideLoader() {
  loader.classList.add('hidden');
}

function performAction() {
  showLoader();
  hideLoader();
}


new CardGame();
