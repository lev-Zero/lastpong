import React from "react";
import { useRef, useEffect } from "react";
import LayoutWithoutSidebar from "@/layouts/LayoutWithoutSidebar";
import Head from "next/head";
import { ReactElement } from "react";
import useGameStore from "@/store/useGameStore";
import { Flex, Box, Text, Button } from "@chakra-ui/react";

// Game Board
let gameBoardHeight: number = 800;
let gameBoardWidth: number = 1400;
let ballRadius: number = 12.5;

const styles = {
  MainLayout: {
    width: "100vw",
    height: "92vh",
    alignItems: "center",
    justifyContent: "center",
    flexDir: "row",
    backgroundColor: "gold",
  } as React.CSSProperties,

  PlayerLayout: {
    width: "300px",
    height: "800px",
  } as React.CSSProperties,

  PlayerBoxLayout: {
    width: "150px",
    height: "200px",
    marginTop: "200px",
  } as React.CSSProperties,

  GameLayout: {
    width: "1400px",
    height: "800px",
  } as React.CSSProperties,

  TextUser: {
    fontSize: "40px",
    margin: "0",
    color: "black",
  } as React.CSSProperties,

  TextScore: {
    fontSize: "160px",
    margin: "0",
    color: "black",
  } as React.CSSProperties,
};

export default function GamePage() {
  const {
    p1Name,
    p1Score,
    p2Name,
    p2Score,
    ballPosX,
    ballPosY,
    paddle1PosY,
    paddle2PosY,
    setPaddle1PosY,
  } = useGameStore();

  let paddle1 = {
    width: 25,
    height: 100,
    x: 0,
    y: gameBoardHeight / 2 - 50,
  };

  let paddle2 = {
    width: 25,
    height: 100,
    x: gameBoardWidth - 25,
    y: gameBoardHeight / 2 - 50,
  };

  function clearBoard(context: CanvasRenderingContext2D) {
    context.strokeStyle = "black";
    context.lineWidth = 2;
    context.fillStyle = "#e3e3e3";
    context.fillStyle = "#";
    context.fillRect(0, 0, 1400, 800);
  }

  function drawPaddles(context: CanvasRenderingContext2D) {
    context.strokeStyle = "black";
    context.fillStyle = "white";
    context.fillRect(paddle1.x, paddle1PosY, paddle1.width, paddle1.height);
    context.strokeRect(paddle1.x, paddle1PosY, paddle1.width, paddle1.height);

    context.strokeStyle = "black";
    context.fillStyle = "white";
    context.fillRect(paddle2.x, paddle2PosY, paddle2.width, paddle2.height);
    context.strokeRect(paddle2.x, paddle2PosY, paddle2.width, paddle2.height);
  }

  function drawBall(context: CanvasRenderingContext2D) {
    context.fillStyle = "#0f0";
    context.strokeStyle = "black";
    context.lineWidth = 3;
    context.beginPath();
    context.arc(ballPosX, ballPosY, ballRadius, 0, 2 * Math.PI);
    context.stroke();
    context.fill();
  }

  function changeDir(e: React.KeyboardEvent<HTMLImageElement>) {
    let keyPressed = e.key;
    switch (keyPressed) {
      case "w":
        if (paddle1PosY > 0) {
          setPaddle1PosY(paddle1PosY - 50);
        }
        break;
      case "s":
        if (paddle1PosY < gameBoardHeight - paddle1.height) {
          setPaddle1PosY(paddle1PosY + 50);
        }
        break;
    }
  }

  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  React.useEffect(() => {
    if (!canvasRef.current) return;
    const canvas: HTMLCanvasElement = canvasRef.current!;
    const context: CanvasRenderingContext2D = canvas.getContext("2d")!;

    clearBoard(context);
    drawBall(context);
    drawPaddles(context);
  });
  return (
    <>
      <Head>
        <title>게임 | LastPong</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Flex style={styles.MainLayout}>
          <Flex style={styles.PlayerLayout}>
            <Box style={styles.PlayerBoxLayout}>
              <Text style={styles.TextUser}>{p1Name}</Text>
              <Text style={styles.TextScore}>{p1Score}</Text>
            </Box>
          </Flex>
          <Box width={"1400px"} height={"800px"} bg={"black"}>
            <canvas
              ref={canvasRef}
              width={gameBoardWidth}
              height={gameBoardHeight}
              tabIndex={0}
              onKeyPress={changeDir}
            />
          </Box>
          <Flex style={styles.PlayerLayout}>
            <Box style={styles.PlayerBoxLayout} marginLeft="180px">
              <Text style={styles.TextUser}>{p2Name}</Text>
              <Text style={styles.TextScore}>{p2Score}</Text>
            </Box>
          </Flex>
        </Flex>
      </main>
    </>
  );
}

GamePage.getLayout = function (page: ReactElement) {
  return <LayoutWithoutSidebar>{page}</LayoutWithoutSidebar>;
};
