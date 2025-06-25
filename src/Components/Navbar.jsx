import { useEffect, useState } from "react";
import { MenuRounded, ManageHistoryOutlined } from "@mui/icons-material";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import Button from "./Button";
import NavbarLinks from "./NavbarLinks";
import { useAuth } from "../Context/AuthContext";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { User, handleLogout } = useAuth();
  const URL = useLocation();
  const navigate = useNavigate();

  const handleToggle = () => {
    setOpen(!open);
  };

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    setOpen(false);
  }, []);

  const handleLogoutClick = () => {
    handleLogout(navigate);
  };

  return (
    <>
      <nav className="sticky bg-[#040E1A] border-b-2 border-gray-400 top-0 h-20 w-full flex items-center justify-between px-2 gap-10 lg:px-10  z-[1060] ">
        <div className="flex items-center justify-center gap-7">
          {URL.pathname == "/app" && (
            <ManageHistoryOutlined
              sx={{
                fontSize: { xs: 30, lg: 35 },
                cursor: "pointer",
                transition: "transform 0.2s ease-in-out",
                "&:hover": { transform: "scale(1.1)" },
              }}
              onClick={handleSidebarToggle}
            />
          )}
          <img
            src="/assets/Logo.webp"
            alt="logo"
            className="h-16 w-16 rounded-full object-cover md:h-20 md:w-20"
          />
        </div>
        <div className="z-[1060] lg:hidden text-white">
          <MenuRounded
            sx={{
              fontSize: { xs: 30, lg: 40 },
              cursor: "pointer",
              transition: "transform 0.2s ease-in-out",
              "&:hover": { transform: "scale(1.1)" },
            }}
            onClick={handleToggle}
          />
        </div>
        <NavbarLinks state={open} />

        {User ? (
          <Button
            text={"Logout"}
            Click={handleLogoutClick}
            Class={"hidden lg:flex !text-white"}
          />
        ) : (
          <NavLink to={"/login"} className="hidden lg:flex">
            <Button text={"Get Started"} Class="!text-white" />
          </NavLink>
        )}
      </nav>
    </>
  );
};

export default Navbar;
