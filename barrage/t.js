var canvas = document.querySelector('canvas'),
    ctx = canvas.getContext('2d'),
    particles = [],
    noParticles = 200,
    boxWidth = 600,
    boxHeight = 400,
    particleRadius = 2,
    maxVelocity = 6,
    minDistance = 20,
    maxDistance = 60,
    minDistanceDie = 100,
    maxDistanceDie = 150,
    sourceX = boxWidth / 2,
    sourceY = boxHeight / 2,
    debug = false,
    mousePos = {
        x: sourceX,
        y: sourceY
    },
    colors = ['#C5F54A', '#FFB84D', '#496CC3', '#FF564D'],
    connections = new Array(noParticles, noParticles);

canvas.width = boxWidth;
canvas.height = boxHeight;

function initConnections() {
    for (var i = 0; i < noParticles; i++)
        for (var j = 0; j < noParticles; j++)
            connections[i, j] = 0;
}

function randomNum(coeff) {
    "use strict";
    if (coeff === 'undefined') {
        coeff = 1;
    }
    return Math.random() * coeff;
}

function roundRandomNum(coeff) {
    "use strict";
    if (coeff === 'undefined') {
        coeff = 1;
    }
    return Math.round(Math.random() * coeff);
}

function getMousePos(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}

// Particle "class"
function Particle() {
    "use strict";
    this.x = boxWidth / 2;
    this.y = boxHeight / 2;
    this.angle = 0;
    this.rgba = '#FFFFFF';
    this.totalDistance = 0;
    this.init = function() {
        this.angle = randomNum(89) + 1;
        this.velocity = roundRandomNum(maxVelocity - 1) + 1;
        this.distanceDie = roundRandomNum(maxDistanceDie - minDistanceDie) + minDistanceDie;
        this.colorIndex = roundRandomNum(3) + 1;
        this.rgba = colors[roundRandomNum(3) + 1];
        this.vy = Math.sin(this.angle) * this.velocity * (roundRandomNum() ? 1 : -1);
        this.vx = Math.cos(this.angle) * this.velocity * (roundRandomNum() ? 1 : -1);
    };
    this.step = function() {
        this.x += this.vx;
        this.y += this.vy;
        this.totalDistance += this.velocity;
        if (this.x > boxWidth || this.x < 0 || this.y > boxHeight || this.y < 0 || this.totalDistance > this.distanceDie) {
            this.x = sourceX;
            this.y = sourceY;
            this.totalDistance = 0;
        }
    };
    this.draw = function() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, particleRadius, 0, Math.PI * 2, true);
        ctx.fillStyle = this.rgba;
        ctx.fill();
        ctx.closePath();
    };
    this.drawLine = function(otherParticle) {
        var grad = ctx.createLinearGradient(this.x, this.y, otherParticle.x, otherParticle.y);
        grad.addColorStop(0, '#496CC3');
        grad.addColorStop(1, '#496CC3');
        ctx.strokeStyle = grad;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(otherParticle.x, otherParticle.y);
        ctx.stroke();
        ctx.closePath();
    }
    this.distanceTo = function(otherParticle) {
        return Math.sqrt(Math.pow(this.x - otherParticle.x, 2) + Math.pow(this.y - otherParticle.y, 2));
    };
}

// Render
function draw() {
    "use strict";
    ctx.clearRect(0, 0, boxWidth, boxHeight);
    ctx.globalCompositeOperation = 'lighter';
    initConnections();
    for (var i = 0; i < noParticles; i++) {
        var currentParticle = particles[i];
        if (debug)
            currentParticle.draw();
        // Draw lines
        for (var j = 0; j < noParticles; j++) {
            var otherParticle = particles[j];
            var distance = currentParticle.distanceTo(otherParticle);
            if (distance < maxDistance && distance > minDistance) {
                if (!connections[j, i]) {
                    currentParticle.drawLine(otherParticle);
                    connections[i, j] = 1;
                }
            }
        }
        currentParticle.step();
    }
}

window.requestAnimFrame = (function() {
    "use strict";
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function(callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();

(function init() {
    "use strict";
    for (var i = 0; i < noParticles; i++) {
        var newParticle = new Particle();
        newParticle.init();
        particles.push(newParticle);
    }
    //canvas.addEventListener('mousemove', function(event) {
    //    mousePos = getMousePos(canvas, event);
    //    sourceX = mousePos.x;
    //    sourceY = mousePos.y;
    //}, false);
})();

(function loop() {
    "use strict";
    draw();
    requestAnimFrame(loop);
})();
