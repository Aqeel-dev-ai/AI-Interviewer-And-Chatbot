import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import Button from "./Button";

const NavbarLinks = ({ state }) => {
  const { User, handleLogout } = useAuth();
  const navigate = useNavigate();
  const pages = [
    { Page: "ChatBot", Path: "/app" },
    { Page: "Interview Form", Path: "/interview-form" },
    { Page: "About", Path: "/about" },
    { Page: "Contact Us", Path: "/contact" },
  ];

  const handleLogoutClick = () => {
    handleLogout(navigate);
  };

  return (
    <>
      {/*  Mobile view */}
      <ul
        className={`${state ? "translate-x-0" : "-translate-x-full"}
        inset-0 fixed flex  bg-black text-white items-center justify-center flex-col gap-10 text-xl font-bold transition-all duration-300 ease-in-out md:right-[55%] lg:hidden`}
      >
        {pages.map((obj, index) => {
          return (
            <NavLink
              to={obj.Path}
              key={index}
              className={({ isActive }) =>
                isActive ? "text-teal-500" : "text-white"
              }
            >
              {obj.Page}
            </NavLink>
          );
        })}
        {User ? (
          <Button text={"Logout"} Click={handleLogoutClick} Class="!text-white" />
        ) : (
          <NavLink to="/login">
            <Button text={"Get Started"} Class="!text-white" />
          </NavLink>
        )}
      </ul>
      {/* Laptop view */}
      <ul className="hidden items-center gap-6 text-white text-xl font-bold lg:flex">
        {pages.map((obj, index) => {
          return (
            <NavLink
              to={obj.Path}
              key={index}
              className={({ isActive }) =>
                isActive ? "text-teal-500" : "text-white"
              }
            >
              {obj.Page}
            </NavLink>
          );
        })}
      </ul>
    </>
  );
};

export default NavbarLinks;
