export interface MsgProps {
  username: string;
  text: string;
}

export interface DmMsgProps extends MsgProps {
  targetUsername: string;
}
