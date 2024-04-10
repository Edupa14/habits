import * as THREE from 'three'


const bgGreen = 0x6ec25a
const bgRed = 0xc6122e
const bgBlack = 0x000000
const bgWhite = 0xffffff

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(
    -window.innerWidth / 2, window.innerWidth / 2,
    window.innerHeight / 2, -window.innerHeight / 2,
    1, 1000
);
camera.position.z = 1; // orthographic cameras don't need to be moved along z-axis
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(bgWhite, 1); // white background color
document.getElementById('tracker').appendChild(renderer.domElement);

// Constants for the habit tracker
const innerRadius = 100;
const outerRadius = 320;
const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() ;
const daysInMonthWhitExtra = daysInMonth + 10;

// Group for the grid

const gridGroup = new THREE.Group();

// Create the habit tracker grid
for (let day = 0; day < daysInMonthWhitExtra; day++) {
    if (day < daysInMonth + 1) {
        const angle = (day / daysInMonthWhitExtra) * Math.PI * 2 + 3.14;
        const xOuter = Math.cos(angle) * outerRadius;
        const yOuter = Math.sin(angle) * outerRadius;
        const xInner = Math.cos(angle) * innerRadius;
        const yInner = Math.sin(angle) * innerRadius;

        // Radial lines
        const points = [];
        points.push(new THREE.Vector3(xInner, yInner, 0));
        points.push(new THREE.Vector3(xOuter, yOuter, 0));
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({color: bgBlack, linewidth: 2});
        const line = new THREE.Line(geometry, material);
        gridGroup.add(line);
    }
}

const missingSectionStart = Math.PI / 2; // 90 grados en radianes
const missingSectionLength = Math.PI / 2;

const geometryCube = 5
for (let i = 0; i <= geometryCube; i++) {
    const radius = innerRadius + (i * (outerRadius - innerRadius) / geometryCube);

    const thetaStart = missingSectionStart + missingSectionLength;
    const thetaLength = Math.PI * 2 - missingSectionLength;

    const adjustedThetaStart = thetaStart % (Math.PI * 2);
    const adjustedThetaLength = thetaLength % (Math.PI * 2);

    const circleGeometry = new THREE.RingGeometry(
        radius,
        radius + 1,
        150,
        1,
        adjustedThetaStart,
        adjustedThetaLength);

    const edges = new THREE.EdgesGeometry(circleGeometry);
    const circleMaterial = new THREE.LineBasicMaterial({color: bgBlack, linewidth: 2});
    const circle = new THREE.LineSegments(edges, circleMaterial);
    gridGroup.add(circle);
}

const squareHeight = (outerRadius - innerRadius) / geometryCube;
const radialDivision = 41;
const angle =  Math.PI / 2.11 ; // Ajusta esto si los cuadrados no comienzan desde el ángulo cero

function createTrapezoid(day,bgColor) {
    const segmentAngle = (Math.PI * 2) / daysInMonthWhitExtra;
    const startAngle = (angle + segmentAngle * day) - segmentAngle / 2;
    const endAngle = (angle + segmentAngle * day) + segmentAngle / 2;

    // Calcula la posición de los vértices para el trapecio
    const innerStartX = Math.cos(startAngle) * innerRadius;
    const innerStartY = Math.sin(startAngle) * innerRadius;
    const innerEndX = Math.cos(endAngle) * innerRadius;
    const innerEndY = Math.sin(endAngle) * innerRadius;

    const outerStartX = Math.cos(startAngle) * (innerRadius + squareHeight);
    const outerStartY = Math.sin(startAngle) * (innerRadius + squareHeight);
    const outerEndX = Math.cos(endAngle) * (innerRadius + squareHeight);
    const outerEndY = Math.sin(endAngle) * (innerRadius + squareHeight);
    
    // Crea la forma del trapecio
    const shape = new THREE.Shape();
    shape.moveTo(innerStartX, innerStartY);
    shape.lineTo(outerStartX, outerStartY);
    shape.lineTo(outerEndX, outerEndY);
    shape.lineTo(innerEndX, innerEndY);
    shape.closePath();

    // Crea la geometría y el material para el trapecio
    const trapecioGeometry = new THREE.ShapeGeometry(shape);
    const trapecioMaterial = new THREE.MeshBasicMaterial({ color: bgColor });

    // Crea el mesh y añade al grupo
    const trapecioMesh = new THREE.Mesh(trapecioGeometry, trapecioMaterial);
    trapecioMesh.position.z = -0.1; // Mueve los trapezoides ligeramente hacia atrás
    gridGroup.add(trapecioMesh);
}

function fillTrapezoidsOneByOne() {
    for (let day = daysInMonth - 1; day >= 0; day--) {
        (function(d){
            if (d % 2 !== 0) {
            setTimeout(() => createTrapezoid(d+11,bgRed), (daysInMonth - d - 1) * 100); // Adjust the delay as needed
            }else if(d%2 === 0){
            setTimeout(() => createTrapezoid(d+11, bgGreen), (daysInMonth - d - 1) * 100); // Adjust the delay as needed
            }
        })(day);
    }
}


scene.add(gridGroup);

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();

fillTrapezoidsOneByOne();


// Handle window resize
window.addEventListener('resize', function () {
    camera.left = -window.innerWidth / 2;
    camera.right = window.innerWidth / 2;
    camera.top = window.innerHeight / 2;
    camera.bottom = -window.innerHeight / 2;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});