'use client';

import { useState, FormEvent } from 'react';

interface Exercise {
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  hint?: string;
}

interface GeneratorProps {
  initialDifficulty?: 'easy' | 'medium' | 'hard';
  initialTopic?: string;
  initialCount?: number;
}

export default function MathExerciseGenerator({
  initialDifficulty = 'medium',
  initialTopic = 'algebra',
  initialCount = 3,
}: GeneratorProps) {
  const [difficulty, setDifficulty] = useState(initialDifficulty);
  const [topic, setTopic] = useState(initialTopic);
  const [count, setCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showAnswers, setShowAnswers] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    setError(null);
    setShowAnswers(false);
    
    try {
      // Call the API endpoint
      const response = await fetch('/api/ai/exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, difficulty, count }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate exercises');
      }
      
      const data = await response.json();
      setExercises(data.exercises);
    } catch (err) {
      setError((err as Error).message || 'Failed to generate exercises');
      console.error('Error generating exercises:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">Math Exercise Generator</h2>
      
      <form onSubmit={handleSubmit} className="bg-base-200 p-4 rounded-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">
              <span className="label-text">Math Topic</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., algebra, calculus, geometry"
              disabled={isLoading}
            />
          </div>
          
          <div>
            <label className="label">
              <span className="label-text">Difficulty</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
              disabled={isLoading}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          
          <div>
            <label className="label">
              <span className="label-text">Number of Exercises</span>
            </label>
            <input
              type="number"
              className="input input-bordered w-full"
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              min={1}
              max={10}
              disabled={isLoading}
            />
          </div>
        </div>
        
        <button
          type="submit"
          className="btn btn-primary mt-4"
          disabled={isLoading || !topic}
        >
          {isLoading ? (
            <span className="loading loading-spinner loading-sm"></span>
          ) : (
            'Generate Exercises'
          )}
        </button>
      </form>
      
      {error && (
        <div className="alert alert-error mb-4">
          <span>{error}</span>
        </div>
      )}
      
      {exercises.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Generated Exercises</h3>
            <label className="label cursor-pointer">
              <span className="label-text mr-2">Show Answers</span> 
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={showAnswers}
                onChange={() => setShowAnswers(!showAnswers)}
              />
            </label>
          </div>
          
          <div className="space-y-4">
            {exercises.map((exercise, index) => (
              <div key={index} className="card bg-base-100 shadow-sm">
                <div className="card-body">
                  <div className="flex justify-between">
                    <h4 className="card-title">Exercise {index + 1}</h4>
                    <span className={`badge ${
                      exercise.difficulty === 'easy' 
                        ? 'badge-success' 
                        : exercise.difficulty === 'medium' 
                          ? 'badge-warning' 
                          : 'badge-error'
                    }`}>
                      {exercise.difficulty}
                    </span>
                  </div>
                  <p className="text-lg">{exercise.question}</p>
                  
                  {exercise.hint && (
                    <div className="mt-2 text-info cursor-pointer" onClick={() => alert(exercise.hint)}>
                      <small>Click for hint</small>
                    </div>
                  )}
                  
                  {showAnswers && (
                    <div className="mt-4 p-3 bg-base-200 rounded">
                      <strong>Answer:</strong> {exercise.answer}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}