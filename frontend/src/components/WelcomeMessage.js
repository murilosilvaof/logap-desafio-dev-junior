import React, { useState, useEffect } from 'react';

function WelcomeMessage() {
  const fullText = "Bem-vindo ao sistema LogAp!";
  const [displayText, setDisplayText] = useState('');
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting] = useState(false); 
  const [typingSpeed] = useState(100); // Velocidade da digitação 

  useEffect(() => {
    let timer;

    if (!isDeleting) { // Digitando
      if (charIndex < fullText.length) {
        timer = setTimeout(() => {
          setDisplayText((prev) => prev + fullText[charIndex]);
          setCharIndex((prev) => prev + 1);
        }, typingSpeed);
      } else {
        // Texto totalmente digitado
        clearTimeout(timer);
      }
    }

    return () => clearTimeout(timer); // Limpa o timer quando o componente desmonta 

  }, [charIndex, isDeleting, fullText, typingSpeed]);

  return (
    <h2 className="welcome-text">
      {displayText}
      <span className="typing-cursor">|</span> {/* Cursor piscante */}
    </h2>
  );
}

export default WelcomeMessage;