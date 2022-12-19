import React from "react";
import { useRef, useState } from "react";
import { Avatar, Text, Flex, Input, Box } from "@chakra-ui/react";
import { ThemaButton } from "../../../UI/atoms/ThemaButton";
import "./index.css";
import { fork } from "child_process";
import create from "zustand/react";

const useStore = create((state) => ({
  count: 0,
  // imgUrl: ArrayBuffer;
  // setUrl: (by : ArrayBuffer) => set((state))
}));

export function SetAvatar() {
  const selectFile = useRef<HTMLInputElement>(null);
  const selectAvatar = useRef<HTMLSpanElement>(null);
  const [ImageFile, setImageFile] = useState<any>(null);

  const onChangeInput = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.currentTarget.files !== null) {
      if (event.currentTarget.files.length === 0) return;
      const file = event.currentTarget.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setImageFile(reader.result);
      };
    }
  };
  return (
    <div className="SetAvatar">
      <Flex className="CenterFlex">
        <Text className="MenualText">PLEASE UPLOAD YOUR AVATAR</Text>
        <Input
          type={"file"}
          style={{ display: "none" }}
          ref={selectFile}
          accept={"image/*"}
          onChange={onChangeInput}
          id={"realPath"}
        />
        <Box width={"300px"} height={"300px"}>
          <Avatar size={"full"} src={ImageFile} ref={selectAvatar} />
        </Box>
        <ThemaButton
          label="UPLOAD"
          onClick={() => selectFile.current?.click()}
        />
        <ThemaButton label="NEXT" onClick={() => console.log(1)} />
      </Flex>
    </div>
  );
}
