 /**Game Setup*/
    
        //Setting Canvas
        const canvas = document.getElementById("canvas");
        const ctx = canvas.getContext("2d");
        
        //Setting up Width and Height of Canvas
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        //Cursor object with x and y properties
        let mouse = {
            x: 0,
            y: 0,
            radius: 10,
        };

        /**Game Intial Setup Variables and Constants*/
        const velocity = {
            x: 0,
            y: 5,
        };

        const ball = {
            x: window.innerWidth / 2,
            y: window.innerHeight / 3,
            radius: 20,
        };

        //Credit to Henry for shadow trailing
        const shadowArr = []; //Stores shadow trail positions
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

        //Angle (for theta) is mesaured from horiztonal position.  
        class Force {
            constructor(_theta, _acceleration, _type = "collision") {
                this.type = _type;
                this.theta = _theta;
                this.acceleration = _acceleration;
            }
            
            effect() {
                //Accelerations in x and y respectively
                //Negative 1 is multiplied because forces act radially.
                let AX = -1 * (this.acceleration * Math.cos(this.theta)),
                    AY = 1 * (this.acceleration * Math.sin(this.theta));
                
                velocity.x += AX;
                velocity.y += AY;
            }
        }

        //Gravity forces always acting downward.
        const gravity = new Force((Math.PI / 2), 0.1, "external");
        const forces = [gravity];

        const graphics = {
            tree: function(x, y, size = 20, scale = 1) {
                ctx.save();
                ctx.scale(scale, scale)
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
            }
        }

        let vecSum = (x, y) => Math.sqrt((x ** 2) + (y ** 2));


        function debugMode() {
            ctx.lineWidth = 1;
            ctx.strokeStyle = "#2F2F2F";
            
            ctx.moveTo(mouse.x, mouse.y);
            ctx.lineTo(ball.x, ball.y);
            ctx.stroke();
        }

        /**Functions*/
        
        function drawBall() {
            //Pink Color
            ctx.fillStyle = "#FA719A";
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius,0,Math.PI * 2);
            ctx.fill();
        }

        function drawShadowTrails() {
            // Go over every position and draw a shadow there
            ctx.fillStyle = 'rgb(255, 195, 230, 0.3)';
            for (let i = shadowArr.length; i --;) {
                ctx.beginPath();
                ctx.arc(shadowArr[i].x, shadowArr[i].y, i * (ball.radius - 5) / 10, 0, 2 * Math.PI);
                ctx.fill();
            }
            
            shadowArr.push({x: ball.x, y: ball.y});
            if (shadowArr.length > 15) shadowArr.shift(); // Takes out the first element of the array if there are already a lot of positions stored
        }


        let cursor = () => {
            ctx.lineWidth = "1";
            ctx.strokeStyle = "#2F2F2F";
            ctx.beginPath();
            ctx.arc(mouse.x, mouse.y, mouse.radius,0,Math.PI * 2);
            ctx.stroke();
        };

        //Checking for defeat Function
        const checkDefeat = () => {
            switch (true) {
                //Check If on Ground
                case (ball.y > window.innerHeight - 50):
                    ball.y = window.innerHeight - 25; 
                    
                    //Set Velocities to 0
                    velocity.y = 0;
                    velocity.x = 0;
                break;
                default:

            }
        };

        function checkForAirResistnace() {
            const condition = Math.abs(velocity.x) > 5 ? true : false;
            if (condition) {
                //Determines direction of drag
                let theta = velocity.x < 0 ? Math.PI : 0;
                
                forces.push(new Force(theta, 0.1, "resistance"));
            } else {
                // forces = forces.filter((instance) => {
                   //  return !(instace.type == "resistance");
                // })

                for (let i = forces.length - 1; i >= 0; i--) {
                    if (forces[i].type === "resistance") {
                        forces.splice(i, 1);
                    }
                }
            }
        } 

        function collision() {
            //To check intersection of circles
            let distance = Math.sqrt((rVec.diff("x") ** 2) + (rVec.diff("y") ** 2));

            return distance < ball.radius + mouse.radius
        }

        /**Main Function*/
        (function Intialize() {
            //Clear Previous Scenes
            ctx.clearRect(0,0,window.innerWidth, window.innerHeight);
            checkDefeat();

            // debugMode();
            
            //Update Horizontal position
            ball.x += velocity.x;
            ball.y += velocity.y;

            rVec = {
                ...rVec,
                ball: { x: ball.x, y: ball.y },
                mouse: { x: mouse.x, y: mouse.y },
            };

            ctx.lineWidth = 5;
            
            graphics.tree(360, 600, 15);

            //Draw Shadows
            drawShadowTrails();
            
            if (collision()) {                
                let dx = rVec.diff('x'),
                    dy = rVec.diff('y');
                const theta = Math.atan2(dy, dx);
                const thetaDg = theta * (180 / Math.PI);

                //F = MA
                const A = 0.15 * (vecSum(velocity.x, velocity.y)); 
                forces.push(new Force(theta, A));                
            } else {
                // window.setTimeout(() => {
                for (let i = forces.length - 1; i >= 0; i--) {
                    if (forces[i].type === "collision") {
                        forces.splice(i, 1);
                    }
                }
                // }, 250);
            }
            checkForAirResistnace();
            
            forces.forEach(instance => {
                instance.effect();
            });
            
            cursor();
            drawBall();

            window.requestAnimationFrame(Intialize);
        })();


        /**Event Listeners and updaters*/
        
        //Updating Cursor Position
        window.addEventListener("mousemove", (event) => {
            //Weird gameplay choices lol
            mouse.x = event.clientX - 1;
            mouse.y = event.clientY + 5; 
        });
    
        //Resizing Canvas
        window.addEventListener("resize", (event) => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });