export default function MyBasicComponent(props: { id: string }) {
  return (
    <p
      f={() => x}
      f1={(x) => x}
      f2={(x) => {}}
      f3={function () {
        return x;
      }}
      f4={function (x) {
        return x;
      }}
      f5={function (x) {
        return;
      }}
      f6={function () {
        return;
      }}
      f7={(a, b, c) => a + b + c}
    />
  );
}
