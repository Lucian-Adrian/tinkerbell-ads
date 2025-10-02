import Link from 'next/link'
import { ArrowRight, Sparkles, Zap, TrendingUp } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold">Tinkerbell</span>
          </div>
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            AI-Powered Marketing
            <br />
            <span className="text-blue-600">That Actually Works</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8">
            Generate hundreds of marketing campaigns, predict winners with ViralCheck, 
            and create production-ready assets—all in a single day.
          </p>

          <div className="flex justify-center gap-4 mb-16">
            <Link
              href="/dashboard"
              className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 text-lg font-semibold"
            >
              Start Free Trial
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mt-20">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Sparkles className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">AI Personas</h3>
              <p className="text-gray-600">
                Generate detailed buyer personas tailored to your business in seconds
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Zap className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Mass Generation</h3>
              <p className="text-gray-600">
                Create 20 unique ad scripts using guerrilla marketing techniques
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">ViralCheck</h3>
              <p className="text-gray-600">
                Score and rank ideas based on trend data and AI prediction
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-3 gap-8">
            <div>
              <div className="text-4xl font-bold text-blue-600">20+</div>
              <div className="text-gray-600">Scripts Generated</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600">3x</div>
              <div className="text-gray-600">Faster Than Manual</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600">95%</div>
              <div className="text-gray-600">Accuracy Rate</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-gray-600">
          <p>&copy; 2025 Tinkerbell. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
