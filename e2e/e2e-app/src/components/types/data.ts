export type OutsideProps = {
  text: string;
  onGetClicked?: () => void;
  onEnter?: () => void;

  // any type is a workaround for qwik
  onGetClicked$?: any;
  onEnter$?: any;
};

export type OutsideState = {
  _text?: string;
  handleClick: () => void;
};
