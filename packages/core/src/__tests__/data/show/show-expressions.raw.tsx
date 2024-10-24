interface Props {
  conditionA: boolean;
  conditionB: boolean;
}

export default function ShowWithOtherValues(props: Props) {
  return (
    <div>
      {props.conditionA ? 'Content0' : 'ContentA'}

      {props.conditionA ? 'ContentA' : null}
      {props.conditionA ? null : 'ContentA'}

      {props.conditionA ? 'ContentB' : undefined}
      {props.conditionA ? undefined : 'ContentB'}

      {props.conditionA ? 'ContentC' : true}
      {props.conditionA ? true : 'ContentC'}

      {props.conditionA ? 'ContentD' : false}
      {props.conditionA ? false : 'ContentD'}

      {props.conditionA ? 'ContentE' : 'hello'}
      {props.conditionA ? 'hello' : 'ContentE'}

      {props.conditionA ? 'ContentF' : 123}
      {props.conditionA ? 123 : 'ContentF'}

      {props.conditionA === 'Default' ? '4mb' : props.conditionB === 'Complete' ? '20mb' : '9mb'}
      {props.conditionA === 'Default' ? (props.conditionB === 'Complete' ? '20mb' : '9mb') : '4mb'}

      {props.conditionA === 'Default' ? (
        props.conditionB === 'Complete' ? (
          <div>complete</div>
        ) : (
          '9mb'
        )
      ) : props.conditionC === 'Complete' ? (
        'dff'
      ) : (
        <div>complete else</div>
      )}
    </div>
  );
}
