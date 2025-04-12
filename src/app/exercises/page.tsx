import MathExerciseGenerator from "@/components/ai/MathExerciseGenerator";

export default function ExercisesPage() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">AI Math Exercise Generator</h1>
      <p className="mb-6 text-lg">
        Use AI to generate customized math exercises on any topic and at your
        preferred difficulty level. Perfect for practice, teaching, or exam preparation.
      </p>
      
      <div className="border rounded-lg shadow-sm p-4 bg-base-100">
        <MathExerciseGenerator />
      </div>
    </main>
  );
}