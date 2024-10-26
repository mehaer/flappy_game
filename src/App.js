import React, { useEffect, useRef, useState } from 'react';
import './App.css';

function App() {
    const characterRef = useRef(null);
    const holeRef = useRef(null);
    const blockRef = useRef(null);
    const [jumping, setJumping] = useState(0);
    const [counter, setCounter] = useState(0);
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");

    const questions = [
      { question: "What is 2 + 2?", answer: "4" },
      { question: "Capital of France?", answer: "Paris" },
      { question: "What is 5 * 3?", answer: "15" },
      { question: "Opposite of Hot?", answer: "Cold" },
      { question: "What is 10 / 2?", answer: "5" },
  ];

    useEffect(() => {
        const hole = holeRef.current;
        const character = characterRef.current;
        const block = blockRef.current;

        const handleHoleAnimation = () => {
            const randomIndex = Math.floor(Math.random() * questions.length);
            const { question, answer } = questions[randomIndex];

            setQuestion(question); // Display question on the screen
            setAnswer(answer);

            const random = Math.random() * (window.innerHeight / 2 - 200) + (window.innerHeight / 2);
            hole.style.top = random + "px"; // Random height for the hole
            setCounter((prevCounter) => prevCounter + 1);
        };

        hole.addEventListener('animationiteration', handleHoleAnimation);
        
        const interval = setInterval(() => {
            const characterTop = parseInt(window.getComputedStyle(character).getPropertyValue("top"));
            if (jumping === 0) {
                character.style.top = (characterTop + 3) + "px"; // Gravity effect
            }

            const blockLeft = parseInt(window.getComputedStyle(block).getPropertyValue("left"));
            const holeTop = parseInt(window.getComputedStyle(hole).getPropertyValue("top"));
            const holeHeight = 150; // Height of the hole
            //const cTop = -(window.innerHeight - characterTop); // Adjust for full screen

            // Check for game over conditions
            const isInHole =
                blockLeft < 20 && blockLeft > -50 &&
                (characterTop > holeTop && characterTop < holeTop + holeHeight);

            const isCollidingWithBlock =
                characterTop > window.innerHeight - 20 || 
                (blockLeft < 20 && blockLeft > -50 && !isInHole);

            if (isCollidingWithBlock) {
                alert("Game over. Score: " + (counter - 1));
                character.style.top = "200px"; // Reset character position to the center
                setCounter(0);
            }
        }, 10);
        const handleKeyDown = (event) => {
          if (event.code === 'Space') {
              jump();
          }
      };

      window.addEventListener('keydown', handleKeyDown);
        return () => {
            hole.removeEventListener('animationiteration', handleHoleAnimation);
            clearInterval(interval);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [jumping, counter]);

    const jump = () => {
        if (jumping === 0) {
            setJumping(1);
            let jumpCount = 0;

            const jumpInterval = setInterval(() => {
                const character = characterRef.current;
                const characterTop = parseInt(window.getComputedStyle(character).getPropertyValue("top"));
                if (characterTop > 6 && jumpCount < 15) {
                    character.style.top = (characterTop - 5) + "px"; // Jump up
                }
                if (jumpCount > 20) {
                    clearInterval(jumpInterval);
                    setJumping(0); // Reset jumping
                }
                jumpCount++;
            }, 10);
        }
    };

    return (
        <div id="game" onClick={jump}>
            <div id="question">{question}</div>
            <div id="block" ref={blockRef}></div>
            <div id="hole" ref={holeRef}> 
              <div className="answer">{answer}</div>
            </div>
            <div id="character" ref={characterRef} style={{ top: "200px" }}></div>
        </div>
    );
}

export default App;
