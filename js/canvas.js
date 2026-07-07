const canvas = document.getElementById('background_canvas');
const ctx = canvas.getContext('2d');

const SPACING = 40;         // par défaut 28
const BASE_R = 1.2;         // par défaut 1.2
const MAX_R = 5;            // par défaut 5
const RADIUS_EFFECT = 200;  // par défaut 100
let mouse = { x: -9999, y: -9999, strength: 0 };
let dots = [];

// Regénère la grille de points à chaque redimensionnement de la fenêtre
function resize() {
    // 0 pour reset afin que scrollWidth & scrollHeight recalculent
    canvas.width = 0;
    canvas.height = 0;
    canvas.width = document.documentElement.scrollWidth;
    canvas.height = document.documentElement.scrollHeight;
    dots = [];
    const cols = Math.ceil(canvas.width / SPACING) + 1;
    const rows = Math.ceil(canvas.height / SPACING) + 1;
    for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++)
            dots.push({ x: c * SPACING, y: r * SPACING });
}

function resetMouse() {
    mouse.x = -9999;
    mouse.y = -9999;
    mouse.strength = 0;
}

const CENTER_IGNORE = 0.60;     // zone centrale ignorée, 60% par défaut
const BREAKPOINT = 1300;        // en dessous = mobile
const FADE_ZONE = 0.08;         // largeur de la zone de transition [+ grand = + doux], 8% par défaut

document.addEventListener('mousemove', e => {
    // Mobile : désactivé
    if (window.innerWidth < BREAKPOINT) {
            resetMouse()
        return;
    }

    const ratio = e.clientX / window.innerWidth;
    const margin = (1 - CENTER_IGNORE) / 2;
    // Distance par rapport à la bordure de la zone active [positif = zone active & négatif = zone centrale]
    const distLeft = margin - ratio;
    const distRight = ratio - (1 - margin);
    const dist = Math.max(distLeft, distRight);

    // Facteur entre 0 (bord de zone) et 1 (bord de page)
    const edgeFactor = Math.max(0, Math.min(1, dist / FADE_ZONE));

    if (edgeFactor > 0) {
        mouse.x = e.pageX;
        mouse.y = e.pageY;
        mouse.strength = edgeFactor; // 0 devient 1
    } else {
        resetMouse()
    }
});

window.addEventListener('resize', resize);

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const d of dots) {
        const dist = Math.hypot(d.x - mouse.x, d.y - mouse.y);
        const rawT = Math.max(0, 1 - dist / RADIUS_EFFECT);
        const t = rawT * (mouse.strength ?? 0);
        const r = BASE_R + (MAX_R - BASE_R) * t * t;
        const alpha = 0.18 + 0.82 * t * t;
        ctx.beginPath();
        ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(21,173,0,${alpha})`; // par défaut rgba(21,173,0)
        ctx.fill();
    }
    requestAnimationFrame(draw);
}

resize();
draw();