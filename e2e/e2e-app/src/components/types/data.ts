export type Props = {
  text: string;
  onGetClicked: () => void;
  onEnter: () => void;
};

export type OutsideState = {
  _text?: string;
  handleClick: () => void;
};
