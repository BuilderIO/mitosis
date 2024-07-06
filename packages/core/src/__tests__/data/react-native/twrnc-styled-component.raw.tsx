export default function MyComponent(props) {
    return (
      <div class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        <button onClick={(e) => console.log('event')}>Hello</button>
      </div>
    );
  }
