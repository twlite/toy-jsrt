import {
  useStore,
  Renderer,
} from 'https://gist.githubusercontent.com/twlite/9fcf22c395b04ae4e66fa2ba1acb1f14/raw/b4a5b10aa6d4525ae8c6299f6ed5fe35d9fb24e2/react-in-a-nutshell.ts';

function Counter() {
  const [count, setCount] = useStore(0);

  setCount(count + 1);

  console.log('Counter', count);
}

for (let i = 0; i < 10; i++) {
  Renderer(Counter);
}

try {
  useStore(0);
} catch (e) {
  console.log('Test failed when calling useStore outside of Renderer call site');
  console.log(e)
}

/*
Output:
Counter 0
Counter 1
Counter 2
Counter 3
Counter 4
Counter 5
Counter 6
Counter 7
Counter 8
Counter 9
*/