import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Breadcrumb.css';

function Breadcrumb({ crumbs }) {
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <React.Fragment key={i}>
            {i > 0 && <span className="breadcrumb-sep">/</span>}
            {isLast || !crumb.to ? (
              <span className={isLast ? 'breadcrumb-current' : ''}>{crumb.label}</span>
            ) : (
              <Link to={crumb.to}>{crumb.label}</Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

export default Breadcrumb;
