import React, { useEffect, useRef, useState } from 'react';
import './App.css';

function App() {
    const characterRef = useRef(null);
    const blockRef = useRef(null);
    const [jumping, setJumping] = useState(0);
    const [counter, setCounter] = useState(0);
    const [question, setQuestion] = useState("");
    const [gaps, setGaps] = useState([]);
    const gapSpacing = 150;
    const [gameOver, setGameOver] = useState(false); // Track game over state
    const [intervalId, setIntervalId] = useState(null); // Store interval ID
    const [key, setKey] = useState(0); // Track the component key for reset

    // Array of question-answer pairs
    const questions = [
        { question: "What is 2 + 2?", answer: "4" },
        { question: "Capital of France?", answer: "Paris" },
        { question: "What is 5 * 3?", answer: "15" },
        { question: "Opposite of Hot?", answer: "Cold" },
        { question: "What is 10 / 2?", answer: "5" },
    ];

    // Function to initialize gaps
    const initializeGaps = () => {
        const randomIndex = Math.floor(Math.random() * questions.length);
        const { question, answer } = questions[randomIndex];
        setQuestion(question);

        // Choose an incorrect answer for the grey gap
        let incorrectAnswer;
        do {
            incorrectAnswer = questions[Math.floor(Math.random() * questions.length)].answer;
        } while (incorrectAnswer === answer);

        const minGap = 50; // Minimum distance between passable and non-passable gap
        const windowHeight = window.innerHeight - 300; // Adjusting height
        const firstGapTop = Math.floor(Math.random() * (windowHeight - gapSpacing - minGap));
        const secondGapTop = firstGapTop + gapSpacing + minGap;

        const newGaps = [
            { top: firstGapTop, answer: answer, passable: true },
            { top: secondGapTop, answer: incorrectAnswer, passable: false }
        ];
        setGaps(newGaps);
        setCounter((prevCounter) => prevCounter + 1); // Increase counter
    };

    useEffect(() => {
        const character = characterRef.current;
        const block = blockRef.current;

        const handleBlockAnimation = () => {
            // Reset gaps and increase counter
            initializeGaps();
        };

        block.addEventListener('animationiteration', handleBlockAnimation);

        const newIntervalId = setInterval(() => {
            if (gameOver) return; // Stop the interval if the game is over

            const characterTop = parseInt(window.getComputedStyle(character).getPropertyValue("top"));
            if (jumping === 0) {
                character.style.top = (characterTop + 3) + "px"; // Gravity effect
            }

            const blockLeft = parseInt(window.getComputedStyle(block).getPropertyValue("left"));

            // Check collision with gaps
            if (blockLeft < 60 && blockLeft > -50) {
                const isColliding = gaps.every(gap => {
                    const holeTop = gap.top;
                    const holeHeight = gapSpacing;
                    const isInGap = characterTop > holeTop && characterTop < holeTop + holeHeight;
                    return !(gap.passable && isInGap);
                });

                if (isColliding) {
                    setGameOver(true); // Set game over state
                    character.style.top = "200px"; // Reset character position
                    clearInterval(newIntervalId); // Stop the interval when the game is over
                }
            }
        }, 10);

        setIntervalId(newIntervalId); // Store the interval ID

        const handleKeyDown = (event) => {
            if (event.code === 'Space' && !gameOver) { // Allow jump only if not game over
                jump();
            }
            if (event.code === 'KeyR' && gameOver) { // Restart the game if 'R' is pressed
                restartGame();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            block.removeEventListener('animationiteration', handleBlockAnimation);
            clearInterval(newIntervalId); // Clear the interval on component unmount
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [jumping, gaps, gameOver]); // Remove counter from dependencies

    const jump = () => {
        if (jumping === 0) {
            setJumping(1); // Set jumping state to 1
            let jumpCount = 0;

            const jumpInterval = setInterval(() => {
                const character = characterRef.current;
                const characterTop = parseInt(window.getComputedStyle(character).getPropertyValue("top"));
                
                // Ascend
                if (jumpCount < 15) {
                    character.style.top = (characterTop - 5) + "px"; // Move up
                }
                
                // Descend
                if (jumpCount >= 15 && jumpCount < 30) {
                    character.style.top = (characterTop + 5) + "px"; // Move down
                }

                jumpCount++;
                if (jumpCount >= 30) {
                    clearInterval(jumpInterval);
                    setJumping(0); // Reset jumping state
                }
            }, 20); // Adjust interval timing for smoother jump
        }
    };

    const restartGame = () => {
        setCounter(0);
        setGaps([]);
        setGameOver(false);
        setQuestion("");
        setJumping(0);
        
        // Clear the previous interval before creating a new one
        clearInterval(intervalId); 

        // Increment the key to force re-render
        setKey(prevKey => prevKey + 1);

        // Re-initialize gaps for a fresh start
        initializeGaps();
    };

    return (
        <div key={key} id="game">
            <div id="question">{question}</div>
            <div id="block" ref={blockRef}>
                {gaps.map((gap, index) => (
                    <div
                        key={index}
                        className={`hole ${gap.passable ? "passable" : "non-passable"}`}
                        style={{ top: `${gap.top}px` }}
                    >
                        <div className="answer">{gap.answer}</div>
                    </div>
                ))}
            </div>
            <div id="character" ref={characterRef} style={{ top: "200px" }}></div>
            {gameOver && (
                <div className="broken-screen">
                    <h1>Game Over!</h1>
                    <p>Press R to Restart</p>
                </div>
            )}
        </div>
    );
}

export default App;
