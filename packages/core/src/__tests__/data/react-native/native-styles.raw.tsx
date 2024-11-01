import { useState } from '@builder.io/mitosis';

export default function MyBasicComponent() {
  const [classState, setClassState] = useState('testClassName');

  return (
    <div>
      <div
        css={{
          background: '#971f1f',
          padding: '20px 20px 20px 20px',
          borderRadius: '10px',
          borderWidth: '2px',
          borderColor: 'blue',
          borderStyle: 'solid',
          fontSize: '16px',
          fontWeight: 'bold',
          fontFamily: 'Arial',
        }}
      >
        Hey world
      </div>

      <div
        css={{
          margin: '10px 15px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          height: '200px',
          color: 'green',
          fontSize: '20px',
        }}
      >
        Flex container
      </div>

      <div
        css={{
          backgroundColor: 'rgba(255, 0, 0, 0.5)',
          opacity: '0.8',
          transform: 'scale(1.1)',
          boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
          textShadow: '1px 1px 2px black',
        }}
      >
        Testing unsupported properties
      </div>
    </div>
  );
}
