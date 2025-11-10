import React, { useState, useEffect } from "react";
import { useTranslation } from "../hooks/useTranslation";

const introMessages = [
  "vto_intro_step1",
  "vto_intro_step2",
  "vto_intro_step3",
  "vto_intro_pricing",
];

const IntroAnimation: React.FC = () => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % introMessages.length);
    }, 5000); // Change text every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center h-full">
      <p
        key={currentIndex}
        className="px-4 font-sans text-xl text-center text-black md:text-2xl dark:text-white intro-text-animate"
      >
        {t(introMessages[currentIndex])}
      </p>
    </div>
  );
};

export default IntroAnimation;