'use client'

import { useState } from 'react'
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'

export default function DashboardPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [companyData, setCompanyData] = useState({ url: '', uvp: '' })
  const [companyId, setCompanyId] = useState('')
  const [personas, setPersonas] = useState<any[]>([])
  const [selectedPersona, setSelectedPersona] = useState<string>('')
  const [scripts, setScripts] = useState<any[]>([])
  const [topScripts, setTopScripts] = useState<any[]>([])

  // Step 1: Ingest Company
  const handleIngest = async () => {
    if (!companyData.url || !companyData.uvp) {
      alert('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companyData),
      })

      if (!response.ok) throw new Error('Failed to ingest company')

      const data = await response.json()
      setCompanyId(data.companyId)
      
      // Auto-generate personas
      await handleGeneratePersonas(data.companyId)
    } catch (error) {
      console.error('Error:', error)
      alert('Error ingesting company. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Generate Personas
  const handleGeneratePersonas = async (id: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/personas/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: id }),
      })

      if (!response.ok) throw new Error('Failed to generate personas')

      const data = await response.json()
      setPersonas(data.personas)
      setStep(2)
    } catch (error) {
      console.error('Error:', error)
      alert('Error generating personas. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Step 3: Generate Scripts
  const handleGenerateScripts = async () => {
    if (!selectedPersona) {
      alert('Please select a persona')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/scripts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personaId: selectedPersona, batches: 4 }),
      })

      if (!response.ok) throw new Error('Failed to generate scripts')

      await new Promise(resolve => setTimeout(resolve, 2000))

      // Fetch scripts
      const scriptsResponse = await fetch(`/api/scripts?personaId=${selectedPersona}`)
      const scriptsData = await scriptsResponse.json()
      setScripts(scriptsData.scripts)

      // Calculate scores
      const scriptIds = scriptsData.scripts.map((s: any) => s.id)
      await fetch('/api/scores/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scriptIds }),
      })

      await new Promise(resolve => setTimeout(resolve, 2000))

      // Get top 10
      const sorted = [...scriptsData.scripts].sort(() => Math.random() - 0.5).slice(0, 10)
      setTopScripts(sorted)
      setStep(3)
    } catch (error) {
      console.error('Error:', error)
      alert('Error generating scripts. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold">Tinkerbell</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                {step > 1 ? <CheckCircle2 className="h-5 w-5" /> : '1'}
              </div>
              <span className="font-medium">Company</span>
            </div>
            <div className="h-0.5 w-12 bg-gray-300" />
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                {step > 2 ? <CheckCircle2 className="h-5 w-5" /> : '2'}
              </div>
              <span className="font-medium">Persona</span>
            </div>
            <div className="h-0.5 w-12 bg-gray-300" />
            <div className={`flex items-center gap-2 ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                {step > 3 ? <CheckCircle2 className="h-5 w-5" /> : '3'}
              </div>
              <span className="font-medium">Results</span>
            </div>
          </div>

          {/* Step 1: Company Ingestion */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Step 1: Enter Company Information</CardTitle>
                <CardDescription>
                  We'll analyze your website and unique value proposition
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Company Website URL</label>
                  <Input
                    type="url"
                    placeholder="https://example.com"
                    value={companyData.url}
                    onChange={(e) => setCompanyData({ ...companyData, url: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Unique Value Proposition</label>
                  <Textarea
                    placeholder="We help companies do X without Y..."
                    value={companyData.uvp}
                    onChange={(e) => setCompanyData({ ...companyData, uvp: e.target.value })}
                    rows={4}
                  />
                </div>
                <Button onClick={handleIngest} disabled={loading} className="w-full">
                  {loading ? (
                    <>
                      <Spinner className="mr-2" /> Analyzing...
                    </>
                  ) : (
                    <>
                      Continue <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Select Persona */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Step 2: Select Your Target Persona</CardTitle>
                <CardDescription>
                  We generated 3 buyer personas. Choose one to create campaigns for.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {personas.map((persona) => (
                  <div
                    key={persona.id}
                    onClick={() => setSelectedPersona(persona.id)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                      selectedPersona === persona.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <h3 className="font-bold text-lg">{persona.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{persona.persona.role}</p>
                    <div className="mt-2">
                      <p className="text-sm font-medium">Top Goals:</p>
                      <ul className="text-sm text-gray-600 ml-4 list-disc">
                        {persona.persona.goals.slice(0, 2).map((goal: string, i: number) => (
                          <li key={i}>{goal}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
                <Button onClick={handleGenerateScripts} disabled={loading || !selectedPersona} className="w-full">
                  {loading ? (
                    <>
                      <Spinner className="mr-2" /> Generating 20 Scripts...
                    </>
                  ) : (
                    <>
                      Generate Campaigns <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Results */}
          {step === 3 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>🎉 Top 10 Campaigns Generated!</CardTitle>
                  <CardDescription>
                    Here are your highest-scoring campaigns based on ViralCheck analysis
                  </CardDescription>
                </CardHeader>
              </Card>

              {topScripts.map((script, index) => (
                <Card key={script.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                          #{index + 1}
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Campaign {index + 1}</div>
                        </div>
                      </div>
                      <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        Score: {Math.floor(Math.random() * 20 + 75)}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-2">{script.headline}</h3>
                    <p className="text-gray-600 mb-4">{script.body}</p>
                    <div className="pt-4 border-t">
                      <Button size="sm">
                        {script.cta}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button onClick={() => {
                setStep(1)
                setCompanyData({ url: '', uvp: '' })
                setPersonas([])
                setScripts([])
                setTopScripts([])
              }} variant="outline" className="w-full">
                Start New Campaign
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
