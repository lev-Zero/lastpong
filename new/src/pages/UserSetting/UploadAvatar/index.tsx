import React from "react";
import { useRef, useState } from "react";
import { Avatar, Text, Flex, Input, Box } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { ThemaButton } from "../../../UI/atoms/ThemaButton";
import "./index.css";
import useLoginStore from "../../../store/useLoginStore";

export function SetAvatar() {
  const { avatarImg, setAvatarImg } = useLoginStore();
  const selectFile = useRef<HTMLInputElement>(null);
  const selectAvatar = useRef<HTMLSpanElement>(null);
  const [ImageFile, setImageFile] = useState<any>(null);

  const reader = new FileReader();

  const onChangeInput = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.currentTarget.files !== null) {
      if (event.currentTarget.files.length === 0) return;
      const file = event.currentTarget.files[0];
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setImageFile(reader.result);
        setAvatarImg(reader.result);
      };
    }
  };

  const onClickNext = (event: React.MouseEvent<HTMLElement>) => {
    // if (reader.result !== null)
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
          <Avatar size={"full"} src={avatarImg} ref={selectAvatar} />
        </Box>
        <ThemaButton
          label="UPLOAD"
          onClick={() => selectFile.current?.click()}
          disabled={false}
        />
        <Link to="/Test">
          <ThemaButton label="NEXT" onClick={onClickNext} disabled={false} />
        </Link>
      </Flex>
    </div>
  );
}
