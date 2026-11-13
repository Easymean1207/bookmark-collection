import { cookies } from "next/headers";
import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";

async function Todos() {
  const supabase = createClient(await cookies());
  const { data: todos } = await supabase.from("todos").select();

  return (
    <ul>
      {todos?.map((todo) => (
        <li key={todo.id}>{todo.name}</li>
      ))}
    </ul>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<p>Loading todos...</p>}>
      <Todos />
    </Suspense>
  );
}
