const canvas = document.getElementById('tunnel-bg');
const ctx = canvas.getContext('2d');
let width, height, cx, cy;
let time = 0;

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    cx = width / 2;
    cy = height / 2;
}

window.addEventListener('resize', resize);
resize();

class Ring {
    constructor(index, total) {
        this.index = index;
        this.total = total;
        this.reset();
    }

    reset() {
        this.z = (this.index / this.total) * 2000;
        this.speed = 2.5;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.01;
        this.numSegments = Math.floor(Math.random() * 3) + 2;
    }

    update() {
        this.z -= this.speed;
        this.rotation += this.rotationSpeed;
        if (this.z <= 1) {
            this.z = 2000;
        }
    }

    draw() {
        const perspective = 600 / this.z;
        const radius = 400 * perspective;
        const x = cx;
        const y = cy;
        const opacity = Math.min(1, (2000 - this.z) / 1000) * (this.z / 2000);

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(this.rotation);

        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.4})`;
        ctx.lineWidth = 2 * perspective;
        ctx.shadowBlur = 15 * perspective;
        ctx.shadowColor = 'white';

        // Draw segments of the ring
        for (let i = 0; i < this.numSegments; i++) {
            const startAngle = (i / this.numSegments) * Math.PI * 2;
            const endAngle = startAngle + (Math.PI / this.numSegments);
            ctx.beginPath();
            ctx.arc(0, 0, radius, startAngle, endAngle);
            ctx.stroke();
        }

        // Draw inner geometric details
        if (this.index % 3 === 0) {
            ctx.beginPath();
            const innerR = radius * 0.8;
            for (let i = 0; i < 6; i++) {
                const a = (i / 6) * Math.PI * 2;
                const px = Math.cos(a) * innerR;
                const py = Math.sin(a) * innerR;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.15})`;
            ctx.stroke();
        }

        ctx.restore();
    }
}

class LightRay {
    constructor() {
        this.reset();
    }

    reset() {
        this.angle = Math.random() * Math.PI * 2;
        this.length = Math.random() * 1000 + 500;
        this.width = Math.random() * 2 + 0.5;
        this.opacity = Math.random() * 0.2;
        this.speed = Math.random() * 0.002 + 0.001;
    }

    update() {
        this.angle += this.speed;
    }

    draw() {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(this.angle);
        const grad = ctx.createLinearGradient(0, 0, this.length, 0);
        grad.addColorStop(0, `rgba(255, 255, 255, ${this.opacity})`);
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, -this.width / 2, this.length, this.width);
        ctx.restore();
    }
}

const rings = [];
for (let i = 0; i < 25; i++) {
    rings.push(new Ring(i, 25));
}

const rays = [];
for (let i = 0; i < 15; i++) {
    rays.push(new LightRay());
}

function animate() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);
    
    time += 0.01;

    // Draw central glow
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 300);
    glow.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);

    rays.forEach(ray => {
        ray.update();
        ray.draw();
    });

    rings.forEach(ring => {
        ring.update();
        ring.draw();
    });

    // Draw some floating particles for depth
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    for(let i = 0; i < 50; i++) {
        const x = (Math.sin(i + time) * 0.5 + 0.5) * width;
        const y = (Math.cos(i * 0.8 + time * 0.5) * 0.5 + 0.5) * height;
        const s = Math.sin(time + i) * 1 + 1;
        ctx.beginPath();
        ctx.arc(x, y, s, 0, Math.PI * 2);
        ctx.fill();
    }

    requestAnimationFrame(animate);
}

animate();
