import React, { useEffect, useRef } from 'react';
import './FireDots.css';

const FireDots = ({ particleNum = 50, particleBaseSize = 12 }) => {
  const containerRef = useRef(null);
  const createdStylesRef = useRef([]); // Keep track of created style elements

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    for (let i = 1; i <= particleNum; i++) {
      const circle = document.createElement('div');
      circle.className = 'circle';
      if (!circle || !circle.style) continue; // Use continue instead of return to keep the loop going
      container.appendChild(circle);

      const circleSize = Math.floor(Math.random() * particleBaseSize) + 1;
      circle.style.width = `${circleSize}px`;
      circle.style.height = `${circleSize}px`;

      const startPositionY = Math.floor(Math.random() * 10) + 100;
      const framesName = `move-frames-${i}`;
      const moveDuration = 28000 + Math.floor(Math.random() * 9000);

      circle.style.animationName = framesName;
      circle.style.animationDuration = `${moveDuration}ms`;
      circle.style.animationDelay = `${Math.floor(Math.random() * 37000)}ms`;

      // Create keyframes dynamically
      const styleSheet = document.createElement('style');
      document.head.appendChild(styleSheet);
      createdStylesRef.current.push(styleSheet); // Track this style element

      const keyFrames = `@keyframes ${framesName} {
                from {
                    transform: translate3d(${Math.floor(
                      Math.random() * 100
                    )}vw, ${startPositionY}vh, 0);
                }
                to {
                    transform: translate3d(${Math.floor(Math.random() * 100)}vw, ${
        -startPositionY - Math.floor(Math.random() * 30)
      }vh, 0);
                }
            }`;
      styleSheet.sheet.insertRule(keyFrames, styleSheet.sheet.cssRules.length);
    }

    return () => {
      // FIXED: Only remove the style elements that this component created
      createdStylesRef.current.forEach(styleSheet => {
        if (styleSheet && styleSheet.parentNode) {
          styleSheet.parentNode.removeChild(styleSheet);
        }
      });
      createdStylesRef.current = [];
    };
  }, []);

  return <div ref={containerRef} className="circle-container"></div>;
};

export default FireDots;
