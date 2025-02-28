export default function MyNormalizedLayerNamesComponent(props: { id: string }) {
  return (
    <section>
      <div $name="🌟layer-name">Emoji</div>
      <div $name="---">Dashes</div>
      <div $name="CamelCase">CamelCase</div>
      <div $name="123my@Class-Name!">Special chars</div>
      <div $name="--my--@custom--name--">Special chars with dashes</div>
      <div $name="0" css={{ margin: '10px' }}>
        Single Number
      </div>
      <div $name="123" css={{ padding: '10px' }}>
        Multiple Numbers
      </div>
      <div $name="name123" css={{ border: '1px solid' }}>
        Chars with numbers at end
      </div>
      <div $name="456name" css={{ color: 'red' }}>
        Chars with numbers at start
      </div>
      <div $name="name-789" css={{ background: 'blue' }}>
        Numnbers separated by dash
      </div>
      <div $name="🚀">Emoji</div>
      <div css={{ background: 'blue' }} data-name="1">
        Number
      </div>
    </section>
  );
}
