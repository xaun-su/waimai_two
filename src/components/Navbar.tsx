import React from 'react';
import { Link } from 'react-router-dom'; // 导入 Link 组件

function Navbar() {
  return (
    <nav style={{ backgroundColor: '#f0f0f0', padding: '10px' }}>
      <ul style={{ listStyleType: 'none', margin: 0, padding: 0, display: 'flex', justifyContent: 'space-around' }}>
        <li>
          <Link to="/" style={{ textDecoration: 'none', color: 'black' }}>Home</Link>
        </li>
        <li>
          <Link to="/about" style={{ textDecoration: 'none', color: 'black' }}>About</Link>
        </li>
        <li>
          <Link to="/products" style={{ textDecoration: 'none', color: 'black' }}>Products</Link>
        </li>
        <li>
          <Link to="/account/list" style={{ textDecoration: 'none', color: 'black' }}>Accounts</Link>
        </li>
        <li>
          <Link to="/goods/list" style={{ textDecoration: 'none', color: 'black' }}>Goods</Link>
        </li>
        <li>
          <Link to="/login" style={{ textDecoration: 'none', color: 'black' }}>Login</Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
