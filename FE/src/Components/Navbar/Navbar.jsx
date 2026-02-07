import React, { useContext, useRef, useState } from 'react'
import './Navbar.css'
import logo from '../Assets/Frontend_Assets/logo.png'
import cart_icon from '../Assets/Frontend_Assets/cart_icon.png'
import { Link } from 'react-router-dom'
import { ShopContext } from '../../Context/ShopContext'
import nav_dropdown from '../Assets/Frontend_Assets/nav_dropdown.png'

const Navbar = () => {
  const [menu, setMenu] = useState("shop")
  const { getTotalCartItems } = useContext(ShopContext)
  const menuRef= useRef()

  const dropdown_toggle = (e)=>{
     menuRef.current.classList.toggle('nav-menu-visible');
     e.target.classList.toggle('open');
  }

  return (
    <div className="navbar">

      <div className="nav-logo">
        <img src={logo} alt="logo" />
        <p>ShopSphere</p>
      </div>
      <img className='nav-dropdown'onClick={dropdown_toggle}src={nav_dropdown} alt=""/>
      <ul ref={menuRef} className="nav-menu">
        <li onClick={() => setMenu("shop")}>
          <Link to="/" style={{ textDecoration: 'none' }}>Shop</Link>
          {menu === "shop" && <hr />}
        </li>

        <li onClick={() => setMenu("men")}>
          <Link to="/men" style={{ textDecoration: 'none' }}>Men</Link>
          {menu === "men" && <hr />}
        </li>

        <li onClick={() => setMenu("women")}>
          <Link to="/women" style={{ textDecoration: 'none' }}>Women</Link>
          {menu === "women" && <hr />}
        </li>

        <li onClick={() => setMenu("kids")}>
          <Link to="/kids" style={{ textDecoration: 'none' }}>Kids</Link>
          {menu === "kids" && <hr />}
        </li>
      </ul>

      <div className="nav-login-cart">
        {localStorage.getItem('auth-token')
        ?<button onClick={()=>{localStorage.removeItem('auth-token');window.location.replace("/")}}>Logout</button>:<Link to="/login">
          <button>Login</button>
        </Link>
}
       
        <Link to="/cart" className="nav-cart-container">
          <img src={cart_icon} alt="cart" />
          {getTotalCartItems() >= 0 && (
            <span className="nav-cart-count">
              {getTotalCartItems()}
            </span>
          )}
        </Link>
      </div>

    </div>
  )
}

export default Navbar
