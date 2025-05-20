export default function MyComponent(props) {
  return (
    <div
      $name="HeroWithChildren"
      css={{
        backgroundColor: 'rgba(250, 250, 250, 1)',
        display: 'flex',
        paddingTop: '99px',
        paddingBottom: '107px',
        flexDirection: 'column',
        alignItems: 'center',
        fontFamily: 'Poppins, -apple-system, Roboto, Helvetica, sans-serif',
        fontFeatureSettings: "'liga' off, 'clig'",
        textAlign: 'center',
        justifyContent: 'start',
        '@media (max-width: 991px)': {
          paddingBottom: '100px',
        },
      }}
    >
      WHAT'S DIFFERENT ABOUT SHOPAHOLIC
    </div>
  );
}
