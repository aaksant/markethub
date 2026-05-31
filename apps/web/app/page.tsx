import { api } from "@/lib/treaty";

export default async function HomePage() {
  const { data: users } = await api.users.get();

  return (
    <div>
      <h1>users</h1>
      {users?.map((user) => (
        <p key={user.id}>{user.name}</p>
      ))}
    </div>
  );
}
