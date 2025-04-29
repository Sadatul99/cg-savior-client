import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import logo from "../../../public/logo.png";

const AnimatedLogo = () => {
  const logoRef = useRef(null);

  const handleWobble = () => {
    gsap.fromTo(
      logoRef.current,
      { scale: 1 },
      {
        scaleX: 1.2,
        scaleY: 0.8,
        rotate: 5,
        duration: 0.2,
        ease: "power2.out",
        onComplete: () => {
          gsap.to(logoRef.current, {
            scaleX: 1,
            scaleY: 1,
            rotate: 0,
            duration: 0.3,
            ease: "elastic.out(1, 0.4)"
          });
        }
      }
    );
  };

  useEffect(() => {
    gsap.fromTo(
      logoRef.current,
      { opacity: 0, y: -50, scale: 0.8 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 1,
        ease: "power4.out"
      }
    );
  }, []);

  return (
    <Link to="/" className="flex items-center">
      <img
        ref={logoRef}
        src={logo}
        alt="Site Logo"
        className="h-14 w-auto object-contain cursor-pointer"
        onMouseEnter={handleWobble}
        onTouchStart={handleWobble}
      />
    </Link>
  );
};

export default AnimatedLogo;
