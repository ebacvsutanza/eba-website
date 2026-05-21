import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Redirect() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let timeout;

    const logoutUser = () => {
      // remove auth token
      localStorage.removeItem("token");

      // redirect
      navigate("/news");
    };

    const resetTimer = () => {
      clearTimeout(timeout);

      timeout = setTimeout(() => {
        logoutUser();
      }, 60000); // 1 minute idle
    };

    // detect activity
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("click", resetTimer);
    window.addEventListener("scroll", resetTimer);

    resetTimer();

    return () => {
      clearTimeout(timeout);

      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("click", resetTimer);
      window.removeEventListener("scroll", resetTimer);
    };
  }, [navigate, location.pathname]);

  return null;
}
