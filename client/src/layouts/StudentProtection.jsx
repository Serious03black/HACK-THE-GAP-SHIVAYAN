
import { Outlet } from 'react-router-dom';

const StudentProtection = () => {
    const examUser = localStorage.getItem("examUser");
    if (examUser !== "student") {
        return <h1>You are not authorized to access this page.</h1>;
    }

    return (
        <Outlet />
    );
};

export default StudentProtection;