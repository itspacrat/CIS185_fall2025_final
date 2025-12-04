
/*
Note: load event waits for all assets such as spritesheets and images
to be fully loaded before it executes code in its callback function.

anonymous function: function without a name

cts = context, instance of built-in canvas 2D api that holds all
drawing methods and properties we will need to animate the game

7:11 - ES6 arrow functions dont bind their own 'this' but they inherit the one
from their parent scope. This is called 'lexical scoping'. This help js 
know which object the 'this' keyword stand for in our arrow functions of the
input handler function.

41:00 -- talks about collisions
*/

window.addEventListener('load', function () {
  const canvas = document.getElementById('canvas1');
  const ctx = canvas.getContext('2d');
  canvas.width = 800;
  canvas.height = 720;
  let score = 0;
  let enemies = [];
  let gameOver = false;

  class InputHandler {
    constructor() {
      this.keys = [];
      window.addEventListener('keydown', e => {
        if ((e.key === 'ArrowDown' ||
          e.key === 'ArrowUp' ||
          e.key === 'ArrowLeft' ||
          e.key === 'ArrowRight')
          && this.keys.indexOf(e.key) === -1) {
          this.keys.push(e.key);
        }
        // console.log(e.key, this.keys);
      });
      window.addEventListener('keyup', e => {

        if (e.key === 'ArrowDown' ||
          e.key === 'ArrowUp' ||
          e.key === 'ArrowLeft' ||
          e.key === 'ArrowRight') {
          // this.keys.splice(e.key.indexOf(e.key), 1)
          const index = this.keys.indexOf(e.key);
          if (index > -1) this.keys.splice(index, 1);
          // console.log(e.key, this.keys);
        }
      });
    }
  }

  class Player {
    constructor(gameWidth, gameHeight) {
      this.gameWidth = gameWidth;
      this.gameHeight = gameHeight;
      this.width = 200;
      this.height = 200;

      this.x = 0;
      this.y = this.gameHeight - this.height;
      this.image = document.getElementById('playerImage');

      this.frameX = 0;
      this.frameY = 0;

      this.speed = 0;
      this.velocityY = 0;

      this.weight = 1;

      this.maxFrame = 8;

      this.fps = 20;
      this.frameTimer = 0;
      this.frameInterval = 1000/this.fps;
    }

    draw(context) {
      // NOTE: uncomment to draw a white box around the player (helpful for debugging)
      // context.fillStyle = 'white';
      // context.fillRect(this.x, this.y, this.width, this.height);

      // collision box test
      context.strokeStyle = 'white';
      context.strokeRect(this.x, this.y, this.width, this.height);
      context.beginPath();
      context.strokeStyle = "blue";
      context.arc(this.x + this.width/2, this.y+this.height/2, this.width/2, 0, Math.PI * 2);
      context.stroke();
      // sx through sh helps create a bounding box around a single pose of the character from the spritesheet.
      // check 15:00 min in video to see.
      let sx = this.frameX * this.width;
      let sy = this.frameY * this.height;
      let sw = this.width
      let sh = this.height

      context.drawImage(this.image, sx, sy, sw, sh, this.x, this.y, this.width, this.height);
    }

    update(input, deltaTime) {
      // collistion detection (watch 43:15 to see pythagerous theorem in action)
      enemies.forEach(enemy => {
        // const dx = enemy.x - this.x;
        // const dy = enemy.y - this.y;
        const dx = (enemy.x + enemy.width/2) - (this.x + this.width/2);
        const dy = (enemy.y + enemy.height/2) - (this.y + this.height/2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < enemy.width/2 + this.width/2) {
          gameOver = true
        }
      })

      // sprite animation
      // 36:16 talks about the animation framing
      if (this.frameTimer > this.frameInterval) {
        if (this.frameX >= this.maxFrame) this.frameX = 0;
        else this.frameX++;
        this.frameTimer = 0;
      } else {
        this.frameTimer += deltaTime;
      }
      // controls
      if (input.keys.indexOf('ArrowRight') > -1) {
        this.speed = 5;
      } else if (input.keys.indexOf('ArrowLeft') > -1) {
        this.speed = -5;
      } else if (input.keys.indexOf('ArrowUp') > -1 && this.onGround()) {
        this.velocityY -= 32; // jump impulse, only if character is onGround
      } else {
        this.speed = 0;
      }

      // horizontal movement
      // don't let character x position go passed the left and right border
      if (this.x < 0) this.x = 0;
      if (this.x > this.gameWidth - this.width) {
        this.x = this.gameWidth - this.width
      }
      this.x += this.speed;

      // vertical movement (watch 20:43 for jump animation)
      this.y += this.velocityY;
      // if character is in the air, apply gravity. else character is on the ground.
      if (!this.onGround()) {
        this.velocityY += this.weight; // gravity pulls down
        this.maxFrame = 5;
        this.frameY = 1; // use the jumping animation
      } else {
        this.velocityY = 0;
        this.maxFrame = 8;
        this.frameY = 0;
        this.y = this.gameHeight - this.height; // snap to floor
      }
    }

    // helper method for vertical movement
    onGround() {
      return this.y >= this.gameHeight - this.height;
    }
  }

  class Background {
    constructor(gameWidth, gameHeight) {
      this.gameWidth = gameWidth;
      this.gameHeight = gameHeight;

      this.image = document.getElementById('backgroundImage');
      this.x = 0;
      this.y = 0;
      this.width = 2400;
      this.height = 720;
      this.speed = 1;
    }
    draw(context) {
      // generate 2 images ( watch 24:11 to see visualization of Image stitch)
      context.drawImage(this.image, this.x, this.y, this.width, this.height);
      context.drawImage(this.image, this.x + this.width - this.speed, this.y, this.width, this.height)
    }
    update() {
      this.x -= this.speed; // left scroll
      if (this.x < 0 - this.width) this.x = 0;
    }
  }

  class Enemy {
    constructor(gameWidth, gameHeight) {
      this.gameWidth = gameWidth;
      this.gameHeight = gameHeight;
      this.width = 160;
      this.height = 119;
      this.image = document.getElementById('enemyImage');
      this.x = this.gameWidth;
      this.y = this.gameHeight - this.height;

      // frame handling to cycle between spritesheet.
      this.frameX = 0;
      this.frameTimer = 0;
      this.maxFrame = 5;
      this.fps = 20;
      this.frameInterval = 1000/this.fps;
      this.speed = 8;

      this.markedForDeletion = false;
    }
    draw(context) {
      context.strokeStyle = 'white';
      context.strokeRect(this.x, this.y, this.width, this.height);

      context.beginPath();
      context.strokeStyle = "blue";
      context.arc(this.x + this.width/2, this.y+this.height/2, this.width/2, 0, Math.PI * 2);
      context.stroke();

      context.beginPath();
      context.strokeStyle = 'red'
      context.arc(this.x, this.y, this.width/2, 0, Math.PI * 2);
      context.stroke();

      // draw the enemy
      context.drawImage(this.image, this.frameX * this.width, 0,
        this.width, this.height, this.x, this.y, this.width, this.height);
    }
    update(deltaTime) {
      // cycle between frames
      if (this.frameTimer > this.frameInterval) {
        if (this.frameX >= this.maxFrame) this.frameX = 0;
        else this.frameX++;
        this.frameTimer = 0;
      } else {
        this.frameTimer += deltaTime;
      }
      this.x -= this.speed;
      // if the enemey has moved off screen, mark it for deletion.
      if (this.x < 0 - this.width) this.markedForDeletion = true;
    }
  }

  // enemies.push(new Enemy(canvas.width, canvas.height));
  function handleEnemies(deltaTime) {
    // console.log(enemies)
    // push enemies into the arracy
    if (enemyTimer > enemyInterval + randomEnemyInterval) {
        enemies.push(new Enemy(canvas.width, canvas.height));
        randomEnemyInterval = Math.random() * 1000 + 500;
        enemyTimer = 0;
    } else {
      enemyTimer += deltaTime;
    }
    enemies.forEach(enemy => {
      enemy.draw(ctx);
      enemy.update(deltaTime);
    })
    enemies = enemies.filter(enemy => !enemy.markedForDeletion)

  }

  function displayStatusText(context) {
    // draw a score on the canvas
    context.fillStyle = 'black';
    context.font = '40px Helvetica';
    context.fillText('Score: ' + score, 20, 50);
    context.fillStyle = 'white';
    context.fillText('Score: ' + score, 20, 52);

    // lose display
    if (gameOver) {
      context.textAlign = 'center';
      context.fillStyle = 'black';
      context.fillText('Game Over, try again!', canvas.width/2, 200);
      context.fillStyle = 'white';
      context.fillText('Game Over, try again!', canvas.width/2, 202);
    }
  }

  // ================================================
  // Implementation section:
  // make use of classes below to generate the game.
  const input = new InputHandler();
  const player = new Player(canvas.width, canvas.height);
  const background = new Background(canvas.width, canvas.height);

  let lastTime = 0;
  let enemyTimer = 0;
  let enemyInterval = 1000; // add enemy every 1000 ms.
  let randomEnemyInterval = Math.random() * 1000 + 500;

  function animate(timeStamp) {
    // most screens run at 60fps
    const deltaTime = timeStamp - lastTime; // 29:00 talks about delta time (requestAnimationFrame auto creates a timeStamp)
    // console.log(deltaTime) // 1000ms/xfps (my fps is 240HZ, if yours is at 60fps, deltaTime is around 16)
    lastTime = timeStamp;
    // on each render, clear the previous player drawing.
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    background.draw(ctx);
    player.draw(ctx);
    handleEnemies(deltaTime); // draw the enemies
    displayStatusText(ctx); // draw the score card

    player.update(input, deltaTime);
    background.update();
    if (!gameOver) requestAnimationFrame(animate);
  }

  // endless loop!
  animate(0);
});

