function inicializarTeclado(callbacks) {
  const teclas = {
    cima: false,
    baixo: false,
    esquerda: false,
    direita: false
  };

  document.addEventListener("keydown", (e) => {
    switch (e.code) {
      case "ArrowUp":
        teclas.cima = true;
        break;
      case "ArrowDown":
        teclas.baixo = true;
        break;
      case "ArrowLeft":
        teclas.esquerda = true;
        break;
      case "ArrowRight":
        teclas.direita = true;
        break;
      case "Space":
        callbacks.onEspaco && callbacks.onEspaco();
        break;
    }
  });

  document.addEventListener("keyup", (e) => {
    switch (e.code) {
      case "ArrowUp":
        teclas.cima = false;
        break;
      case "ArrowDown":
        teclas.baixo = false;
        break;
      case "ArrowLeft":
        teclas.esquerda = false;
        break;
      case "ArrowRight":
        teclas.direita = false;
        break;
    }
  });

  // envia o objeto de teclas continuamente
  function atualizarTeclas() {
    callbacks.onMover && callbacks.onMover(teclas);
    requestAnimationFrame(atualizarTeclas);
  }

  atualizarTeclas(); // inicia o loop
}
