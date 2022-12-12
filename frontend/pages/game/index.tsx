import React, {useCallback} from 'react';

// Game Board
let gameBoardHeight : number = 500;
let gameBoardWidth  : number = 500;
let intervalID  : number;

//Ball
let ballPosX  : number  = gameBoardHeight / 2;
let ballPosY  : number  = gameBoardWidth / 2;
let ballDirX  : number  = 1;
let ballDirY  : number  = 1;
let ballSpeed : number  = 1;
const paddleSpeed : number = 50;
const ballRadius : number  = 12.5;

//Score
let player1Score : number = 0;
let player2Score : number = 0;

let paddle1 = {
  width : 25,
  height: 100,
  x : 0,
  y : gameBoardHeight / 2 - 50
}

let paddle2 = {
  width : 25,
  height: 100,
  x : gameBoardWidth - 25,
  y : gameBoardHeight / 2 - 50
};


function gameStart(context : CanvasRenderingContext2D){
    createBall(context);
    nextTick(context );
};

//주기 함수 호출
function nextTick(context : CanvasRenderingContext2D){
  intervalID = window.setInterval(()=> {
    clearBoard(context);
    drawPaddles(context);
    moveBall();
    drawBall(context);
    checkCollision(context);
  }, 10)
};

//화면초기화
function clearBoard(context : CanvasRenderingContext2D){
  context.strokeStyle = "black"
  context.lineWidth = 2;
  context.fillStyle = "#e3e3e3"
  context.fillStyle = "#"
  context.fillRect(0,0, 500, 500)
};

//플레이어 
function drawPaddles(context : CanvasRenderingContext2D){
  context.strokeStyle = "black"
  context.fillStyle = "red"
  context.fillRect(paddle1.x, paddle1.y, paddle1.width, paddle1.height);
  context.strokeRect(paddle1.x, paddle1.y, paddle1.width, paddle1.height);

  context.strokeStyle = "black"
  context.fillStyle = "blue"
  context.fillRect(paddle2.x, paddle2.y, paddle2.width, paddle2.height);
  context.strokeRect(paddle2.x, paddle2.y, paddle2.width, paddle2.height);
};

//초기화시 볼 변수 초기화
function createBall(context : CanvasRenderingContext2D){
    ballSpeed = 1;
    if(Math.round(Math.random()) === 1)
    {
        ballDirX = 1;
    }
    else
    {
        ballDirX = -1;
    }
    if(Math.round(Math.random()) === 1)
    {
        ballDirY = 1;
    }
    else
    {
        ballDirY = -1;
    }
    ballPosX = gameBoardWidth / 2;
    ballPosY = gameBoardHeight / 2;
    drawBall(context);
};

function moveBall(){
  ballPosX += (ballSpeed * ballDirX);
  ballPosY += (ballSpeed * ballDirY);
};

function drawBall(context : CanvasRenderingContext2D){
    context.fillStyle = "#0f0";
    context.strokeStyle = "black";
    context.lineWidth = 3;
    context.beginPath();
    context.arc(ballPosX, ballPosY, ballRadius, 0, 2 * Math.PI);
    context.stroke();
    context.fill();
};

//벽 접촉 체크 및
function checkCollision(context : CanvasRenderingContext2D){
  // Y
  if(ballPosY <= 0 + ballRadius){
    ballDirY *= -1;
  }
  if(ballPosY >= gameBoardHeight - ballRadius){
    ballDirY *= -1;
  }

  // X
  if(ballPosX <= 0){
      player2Score += 1;
      // updateScore();  
      createBall(context);
      return;
  }
  if(ballPosX >= gameBoardWidth){
      player1Score += 1;
      // updateScore();  
      createBall(context);
      return;
  }
  
  //ballPosX 조정하는 이유 : 플레이어가 옆면으로 접속하게 됬을때 공이 패들에 갖히게 되는것을 피하기 위해
  if (ballPosX <= (paddle1.x + paddle1.width + ballRadius))
  {
      if(ballPosY > paddle1.y && ballPosY < paddle1.y + paddle1.height)
      {
          ballPosX = paddle1.x + paddle1.width + ballRadius; 
          ballDirX *= -1;
          ballSpeed += 1;
      }
  }
  if (ballPosX >= (paddle2.x - ballRadius))
  {
      if(ballPosY > paddle2.y && ballPosY < paddle2.y + paddle2.height)
      {
          ballPosX = paddle2.x - ballRadius;
          ballDirX *= -1;
          ballSpeed += 1;
      }
  }
};

function updateScore(context : CanvasRenderingContext2D){
  // .textContent = `${player1Score} : ${player2Score}`
};

function resetGame(context : CanvasRenderingContext2D){
  player1Score = 0;
  player2Score = 0;
  paddle1 = {
    width : 25,
    height: 100,
    x : 0,
    y : gameBoardHeight / 2
  }
  
  paddle2 = {
    width : 25,
    height: 100,
    x : gameBoardWidth - 25,
    y : gameBoardHeight / 2
  };

  ballSpeed = 1;
  ballPosX = 0;
  ballPosY = 0;
  ballDirX = 0;
  ballDirY = 0;
  // updateScore();
  clearInterval(intervalID);
  // gameStart();
};


function changeDir(e: React.KeyboardEvent<HTMLImageElement>){
  let keyPressed    = e.key;
  switch(keyPressed){
    case('w'):
      if (paddle1.y > 0){
          paddle1.y -= paddleSpeed;
          }
        break;
    case('s'):
      if (paddle1.y < gameBoardHeight - paddle1.height){
            paddle1.y += paddleSpeed;
          }
          break;
    case('i'):
      if (paddle2.y > 0){
            paddle2.y -= paddleSpeed;
          }
          break;
    case('k'):
      if (paddle2.y < gameBoardHeight - paddle2.height){
            paddle2.y += paddleSpeed;
          }
          break;
  }
}

const Pong = () => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  // ADDED

  React.useEffect(() => {
    if (!canvasRef.current)
      return;
    const canvas : HTMLCanvasElement = canvasRef.current!;                             
    const context : CanvasRenderingContext2D = canvas.getContext('2d')!; 
    gameStart(context);
  });

  return (
    <canvas
      ref={canvasRef}
      width="500"
      height="500"
      tabIndex={0}
      onKeyPress={changeDir}
    />
  )
};

export default Pong;