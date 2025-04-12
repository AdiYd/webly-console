import Link from "next/link";
import Image from "next/image";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
  href: string;
}

function FeatureCard({ title, description, icon, href }: FeatureCardProps) {
  return (
    <div className="card bg-base-300/70 backdrop-blur-md shadow-md hover:shadow-lg transition-shadow border border-base-300">
      <div className="card-body p-6">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 mr-4 flex items-center justify-center rounded-full /10">
            <Image src={icon} alt={title} width={24} height={24} className="text-primary" />
          </div>
          <h3 className="card-title text-xl font-bold">{title}</h3>
        </div>
        <p>{description}</p>
        <div className="card-actions justify-end mt-4">
          <Link href={href} className="w-full md:w-auto">
            <button className="btn btn-sm btn-primary">Try Now</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen ">      
      {/* Hero Section */}
      <section className="hero py-20 ">
        <div className="hero-content text-center">
          <div className="max-w-md md:max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Your AI-Powered Learning Platform
            </h1>
            <p className="text-xl md:text-2xl mb-10 opacity-80">
              Unlock the power of AI to enhance your learning, create personalized
              exercises, and get instant answers to your questions.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/chat">
                <button className="btn btn-primary">Start Chatting</button>
              </Link>
              <Link href="/exercises">
                <button className="btn btn-accent btn-outline">
                  Generate Exercises
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            AI-Powered Features
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              title="AI Chat Assistant"
              description="Get instant answers to your questions with our advanced AI chat assistant. Powered by leading language models."
              icon="/globe.svg"
              href="/chat"
            />
            <FeatureCard
              title="Math Exercise Generator"
              description="Create customized math problems with varying difficulty levels tailored to your learning needs."
              icon="/file.svg"
              href="/exercises"
            />
            <FeatureCard
              title="Coming Soon: Writing Assistant"
              description="Get help with essays, reports, and creative writing with AI-powered suggestions and improvements."
              icon="/window.svg"
              href="#"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 ">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Join thousands of students and educators who are already using our
            AI-powered tools to enhance their learning experience.
          </p>
          <Link href="/chat">
            <button className="btn btn-accent btn-outline">
              Try Now for Free
            </button>
          </Link>
        </div>
      </section>
    </main>
  );
}
