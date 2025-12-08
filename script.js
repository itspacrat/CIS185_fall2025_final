
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
  let gameStart = false;
  const gameOverSound = new Audio('assets/soundeffects/wompwomp.mp3');
  gameOverSound.volume = 0.1;

  // LOAD HIGH SCORES //
let highScores = JSON.parse(localStorage.getItem('highScores')) || [];
highScores.sort((a, b) => b.score - a.score);
highScores = highScores.slice(0, 5);

function refreshHighScores() {
  const list = document.getElementById('highScoreList');
  list.innerHTML = '';

  highScores.forEach(entry => {
    const li = document.createElement('li');
    li.textContent = `${entry.initials}: ${entry.score}`;
    list.appendChild(li);
  });
}

// REFRESH THAT THANG
refreshHighScores();

 
 // RETRY BUTTON //
  document.getElementById('retryBtn').addEventListener('click', () => {
    console.log('retry clicked');
    location.reload();
  });

  // Call the Start screen
  loadStartScreen();

  // Load the Start screen to show the controls and show the background and enemies
  function loadStartScreen() {
    const startScreen = document.getElementById("startScreen");
    startScreen.innerHTML = `
      <div class="screen-inner">
        <h1>Welcome!</h1>
        <p class="screen-subtitle">Use the keys to move. Avoid Enemies!</p>
        <div class="controls-container">
          <!-- WASD Block -->
          <div class="key-container">

            <div class="key key-w" data-key="w">
              W
              <span>Jump</span>
            </div>

            <div class="key-row">
              <div class="key key-a" data-key="a">
                A
                <span>Left</span>
              </div>

              <div class="key key-s" data-key="s">
                S
                <span>Down</span>
              </div>

              <div class="key key-d" data-key="d">
                D
                <span>Right</span>
              </div>
            </div>
          </div>
          <div class="key-container">
            <!-- Arrow Up -->
            <div class="key key-up" data-key="ArrowUp">
              ↑
              <span>Jump</span>
            </div>

            <!-- Arrow Left / Down / Right Row -->
            <div class="key-row">
              <div class="key key-left" data-key="ArrowLeft">
              ←
              <span>Left</span>
            </div>

            <div class="key key-down" data-key="ArrowDown">
              ↓
              <span>Down</span>
            </div>

            <div class="key key-right" data-key="ArrowRight">
              →
              <span>Right</span>
            </div>
          </div>
        </div>

        <!-- Space Bar -->
        <div class="key key-space" data-key=" ">
          Space
          <span>Jump</span>
          </div>
        </div>
        <button id="startBtn" class="start-btn btn">Start</button>
      </div>
    `
    document.getElementById('startBtn').addEventListener('click', () => {
      startScreen.style.display = "none";
      learnMoreBtn.style.display = "none";
      learnMoreContainer.style.display = "none";
      gameStart = true;
      score = 0;
      enemies = [];
      animate(0);
    });

  }

  // Helper: flash the key when pressed
  function flashKey(key) {
    if (!key) return;
    key.classList.add("active");
    setTimeout(() => {
      key.classList.remove("active");
    }, 120);
  }

  // Listen for key presses on the start screen
  window.addEventListener("keydown", (e) => {
    // Find a matching key element by data-key="ArrowUp", etc.
    const keyElement = document.querySelector(`.key[data-key="${e.key}"]`);
    if (keyElement) {
      flashKey(keyElement);
    }
  });

  // Volumn Button controls - toggle the womp womp on and off
  const volumeButton = document.getElementById('volumeBtn');

  //set the svg for the button keeping the index file cleaner
  volumeButton.innerHTML = `<img id="volumeIcon" src="/assets/images/volume-high-solid-full.svg" alt="Sound On">`

  const volumeIcon = document.getElementById('volumeIcon');

  // Monitor if the volume is on or off
  let volumeIsOn = true;

  volumeButton.addEventListener('click', () => {
    
    // Volume is on and user clicked it off
    if (volumeIsOn) {
      // set sound off
      gameOverSound.volume = 0;
      // change image and attributes to mute
      volumeIcon.src ="/assets/images/volume-xmark-solid-full.svg";
      volumeIcon.alt = "Sound off";
      volumeButton.setAttribute("aria-label", "Unmute sound");
    } else {
      // set sound on
      gameOverSound.volume = 0.1;
      // change image and attributes to full volume
      volumeIcon.src ="/assets/images/volume-high-solid-full.svg";
      volumeIcon.alt = "Sound on";
      volumeButton.setAttribute("aria-label", "Mute sound");
    }
    
    // toggle volumeIsOn to the opposite value
    volumeIsOn = !volumeIsOn;
  });


  // Learn More section
  // Show a window with a link to the repo and to each developer
  
  const learnMoreBtn = document.getElementById("learnMoreBtn");
  const learnMoreContainer = document.getElementById("LearnMoreContainer");
  learnMoreBtn.addEventListener('click', () => {
    startScreen.style.display = "none";
    learnMoreBtn.style.display = "none";
    learnMoreContainer.style.display = "block";
    learnMoreContainer.innerHTML = `
      <div class="screen-inner">
        <h2>CIS 185 - Web Development</h2>
        <p>Final game project side scrolling adventure<p>
        <p>You can find the Git repository <a href="https://github.com/itspacrat/CIS185_fall2025_final/tree/main" target="_blank">here</a></p>
        <p>Developers</p>
        <div class="dev-container">
          <div>Blake
          </div>
          <div>Dodge
          </div>
          <div>Jason
          </div>
        </div>
        <button id="returnToGameBtn" class='btn return-to-game-btn'>return to game</button>
      </div>
    `

    const returnToGameBtn = document.getElementById("returnToGameBtn");

    returnToGameBtn.addEventListener('click', () =>{
      startScreen.style.display = "block";
      learnMoreContainer.style.display = "none";
      learnMoreBtn.style.display = "block";
    })

  })


// SAVE BUTTON AND INITIALS INPUT //

//  HIGH SCORE SAVE  //
  const saveScoreBtn = document.getElementById('saveScoreBtn');
  const initialsInput = document.getElementById('initialsInput');

  saveScoreBtn.addEventListener('click', () => {
  const initials = initialsInput.value.trim().toUpperCase();

  if (!initials) {
    alert("Enter initials first!");
    return;
  }
  let highScores = JSON.parse(localStorage.getItem('highScores')) || [];
  

  // NEW SCORE ENTRY
  highScores.push({
    initials,
    score,
  });

// SAVE TO LOCAL STORAGE
localStorage.setItem('highScores', JSON.stringify(highScores));

// RELOAD SCORES & UPDATE UI
highScores = JSON.parse(localStorage.getItem('highScores')) || [];
highScores.sort((a, b) => b.score - a.score);
highScores = highScores.slice(0, 5);
refreshHighScores();

// HIDE UI
initialsInput.style.display = 'none';
saveScoreBtn.style.display = 'none';

alert("Score Saved!");

});


 // CLEAR SCORES BUTTON
document.getElementById('clearScoresBtn').addEventListener('click', () => {
  localStorage.removeItem('highScores');
  highScores = [];
  refreshHighScores();
});


  class InputHandler {
    constructor() {
      this.keys = [];
      window.addEventListener('keydown', e => {
        if ((e.key === 'ArrowDown' ||
          e.key === 'ArrowUp' ||
          e.key === 'ArrowLeft' ||
          e.key === 'ArrowRight' ||
          e.key === ' ' || // Added space and wasd keys for alternative controls keypdown
          e.key === 'w' ||
          e.key === 'a' ||
          e.key === 's' ||
          e.key === 'd'
        )
          && this.keys.indexOf(e.key) === -1) {
          this.keys.push(e.key);
        }
        // console.log(e.key, this.keys);
      });
      window.addEventListener('keyup', e => {

        if (e.key === 'ArrowDown' ||
          e.key === 'ArrowUp' ||
          e.key === 'ArrowLeft' ||
          e.key === 'ArrowRight' ||
          e.key === ' ' || // Added space and wasd keys for alternative controls keyup
          e.key === 'w' ||
          e.key === 'a' ||
          e.key === 's' ||
          e.key === 'd') {
          // this.keys.splice(e.key.indexOf(e.key), 1)
          const index = this.keys.indexOf(e.key);
          if (index > -1) this.keys.splice(index, 1);
          // console.log(e.key, this.keys);
        }
      });
    }
  }
  // ENGINE STYLE CLASSES
  function isColliding(a, b) {
    const dx = (b.x + b.width / 2) - (a.x + a.width / 2);
    const dy = (b.y + b.height / 2) - (a.y + a.height / 2);
    const distance = Math.sqrt(dx * dx + dy * dy);
    return (distance < b.width / 2 + a.width / 2);
  }
  class Player {

    isCollidingWith(b) {
      return isColliding(this, b);
    }
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
      this.frameInterval = 1000 / this.fps;
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
      context.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
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
        // utilize isCollidingWith method
        if (this.isCollidingWith(enemy)) {
          if (!gameOver) {
            gameOverSound.play();
            document.getElementById('retryBtn').style.display = 'block';
            document.getElementById('initialsInput').style.display = 'block';
            document.getElementById('saveScoreBtn').style.display = 'block';
            document.getElementById('clearScoresBtn').style.display = 'block';

          }
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
      if (input.keys.indexOf('ArrowRight') > -1 || input.keys.indexOf('d') > -1) {
        this.speed = 5;

      } else if (input.keys.indexOf('ArrowLeft') > -1 || input.keys.indexOf('a') > -1) {
        this.speed = -5;

      } else if (
        (
          input.keys.indexOf('ArrowUp') > -1 ||
          input.keys.includes('w') ||
          input.keys.includes(' ')
        )
        && this.onGround()
      ) {
        this.velocityY -= 32;

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
      this.frameInterval = 1000 / this.fps;
      this.speed = 8;

      this.markedForDeletion = false;
    }
    draw(context) {
      context.strokeStyle = 'white';
      context.strokeRect(this.x, this.y, this.width, this.height);

      context.beginPath();
      context.strokeStyle = "blue";
      context.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
      context.stroke();

      context.beginPath();
      context.strokeStyle = 'red'
      context.arc(this.x, this.y, this.width / 2, 0, Math.PI * 2);
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
      if (this.x < 0 - this.width) {
        this.markedForDeletion = true;
        score++;
      }
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
      context.fillText('Game Over, try again!', canvas.width / 2, 200);
      context.fillStyle = 'white';
      context.fillText('Game Over, try again!', canvas.width / 2, 202);

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

    player.update(input, deltaTime);
    background.update();
    displayStatusText(ctx); // draw the score card

        if (!gameOver) {
  requestAnimationFrame(animate);
    } else {
    document.querySelector('.highScoreBox').style.display = 'block';
  }
}



  // Demo of the background to run while start menu
  function welcomeDemo(timeStamp) {
    if (gameStart) return;

    // most screens run at 60fps
    const deltaTime = timeStamp - lastTime; // 29:00 talks about delta time (requestAnimationFrame auto creates a timeStamp)
    // console.log(deltaTime) // 1000ms/xfps (my fps is 240HZ, if yours is at 60fps, deltaTime is around 16)
    lastTime = timeStamp;
    // on each render, clear the previous player drawing.
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    background.draw(ctx);
    handleEnemies(deltaTime); // draw the enemies

    background.update();
    requestAnimationFrame(welcomeDemo)
  }

  welcomeDemo(0);
  // endless loop!
  // animate(0);
});

