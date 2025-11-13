// lakePuzzle.js
// Puzzle do Lago — versão com duas caixas (área de montagem + peças soltas)

const LakePuzzle = (function () {
  const state = {
    x: 0, y: 0, w: 200, h: 200,
    orientationVisible: true,
    completed: false,
    modalOpen: false,
    dom: null
  };

  const ROWS = 4;
  const COLS = 4;
  const IMAGE_PATHS = [
    "assets/recorte_lago/row-1-column-1.png",
    "assets/recorte_lago/row-1-column-2.png",
    "assets/recorte_lago/row-1-column-3.png",
    "assets/recorte_lago/row-1-column-4.png",
    "assets/recorte_lago/row-2-column-1.png",
    "assets/recorte_lago/row-2-column-2.png",
    "assets/recorte_lago/row-2-column-3.png",
    "assets/recorte_lago/row-2-column-4.png",
    "assets/recorte_lago/row-3-column-1.png",
    "assets/recorte_lago/row-3-column-2.png",
    "assets/recorte_lago/row-3-column-3.png",
    "assets/recorte_lago/row-3-column-4.png",
    "assets/recorte_lago/row-4-column-1.png",
    "assets/recorte_lago/row-4-column-2.png",
    "assets/recorte_lago/row-4-column-3.png",
    "assets/recorte_lago/row-4-column-4.png"
  ];

  function createEl(tag, css = {}) {
    const e = document.createElement(tag);
    Object.assign(e.style, css);
    return e;
  }

  function createModal() {
    if (state.dom) return state.dom;

    const overlay = createEl("div", {
      position: "fixed", left: "0", top: "0", width: "100%", height: "100%",
      display: "flex", alignItems: "center", justifyContent: "center",
      backgroundColor: "rgba(0,0,0,0.8)", zIndex: 10000, visibility: "hidden"
    });

    const box = createEl("div", {
      background: "#111", border: "2px solid #ccc", borderRadius: "10px",
      padding: "16px", display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center",
      color: "white", fontFamily: "monospace", maxWidth: "1100px"
    });

    const title = createEl("h2", { width: "100%", textAlign: "center", margin: "0 0 8px 0" });
    title.innerText = "Monte a imagem da pedra do lago";

    const gridWrap = createEl("div", {
      position: "relative", width: "608px", height: "608px",
      background: "#222", border: "1px solid #333"
      
    });
        // desenha as grades de montagem (4x4)
    for (let r = 1; r < ROWS; r++) {
    const line = createEl("div", {
        position: "absolute",
        top: `${(608 / ROWS) * r}px`,
        left: "0",
        width: "100%",
        height: "1px",
        background: "rgba(255,255,255,0.1)"
    });
    gridWrap.appendChild(line);
    }

    for (let c = 1; c < COLS; c++) {
    const line = createEl("div", {
        position: "absolute",
        left: `${(608 / COLS) * c}px`,
        top: "0",
        width: "1px",
        height: "100%",
        background: "rgba(255,255,255,0.1)"
    });
    gridWrap.appendChild(line);
    }


    const scrambleWrap = createEl("div", {
      position: "relative", width: "400px", height: "608px",
      border: "1px dashed #333", background: "#191919"
    });

    const fecharBtn = document.createElement("button");
    fecharBtn.innerText = "Fechar";
    Object.assign(fecharBtn.style, {
      padding: "8px 14px", borderRadius: "6px", cursor: "pointer",
      border: "none", background: "#444", color: "white", width: "100px"
    });

    const bottom = createEl("div", {
      display: "flex", justifyContent: "center", width: "100%", marginTop: "10px"
    });
    bottom.appendChild(fecharBtn);

    box.appendChild(title);
    box.appendChild(gridWrap);
    box.appendChild(scrambleWrap);
    box.appendChild(bottom);
    overlay.appendChild(box);
    document.body.appendChild(overlay);

    // criar peças
    const pieceW = 608 / COLS;
    const pieceH = 608 / ROWS;

    const pieces = IMAGE_PATHS.map((src, i) => ({
      index: i, src, el: null
    }));

    const shuffled = pieces.slice().sort(() => Math.random() - 0.5);

    shuffled.forEach((p) => {
      const img = document.createElement("img");
      img.src = p.src;
      img.draggable = false;
      Object.assign(img.style, {
        position: "absolute",
        width: `${pieceW}px`,
        height: `${pieceH}px`,
        left: `${Math.random() * (scrambleWrap.clientWidth - pieceW)}px`,
        top: `${Math.random() * (scrambleWrap.clientHeight - pieceH)}px`,
        cursor: "grab",
        zIndex: 10
      });
      scrambleWrap.appendChild(img);
      makeDraggable(img, [scrambleWrap, gridWrap], p, pieceW, pieceH);
      p.el = img;
    });

    fecharBtn.addEventListener("click", hideModal);

    state.dom = { overlay, gridWrap, scrambleWrap, pieces };
    return state.dom;
  }

  

function makeDraggable(el, containers, piece, pieceW, pieceH) {
  let dragging = false,
      offsetX = 0,
      offsetY = 0,
      currentParent = containers[0];

  function getCanvasRect() {
    const c = document.getElementById("meu_canvas");
    return c ? c.getBoundingClientRect() : null;
  }

  el.addEventListener("mousedown", (e) => {
    if (el.fixed) return;
    dragging = true;
    el.style.cursor = "grabbing";
    el.style.zIndex = 1000;

    // calcula o offset RELATIVO ao parent atual (mantive seu cálculo)
    const parentRect = el.parentElement.getBoundingClientRect();
    const left = parseFloat(el.style.left || "0");
    const top = parseFloat(el.style.top || "0");
    offsetX = e.clientX - (parentRect.left + left);
    offsetY = e.clientY - (parentRect.top + top);

    // evita seleção de texto
    e.preventDefault();
  });

  window.addEventListener("mousemove", (e) => {
    if (!dragging) return;

    // 1) posição desejada em COORDENADAS GLOBAIS (tela)
    let desiredGlobalLeft = e.clientX - offsetX;
    let desiredGlobalTop  = e.clientY - offsetY;

    // 2) clamp no retângulo do canvas (impede sair do canvas)
    const canvasRect = getCanvasRect();
    if (canvasRect) {
      const minGL = canvasRect.left;
      const minGT = canvasRect.top;
      const maxGL = canvasRect.right - el.offsetWidth;
      const maxGT = canvasRect.bottom - el.offsetHeight;

      if (desiredGlobalLeft < minGL) desiredGlobalLeft = minGL;
      if (desiredGlobalTop  < minGT) desiredGlobalTop  = minGT;
      if (desiredGlobalLeft > maxGL) desiredGlobalLeft = maxGL;
      if (desiredGlobalTop  > maxGT) desiredGlobalTop  = maxGT;
    }

    // 3) converte para coordenadas do parent atual (mantendo liberdade de se mover "fora" do parent)
    const parentRect = el.parentElement.getBoundingClientRect();
    const newLeft = desiredGlobalLeft - parentRect.left;
    const newTop  = desiredGlobalTop  - parentRect.top;

    // NÃO travamos por parent aqui — assim a peça pode ficar parcialmente fora do parent
    el.style.left = `${newLeft}px`;
    el.style.top  = `${newTop}px`;
  });

  window.addEventListener("mouseup", (e) => {
    if (!dragging) return;
    dragging = false;
    el.style.cursor = "grab";
    el.style.zIndex = 10;

    const overContainer = containers.find(c => {
      const rect = c.getBoundingClientRect();
      return (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      );
    });

    if (overContainer) {
      // anexa ao container de destino
      overContainer.appendChild(el);

      const rect = overContainer.getBoundingClientRect();

      // calcula a posição final desejada em globais (mesma lógica do mousemove)
      let desiredGlobalLeft = e.clientX - offsetX;
      let desiredGlobalTop  = e.clientY - offsetY;

      // clamp pelo canvas também no soltar
      const canvasRect = getCanvasRect();
      if (canvasRect) {
        const minGL = canvasRect.left;
        const minGT = canvasRect.top;
        const maxGL = canvasRect.right - el.offsetWidth;
        const maxGT = canvasRect.bottom - el.offsetHeight;

        if (desiredGlobalLeft < minGL) desiredGlobalLeft = minGL;
        if (desiredGlobalTop  < minGT) desiredGlobalTop  = minGT;
        if (desiredGlobalLeft > maxGL) desiredGlobalLeft = maxGL;
        if (desiredGlobalTop  > maxGT) desiredGlobalTop  = maxGT;
      }

      let left = desiredGlobalLeft - rect.left;
      let top  = desiredGlobalTop  - rect.top;

      el.style.left = `${left}px`;
      el.style.top  = `${top}px`;
      currentParent = overContainer;

      // Encaixe na grade (comportamento original)
      if (overContainer === containers[1]) {
        const correctRow = Math.floor(piece.index / COLS);
        const correctCol = piece.index % COLS;
        const targetX = correctCol * pieceW;
        const targetY = correctRow * pieceH;
        const dist = Math.hypot(left - targetX, top - targetY);

        if (dist < 30) {
          el.style.left = `${targetX}px`;
          el.style.top = `${targetY}px`;
          el.fixed = true;
          el.style.cursor = "default";
          el.style.pointerEvents = "none";
          checkCompletion();
        }
      }
    } else {
      // se soltou fora de qualquer container, devolve pro primeiro container (com clamp pelo canvas)
      const parent = containers[0];
      parent.appendChild(el);
      const rect = parent.getBoundingClientRect();

      let desiredGlobalLeft = e.clientX - offsetX;
      let desiredGlobalTop  = e.clientY - offsetY;

      const canvasRect = getCanvasRect();
      if (canvasRect) {
        const minGL = canvasRect.left;
        const minGT = canvasRect.top;
        const maxGL = canvasRect.right - el.offsetWidth;
        const maxGT = canvasRect.bottom - el.offsetHeight;

        if (desiredGlobalLeft < minGL) desiredGlobalLeft = minGL;
        if (desiredGlobalTop  < minGT) desiredGlobalTop  = minGT;
        if (desiredGlobalLeft > maxGL) desiredGlobalLeft = maxGL;
        if (desiredGlobalTop  > maxGT) desiredGlobalTop  = maxGT;
      }

      let left = desiredGlobalLeft - rect.left;
      let top  = desiredGlobalTop  - rect.top;

      el.style.left = `${left}px`;
      el.style.top  = `${top}px`;
      currentParent = parent;
    }
  });
}




function checkCompletion() {
  const allFixed = state.dom.pieces.every(p => p.el.fixed);
  if (allFixed && !state.completed) {
    state.completed = true;

    const message = document.createElement("div");
    message.innerText = "A imagem se completa... algo muda no ar.";
    Object.assign(message.style, {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      color: "#fff",
      fontFamily: "monospace",
      fontSize: "20px",
      opacity: "0",
      transition: "opacity 2s ease",
      textShadow: "0 0 8px rgba(255,255,255,0.4)",
      zIndex: "2000",
      pointerEvents: "none",
    });

    state.dom.overlay.appendChild(message);

    // Fade in
    requestAnimationFrame(() => (message.style.opacity = "1"));

    // Fade out depois de 3s
    setTimeout(() => (message.style.opacity = "0"), 3000);

    // Fecha o puzzle suavemente
    setTimeout(() => {
      hideModal();
      message.remove();
    }, 5000);
  }
}




  function showModal() {
  if (state.completed) return; // impede reabrir se já foi concluído
  const dom = createModal();
  dom.overlay.style.visibility = "visible";
  state.modalOpen = true;
}

  function hideModal() {
    if (!state.dom) return;
    
    // Se modal fechar e puzzle não estava completo
    if (!state.completed) {
      state.completed = false; // garante que continua falso
    }

    state.dom.overlay.style.visibility = "hidden";
    state.modalOpen = false;
  }

  return {
  init(opts = {}) {
    Object.assign(state, opts);
    state.completed = false;
    state.modalOpen = false;
  },

  draw(ctx, map, player) {
    if (state.orientationVisible && !state.completed) {
      const screenX = (state.x - map.cameraX) * map.zoom;
      const screenY = (state.y - map.cameraY) * map.zoom;
      const screenW = state.w * map.zoom;
      const screenH = state.h * map.zoom;
      ctx.save();
      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      ctx.strokeRect(screenX, screenY, screenW, screenH);
      ctx.restore();
    }

    if (!state.completed && !state.modalOpen && this.playerInArea(player, map)) {
      const screenX = (state.x - map.cameraX) * map.zoom;
      const screenY = (state.y - map.cameraY) * map.zoom;
      const screenW = state.w * map.zoom;

      ctx.font = `${Math.max(10, 26 * map.zoom)}px monospace`;
      ctx.fillStyle = "rgba(255, 255, 255, 1)";
      ctx.textAlign = "center";
      ctx.shadowColor = "rgba(255,255,255,0.2)";
      ctx.shadowBlur = 6;
      ctx.fillText("ESPAÇO para interagir", screenX + screenW / 2, screenY - 10);
      ctx.shadowBlur = 0;
    }
  },

  playerInArea(player, map) {
    const px = player.x + player.largura / 2;
    const py = player.y + player.altura / 2;
    return (px >= state.x && px <= state.x + state.w && py >= state.y && py <= state.y + state.h);
  },

  showModal,
  hideModal,

  // adiciona a verificação de completo
  isCompleted() {
    return state.completed;
  },
      isModalOpen() {
      return state.modalOpen;
    }
};

})();
