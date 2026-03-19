export async function fetchCounterAPI() {
  const res = await fetch("https://api.example.com/counter");

  if (!res.ok) throw new Error("Failed to fetch counter");

  const data = await res.json();
  return data.value;
}

export async function updateCounterAPI(value) {
  const res = await fetch("https://api.example.com/counter", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value }),
  });

  if (!res.ok) throw new Error("Failed to update counter");
  const data = await res.json();
  return data.value;
}
