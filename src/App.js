import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from 'antd';
import LayoutMenu from './components/LayoutMenu';
import Home from './pages/Home';
import BookDetail from './pages/BookDetail';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import './styles/App.css';

function App() {
  return (
    <BrowserRouter>
      <Layout style={{ minHeight: '100vh' }}>
        <LayoutMenu />
        <Layout.Content style={{ padding: '24px', marginLeft: 200 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/book/:id" element={<BookDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </Layout.Content>
      </Layout>
    </BrowserRouter>
  );
}

export default App;