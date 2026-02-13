/**Game Setup*/

//Setting Canvas
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

//Setting up Width and Height of Canvas
canvas.width = 800;
canvas.height = 600;

//Cursor object with x and y properties
let mouse = {
    x: 200,
    y: 600,
    mass: 1,
    radius: 20,
    velocity: 0,
    shadowArr: {x: 0, y: 0}, //But not rendering need it for velocity.
};

/**Game Intial Setup Variables and Constants*/
const velocity = {
    x: 0,
    y: 5,
};

let lastTime = 0;
let invincibility = false; //Invincibility to collisions

let pFac = {
    gravity: 500,
    collision: 100,
    mouse: 0.01,
}
//Power Factors of each forces

//Credit to Henry for shadow trailing
const ball = {
    x: 200,
    y: 200,
    mass: 1,
    radius: 25,
    shadowArr: [],//Stores shadow trail positions
};


const forcesArr = [];

//The Below  is a vector joining the centres of circle and cursor
let rVec = {
    ball: {x: ball.x, y: ball.y},
    mouse: {x: mouse.x, y: mouse.y},
};
rVec.diff = function(axis) {
    const i = (axis == 'x' ? 1 : -1); 
    return i * (rVec.mouse[axis] - rVec.ball[axis]);
};

let vecSum = (x, y) => Math.sqrt((x ** 2) + (y ** 2));
let A = (obj = mouse) => {
    //We determine relative velocity of approach
    //We know that mometum is conserved.

    const theta = Math.atan2(rVec.diff('y'), rVec.diff('x')); 
    // This is the angle between horizontal and line joining their centres
    const alpha = Math.atan2(velocity.y, velocity.x);
    const beta = Math.atan2(mouse.vy, mouse.vx);
    

    const bPar = vecSum(velocity.x, velocity.y) * Math.cos(alpha - theta),
          bPer = vecSum(velocity.x, velocity.y) * Math.sin(alpha - theta);
    
    const mPar = vecSum(mouse.vx, mouse.vy) * Math.cos(beta - theta),
          mPer = vecSum(mouse.vx, mouse.vy) * Math.sin(beta - theta);

    //e =  (bPar - mPar) / (bParFinal + mParFinal );

    console.log(`Ball ${Math.round(bPar)}`)
    console.log(`Mouse ${Math.round(mPar)}`)

    const vfinal = Math.abs(bPar - mPar) - vecSum(mouse.vx, mouse.vy);
    const acceleration = ball.mass * (Math.abs(vecSum(velocity.x, velocity.y) - vfinal));
    return pFac.collision * acceleration;
}   
//Angle (for theta) is measured from horiztonal position.  
class Force {
    constructor(_theta, _acceleration, _type = "collision") {
        this.type = _type;
        this.theta = _theta;
        this.acceleration = _acceleration;
    }
    
    effect(dt) {
        //Accelerations in x and y respectively
        //Negative 1 is multiplied because forces act radially.
        let AX = -1 * (this.acceleration * Math.cos(this.theta)) / ball.mass,
            AY = (this.acceleration * Math.sin(this.theta)) / ball.mass;
        
        velocity.x += AX * dt;
        velocity.y += AY * dt;
    }
}

const gravity = new Force((Math.PI / 2), pFac.gravity, "external");
const forces = [gravity];

const graphics = {
    tree: function(x, y, size = 20, scale = 1) {
        ctx.save();
        ctx.scale(scale, scale);
        ctx.lineWidth = 5;
        ctx.fillStyle = "#B77A2F";
        ctx.beginPath();
        ctx.roundRect(x + size, y - size / 2, 2 * size, size * 6, 10);
        ctx.fill();
        ctx.stroke();


        ctx.fillStyle = "#97B86D";
        ctx.strokeSyle = "#211514";


        for (let dx = 0; dx <= size * 4; dx += size * 2) {
            ctx.beginPath();
            ctx.arc(x + dx, y, size, 0, 2 * Math.PI)
            ctx.fill();
            ctx.stroke();
        }

        for (let dx = 0; dx <= size * 2; dx += size * 2) {
            ctx.beginPath();
            ctx.arc(x + dx + size, y - size * 1.8, size, 0, 2 * Math.PI)
            ctx.fill();
            ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(x + size * 2, y - size * 3.6, size, 0, 2 * Math.PI)
        ctx.fill();
        ctx.stroke();

        ctx.restore();
    },
    
    tree2: function(x, y, size = 20, scale = 1) {
        ctx.save();
        ctx.scale(scale, scale);
        ctx.lineWidth = 5;
        ctx.fillStyle = "#B77A2F";
        ctx.beginPath();
        ctx.roundRect(x + size, y - size / 2, 2 * size, size * 6, 10);
        ctx.fill();
        ctx.stroke();


        ctx.fillStyle = "rgb(184, 145, 109)";
        ctx.strokeSyle = "#211514";


        for (let dx = 0; dx <= size * 4; dx += size * 2) {
            ctx.beginPath();
            ctx.arc(x + dx, y, size, 0, 2 * Math.PI)
            ctx.fill();
            ctx.stroke();
        }

        for (let dx = 0; dx <= size * 2; dx += size * 2) {
            ctx.beginPath();
            ctx.arc(x + dx + size, y - size * 1.8, size, 0, 2 * Math.PI)
            ctx.fill();
            ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(x + size * 2, y - size * 3.6, size, 0, 2 * Math.PI)
        ctx.fill();
        ctx.stroke();

        ctx.restore();
    }
}


function debugMode(type = "velocity") {
    switch (type) {
        case "mouse":
            ctx.lineWidth = 1;
            ctx.strokeStyle = "#2F2F2F";
            
            ctx.moveTo(mouse.x, mouse.y);
            ctx.lineTo(ball.x, ball.y);
            ctx.stroke();
        break;
        case "velocity":
            ctx.lineWidth = 1;
            ctx.strokeStyle = "#FA719A";
            
            ctx.beginPath();
            ctx.moveTo(ball.x, ball.y);
            ctx.lineTo(ball.x + (velocity.x * 20), ball.y + (velocity.y * 20));
            ctx.stroke();
        break;
    }
}

/**Functions*/

function drawBall() {
    //Pink Color
    ctx.fillStyle = "#FA719A";
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
}

function drawShadowTrails() {
    // Go over every position and draw a shadow there
    ctx.fillStyle = 'rgb(255, 195, 230, 0.3)';
    for (let i = ball.shadowArr.length; i --;) {
        ctx.beginPath();
        ctx.arc(ball.shadowArr[i].x, ball.shadowArr[i].y, i * (ball.radius - 5) / 10, 0, 2 * Math.PI);
        ctx.fill();
    }
    
    ball.shadowArr.push({x: ball.x, y: ball.y});
    if (ball.shadowArr.length > 15) ball.shadowArr.shift(); // Takes out the first element of the array if there are already a lot of positions stored
}

let cursor = () => {
    ctx.lineWidth = "1";
    ctx.strokeStyle = "#2F2F2F";
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, mouse.radius, 0, Math.PI * 2);
    ctx.stroke();
};

//Checking for defeat Function
const checkDefeat = () => {
    switch (true) {
        //Check If on Ground
        case (ball.y >= 600):
            ball.y = 600; 
            
            //Set Velocities to 0
            velocity.y = 0;
            velocity.x = 0;
        break;
        case (ball.x < 0):
            ball.x = 0;
        break;
        case (ball.x > 800):
            ball.x = 800;
        break;
    }
};

function collision() {
    //To check intersection of circles
    let distance = Math.sqrt((rVec.diff("x") ** 2) + (rVec.diff("y") ** 2));

    return distance < ball.radius + mouse.radius
}

/**Main Function*/
function Initialize(currentTime) {
    //Clear Previous Scenes
    ctx.clearRect(0,0,window.innerWidth, window.innerHeight);
    checkDefeat();

    debugMode();

    if (lastTime === 0) { 
        lastTime = currentTime; 
    }

    let dt = ((currentTime - lastTime) / 1000);
    if  (dt === 0) dt = 0.005;

    lastTime = currentTime;

    mouse.vx = (mouse.x - mouse.shadowArr.x) / dt,
    mouse.vy = (mouse.y - mouse.shadowArr.y) / dt;

    mouse.shadowArr = {x: mouse.x, y: mouse.y};

    //Update Horizontal position
    ball.x += velocity.x * dt;
    ball.y += velocity.y * dt;

    rVec = {
        ...rVec,
        ball: { x: ball.x, y: ball.y },
        mouse: { x: mouse.x, y: mouse.y },
    };
    

    // graphics.tree2(360, 520, 15);

    //Draw Shadows
    drawShadowTrails();
    
    if (collision() && !invincibility) {                
        let dx = rVec.diff('x'),
            dy = rVec.diff('y');
        const theta = Math.atan2(dy, dx);
        // const thetaDg = theta * (180 / Math.PI);

        //And god said, F = MA.

        forces.push(new Force(theta, A()));    
        invincibility = true;            
    } else {
        for (let i = forces.length - 1; i >= 0; i--) {
            if (forces[i].type === "collision") {
                forces.splice(i, 1);
            }
        }

        window.setTimeout(() => {
            invincibility = false;
        }, 500);
    }
    
    forces.forEach(instance => {
        instance.effect(dt);
    });
    
    cursor();
    drawBall();

    window.requestAnimationFrame(Initialize);
};

requestAnimationFrame(Initialize);


/**Event Listeners and updaters*/

//Updating Cursor Position
window.addEventListener("mousemove", (event) => {
    //Weird gameplay choices lol
    mouse.x = event.clientX - 1;
    mouse.y = event.clientY + 5; 
});
