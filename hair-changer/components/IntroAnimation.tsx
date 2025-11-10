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
        className="text-xl md:text-2xl font-sans text-center text-black dark:text-white intro-text-animate px-4"
      >
        {t(introMessages[currentIndex])}
      </p>
    </div>
  );
};

export default IntroAnimation;
