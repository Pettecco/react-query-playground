import { useQuery } from '@tanstack/react-query';

function App() {
  const { data } = useQuery({
    queryKey: ['pokemon'],
    queryFn: async () => {
      const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=20');
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      return res.json();
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center">
      <h1>Bem vindo ao QueryDex</h1>
      <div>{JSON.stringify(data)}</div>
    </div>
  );
}

export default App;
