import ShowPost from "./components/ShowPost";
import PostForm from "./components/PostForm";


function App() {
  return (
    <div className="mx-auto max-w-4xl bg-gray-800 p-6 text-white">
      <PostForm />
      <ShowPost userId={4} />
    </div>
  );
}

export default App;
