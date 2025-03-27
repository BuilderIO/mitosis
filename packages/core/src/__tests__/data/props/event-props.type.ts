export type EventProps = {
  onGetVoid: () => void;
  onEnter: () => string;
  onPass: (event: any) => void;
};

export type EventState = {
  handleClick: () => void;
};
