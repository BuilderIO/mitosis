export default function MyComponent(props) {
  return (
    <div>
      <CustomComponent
        tooltipPlacementOptions={{
          positions: ['left', 'bottom', 'bottom-left'],
          offsets: {
            left: { topOffset: 0, leftOffset: -24 },
            bottom: { topOffset: 24, leftOffset: 0 },
            'bottom-left': { topOffset: 24, leftOffset: 0 },
          },
        }}
      >
        test
      </CustomComponent>
    </div>
  );
}
