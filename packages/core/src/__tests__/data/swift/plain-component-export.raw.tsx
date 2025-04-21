import { Image } from '@components';

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
        textAlign: 'center',
        justifyContent: 'start',
        '@media (max-width: 991px)': {
          paddingBottom: '100px',
        },
      }}
    >
      {Array.from({ length: 10 }, (person, count) => {
        console.log(person);
        return (
          <span>
            {person} {count}
          </span>
        );
      })}
      <div
        css={{
          display: 'flex',
          width: '1243px',
          maxWidth: '100%',
          flexDirection: 'column',
          alignItems: 'stretch',
        }}
      >
        <div
          $name="WHAT'S DIFFERENT ABOUT SHOPAHOLIC"
          css={{
            color: '#000',
            fontSize: '25px',
            fontStyle: 'normal',
            fontWeight: '600',
            lineHeight: 'normal',
            letterSpacing: '5.25px',
            alignSelf: 'center',
            '@media (max-width: 991px)': {
              maxWidth: '100%',
            },
          }}
        >
          WHAT'S DIFFERENT ABOUT SHOPAHOLIC
        </div>
        <div
          css={{
            color: '#000',
            fontSize: '18px',
            fontStyle: 'normal',
            fontWeight: '400',
            lineHeight: '1.6',
            maxWidth: '800px',
            margin: '40px auto 0',
            '@media (max-width: 991px)': {
              maxWidth: '90%',
              fontSize: '16px',
            },
          }}
        >
          At Shopaholic, we're revolutionizing the online shopping experience through our commitment
          to sustainability, innovation, and customer satisfaction. Our unique approach combines
          lightning-fast delivery, eco-friendly practices, and cutting-edge technology to ensure you
          get the best products while minimizing environmental impact.
        </div>
        <div
          css={{
            display: 'flex',
            marginTop: '113px',
            alignItems: 'start',
            gap: '40px 100px',
            fontSize: '18px',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            '@media (max-width: 991px)': {
              maxWidth: '100%',
              marginTop: '40px',
            },
          }}
        >
          <div
            $name="IconCard"
            css={{
              display: 'flex',
              minWidth: '240px',
              minHeight: '268px',
              flexDirection: 'column',
              overflow: 'hidden',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '341px',
            }}
          >
            <div
              $name="assets_a87584e551b6472fa0f0a2eb10f2c0ff_a6b9b54b817a4350b286bb6daebbad80 1"
              css={{
                display: 'flex',
                minHeight: '91px',
                width: '91px',
              }}
            />
            <div
              $name="2-Day Shipping"
              css={{
                color: 'rgba(0, 0, 0, 1)',
                fontWeight: '700',
                letterSpacing: '3.78px',
                marginTop: '21px',
              }}
            >
              2-Day Shipping
            </div>
            <div
              $name="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam posuere erat a ante vestibulum, in volutpat ligula elementum."
              css={{
                color: '#000',
                fontStyle: 'normal',
                fontWeight: '400',
                lineHeight: 'normal',
                marginTop: '21px',
              }}
            >
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam posuere erat a ante
              vestibulum, in volutpat ligula elementum.
            </div>
          </div>
          <div
            $name="IconCard"
            css={{
              display: 'flex',
              minWidth: '240px',
              minHeight: '268px',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '341px',
            }}
          >
            <Image
              $name="assets_a87584e551b6472fa0f0a2eb10f2c0ff_a6b9b54b817a4350b286bb6daebbad80 1"
              image="https://cdn.builder.io/api/v1/image/assets/cc2296d13ce34ad099275699f1dacdd3/c8b7932e8101830763605c2767a2a74d7d969e9b5264075696a53cc45f3782be?placeholderIfAbsent=true"
              backgroundSize="contain"
              aspectRatio={1}
              noWebp={true}
              css={{
                position: 'relative',
                display: 'flex',
                width: '91px',
                overflow: 'hidden',
              }}
            />
            <div
              $name="2-Day Shipping"
              css={{
                color: 'rgba(0, 0, 0, 1)',
                fontWeight: '700',
                letterSpacing: '3.78px',
                marginTop: '21px',
              }}
            >
              Carbon Neutral
            </div>
            <div
              $name="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam posuere erat a ante vestibulum, in volutpat ligula elementum."
              css={{
                color: '#000',
                fontStyle: 'normal',
                fontWeight: '400',
                lineHeight: 'normal',
                marginTop: '21px',
              }}
            >
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam posuere erat a ante
              vestibulum, in volutpat ligula elementum.
            </div>
          </div>
          <div
            $name="IconCard"
            css={{
              display: 'flex',
              minWidth: '240px',
              minHeight: '268px',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '341px',
            }}
          >
            <Image
              $name="assets_a87584e551b6472fa0f0a2eb10f2c0ff_a6b9b54b817a4350b286bb6daebbad80 1"
              image="https://cdn.builder.io/api/v1/image/assets/cc2296d13ce34ad099275699f1dacdd3/deb954f9a60494f01064d6b7ae9a3b19e15f8c86edb8783a237f0b5c953139c0?placeholderIfAbsent=true"
              backgroundSize="contain"
              aspectRatio={1}
              noWebp={true}
              css={{
                position: 'relative',
                display: 'flex',
                width: '91px',
                overflow: 'hidden',
              }}
            />
            <div
              $name="2-Day Shipping"
              css={{
                color: 'rgba(0, 0, 0, 1)',
                fontWeight: '700',
                letterSpacing: '3.78px',
                marginTop: '21px',
              }}
            >
              Advanced Dye Tech
            </div>
            <div
              $name="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam posuere erat a ante vestibulum, in volutpat ligula elementum."
              css={{
                color: '#000',
                fontStyle: 'normal',
                fontWeight: '400',
                lineHeight: 'normal',
                marginTop: '21px',
              }}
            >
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam posuere erat a ante
              vestibulum, in volutpat ligula elementum.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
