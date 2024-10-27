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

    // Array of question-answer pairs
    const questions = [
        { question: "What is 2 + 2?", answer: "4" },
        { question: "Capital of France?", answer: "Paris" },
        { question: "What is 5 * 3?", answer: "15" },
        { question: "Opposite of Hot?", answer: "Cold" },
        { question: "What is 10 / 2?", answer: "5" },
    ];

    useEffect(() => {
        const character = characterRef.current;
        const block = blockRef.current;

        const handleBlockAnimation = () => {
            const randomIndex = Math.floor(Math.random() * questions.length);
            const { question, answer } = questions[randomIndex];
            setQuestion(question);

            // Choose an incorrect answer for the grey gap
            let incorrectAnswer;
            do {
                incorrectAnswer = questions[Math.floor(Math.random() * questions.length)].answer;
            } while (incorrectAnswer === answer);

            const minGap = 50;      // Minimum distance between passable and non-passable gap
             // Height of the passable gap
            const windowHeight = window.innerHeight - 300;
            
            // Determine position of passable (white) gap
            const firstGapTop = Math.floor(Math.random() * (windowHeight - gapSpacing - minGap));
            // Ensure the second (non-passable) gap is spaced below the passable gap by minGap
            const secondGapTop = firstGapTop + gapSpacing + minGap;

            const newGaps = [
                { top: firstGapTop, answer: answer, passable: true },
                { top: secondGapTop, answer: incorrectAnswer, passable: false }
            ];
            setGaps(newGaps);
            setCounter((prevCounter) => prevCounter + 1);
        };

        block.addEventListener('animationiteration', handleBlockAnimation);

        const interval = setInterval(() => {
            const characterTop = parseInt(window.getComputedStyle(character).getPropertyValue("top"));
            if (jumping === 0) {
                character.style.top = (characterTop + 3) + "px";
            }

            const blockLeft = parseInt(window.getComputedStyle(block).getPropertyValue("left"));
            const characterHeight = 20;

            // Check collision with gaps
            if (blockLeft < 60 && blockLeft > -50) {
                const isColliding = gaps.every(gap => {
                    const holeTop = gap.top;
                    const holeHeight = gapSpacing;
                    const isInGap = characterTop > holeTop && characterTop < holeTop + holeHeight;
                    return !(gap.passable && isInGap);
                });

                if (isColliding) {
                    alert("Game over. Score: " + (counter - 1));
                    character.style.top = "200px";
                    setCounter(0);
                }
            }
        }, 10);

        const handleKeyDown = (event) => {
            if (event.code === 'Space') {
                jump();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            block.removeEventListener('animationiteration', handleBlockAnimation);
            clearInterval(interval);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [jumping, counter, gaps]);

    const jump = () => {
        if (jumping === 0) {
            setJumping(1);
            let jumpCount = 0;

            const jumpInterval = setInterval(() => {
                const character = characterRef.current;
                const characterTop = parseInt(window.getComputedStyle(character).getPropertyValue("top"));
                if (characterTop > 6 && jumpCount < 15) {
                    character.style.top = (characterTop - 5) + "px";
                }
                if (jumpCount > 20) {
                    clearInterval(jumpInterval);
                    setJumping(0);
                }
                jumpCount++;
            }, 10);
        }
    };

    return (
        <div id="game">
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
        </div>
    );
}

export default App;
