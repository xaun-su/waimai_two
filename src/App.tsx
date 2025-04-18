import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Button } from 'antd';

function Home() {
  return <h1>Home</h1>;
}

function About() {
  return <h1>About</h1>;
}

function App() {
  return (
    <BrowserRouter>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/about">About</Link>
            </li>
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Routes>

        <Button type="primary">Ant Design Button</Button>
      </div>
    </BrowserRouter>
  );
}

export default App;
