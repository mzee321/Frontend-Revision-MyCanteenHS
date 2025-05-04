import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const PageNav = () => {
  const location = useLocation();
  const paths = location.pathname.split('/').filter((path) => path);

  return (
    <div className="page-div">
      <ol>
        <li>
          <Link to="/" >Home</Link>
        </li>
        {paths.map((path, index) => {
          const fullPath = `/${paths.slice(0, index + 1).join('/')}`;
          const isLast = index === paths.length - 1;
          return (
            <li key={fullPath}>
              {isLast ? (
                <span>{path.charAt(0).toUpperCase() + path.slice(1)}</span>
              ) : (
                <Link to={fullPath}>
                  {path.charAt(0).toUpperCase() + path.slice(1)}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default PageNav;
