import { Link } from "react-router-dom";
import logo from "../../../public/logo.png";

const AnimatedLogo = () => {
  return (
    <Link to="/" className="flex items-center">
      <img
        className="h-16 w-auto object-contain cursor-pointer p-1  rounded-xl backdrop-blur-sm"
        src={logo}
        alt="Site Logo"
      />
    </Link>
  );
};

export default AnimatedLogo;
