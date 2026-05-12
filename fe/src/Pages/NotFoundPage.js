import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/NotFoundPage.css';

import Header from '../Components/Header';
import Footer from '../Components/Footer';

function NotFoundPage() {
  return (
    <div className="not-found">
      <Header />
      <div className="not-found-content">
        <div className="not-found-code" aria-hidden="true">404</div>
        <div className="not-found-body">
          <h1 className="not-found-title">Page not found</h1>
          <p className="not-found-sub">
            The page you're looking for doesn't exist or may have been moved.
          </p>
          <Link className="not-found-home" to="/">
            Go back home
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default NotFoundPage;
