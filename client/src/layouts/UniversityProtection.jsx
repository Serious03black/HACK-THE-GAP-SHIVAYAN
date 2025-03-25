
import { Outlet } from 'react-router-dom';

const UniversityProtection = () => {

  const examUser = localStorage.getItem("examUser");
  if (examUser !== "university") {
    return <h1>You are not authorized to access this page.</h1>;
  }

  return (
      <Outlet />
  );
};

export default UniversityProtection;