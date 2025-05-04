import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const PageNav = () => {
  const location = useLocation();
  const paths = location.pathname.split('/').filter((path) => path);

  return (
    <div className="page-div">
      
    </div>
  );
};

export default PageNav;
