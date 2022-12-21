import React, { useEffect, useState } from "react";
import { Flex, Button } from "@chakra-ui/react";

//TODO: 1초마다 갱신 보장하는것 어떻게 했더라 ...
function Modal(props: any) {
    const [timeSpent, setTimeSpent] = useState<number>();

    useEffect(() => {
        setTimeSpent(0);
    }, []);

    useEffect(() => {
        setTimeout(increaseTime, 1000);
    }, [timeSpent]);

    function increaseTime() {
        setTimeSpent((prevState: any) => {
            return prevState + 1;
        });
    }

    return (
        <div
            style={{
                textAlign: "center",
                display: "inline-block",
                position: "absolute",
                left: "30%",
                top: "35%",
                width: "25%",
                height: "40%",
                fontSize: "300%",
                alignContent: "center",
                color: "white",
                backgroundColor: "#4267b2",
                borderColor: "black",
                border: "5px",
                borderStyle: "solid",
                borderWidth: "3px",
                borderRadius: "60px",
                margin: "auto",
            }}
        >
            <h6>LOOKING FOR AN OPPONENT...</h6>
            <h2>{timeSpent}</h2>
            <Button
                onClick={props.closed}
                style={{
                    position: "relative",
                    width: "35%",
                    height: "20%",
                    fontSize: "90%",
                    color: "white",
                    backgroundColor: "#4267b2",
                    borderColor: "black",
                    border: "5px",
                    borderStyle: "solid",
                    borderWidth: "3px",
                    borderRadius: "60px",
                }}
                _active={{
                    transform: "scale(0.95)",
                }}
            >
                CANCEL
            </Button>
        </div>
    );
}

export default Modal;
