'use client';

import { useEffect, useState } from 'react';

const loginImages = [
  '/images/login/login.jpeg',
  '/images/login/login1.jpeg',
  '/images/login/login2.jpeg',
  '/images/login/login3.jpeg'
];

export default function LoginImage() {
  const [currentImage, setCurrentImage] = useState(loginImages[0]);

  useEffect(() => {
    // Set a random image on component mount
    const randomImage = loginImages[Math.floor(Math.random() * loginImages.length)];
    setCurrentImage(randomImage);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <img
        src={currentImage}
        alt="Login background"
        className="w-full h-full object-cover"
      />
    </div>
  );
}