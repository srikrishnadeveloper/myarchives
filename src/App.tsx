import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Toaster } from '@/components/ui/toaster'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Send, Database } from 'lucide-react'
import './App.css'

interface ArchiveFormData {
  number: number
  source: string
  location: string
  unit: string
  device_id: string
  battery_level?: number
  calibrated: boolean
  updated: boolean
}

const API_BASE_URL = 'http://localhost:3005'

function App() {
  const [isLoading, setIsLoading] = useState(false)
  const [createdArchives, setCreatedArchives] = useState<string[]>([])
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking')
  const { toast } = useToast()
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset
  } = useForm<ArchiveFormData>({
    defaultValues: {
      number: 99.8,
      source: 'temperature_sensor',
      location: 'server_room',
      unit: 'celsius',
      device_id: 'temp_001',
      battery_level: 85,
      calibrated: true,
      updated: true
    }
  })

  const calibratedValue = watch('calibrated')
  const updatedValue = watch('updated')

  // Check backend health on component mount
  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/health`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })
        
        if (response.ok) {
          setBackendStatus('online')
        } else {
          setBackendStatus('offline')
        }
      } catch (error) {
        console.error('Backend health check failed:', error)
        setBackendStatus('offline')
      }
    }

    checkBackendHealth()
  }, [])

  const submitArchiveData = async (data: ArchiveFormData) => {
    setIsLoading(true)
    
    try {
      const payload = {
        number: Number(data.number),
        metadata: {
          source: data.source,
          location: data.location,
          unit: data.unit,
          device_id: data.device_id,
          ...(data.battery_level && { battery_level: Number(data.battery_level) }),
          calibrated: data.calibrated,
          updated: data.updated
        }
      }

      console.log('Sending payload:', payload)

      const response = await fetch(`${API_BASE_URL}/api/archives`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(30000), // 30 second timeout
      })

      const responseData = await response.json()

      if (!response.ok) {
        // Handle different error types
        let errorMessage = 'Failed to submit data'
        
        if (response.status === 400) {
          errorMessage = `Validation Error: ${responseData.message || 'Invalid data provided'}`
          if (responseData.errors) {
            errorMessage += `\nDetails: ${JSON.stringify(responseData.errors, null, 2)}`
          }
        } else if (response.status === 404) {
          errorMessage = `Endpoint not found: Please check if the server is running on ${API_BASE_URL}`
        } else if (response.status === 500) {
          errorMessage = `Server Error: ${responseData.message || 'Internal server error'}`
        } else if (response.status >= 400) {
          errorMessage = `HTTP ${response.status}: ${responseData.message || response.statusText}`
        }

        throw new Error(errorMessage)
      }

      // Success notification - expecting 201 status code for created archives
      const archiveId = responseData.data?.id || 'Unknown ID'
      
      // Add to created archives list
      setCreatedArchives(prev => [archiveId, ...prev.slice(0, 4)]) // Keep last 5
      
      toast({
        title: "✅ Archive Created Successfully!",
        description: `New archive created with ID: ${archiveId}`,
        duration: 7000,
      })

      console.log('Success response:', responseData)

    } catch (error) {
      console.error('Error submitting archive data:', error)
      
      let errorMessage = 'Unknown error occurred'
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = `Network Error: Cannot connect to ${API_BASE_URL}. Please ensure the backend server is running.`
      } else if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Request timeout: The server took too long to respond. Please try again.'
        } else if (error.message.includes('CORS')) {
          errorMessage = 'CORS Error: Backend server needs to allow requests from this origin.'
        } else {
          errorMessage = error.message
        }
      }

      toast({
        title: "❌ Error",
        description: errorMessage,
        variant: "destructive",
        duration: 10000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-2">
            <Database className="h-8 w-8 text-indigo-600" />
            Archive Data Submission
          </CardTitle>
          <CardDescription className="text-lg">
            Create new archive entries with detailed metadata
          </CardDescription>
          
          {/* Backend Status Indicator */}
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className={`w-2 h-2 rounded-full ${
              backendStatus === 'online' ? 'bg-green-500' : 
              backendStatus === 'offline' ? 'bg-red-500' : 
              'bg-yellow-500'
            }`}></div>
            <span className={`text-sm font-medium ${
              backendStatus === 'online' ? 'text-green-600' : 
              backendStatus === 'offline' ? 'text-red-600' : 
              'text-yellow-600'
            }`}>
              Backend {backendStatus === 'checking' ? 'Checking...' : backendStatus === 'online' ? 'Online' : 'Offline'}
            </span>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit(submitArchiveData)} className="space-y-6">
            {/* Number Input */}
            <div className="space-y-2">
              <Label htmlFor="number" className="text-base font-semibold">
                Number Value *
              </Label>
              <Input
                id="number"
                type="number"
                step="0.1"
                placeholder="99.8"
                {...register('number', {
                  required: 'Number is required',
                  min: { value: 0, message: 'Number must be positive' },
                  valueAsNumber: true
                })}
                className={errors.number ? 'border-red-500' : ''}
              />
              {errors.number && (
                <p className="text-sm text-red-600">{errors.number.message}</p>
              )}
            </div>

            <Separator />

            {/* Metadata Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Metadata</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="source" className="text-sm font-medium">
                    Source *
                  </Label>
                  <Input
                    id="source"
                    placeholder="temperature_sensor"
                    {...register('source', { required: 'Source is required' })}
                    className={errors.source ? 'border-red-500' : ''}
                  />
                  {errors.source && (
                    <p className="text-sm text-red-600">{errors.source.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="text-sm font-medium">
                    Location *
                  </Label>
                  <Input
                    id="location"
                    placeholder="server_room"
                    {...register('location', { required: 'Location is required' })}
                    className={errors.location ? 'border-red-500' : ''}
                  />
                  {errors.location && (
                    <p className="text-sm text-red-600">{errors.location.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit" className="text-sm font-medium">
                    Unit *
                  </Label>
                  <Input
                    id="unit"
                    placeholder="celsius"
                    {...register('unit', { required: 'Unit is required' })}
                    className={errors.unit ? 'border-red-500' : ''}
                  />
                  {errors.unit && (
                    <p className="text-sm text-red-600">{errors.unit.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="device_id" className="text-sm font-medium">
                    Device ID *
                  </Label>
                  <Input
                    id="device_id"
                    placeholder="temp_001"
                    {...register('device_id', { required: 'Device ID is required' })}
                    className={errors.device_id ? 'border-red-500' : ''}
                  />
                  {errors.device_id && (
                    <p className="text-sm text-red-600">{errors.device_id.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="battery_level" className="text-sm font-medium">
                    Battery Level (%)
                  </Label>
                  <Input
                    id="battery_level"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="85"
                    {...register('battery_level', {
                      min: { value: 0, message: 'Battery level must be 0 or higher' },
                      max: { value: 100, message: 'Battery level must be 100 or lower' },
                      valueAsNumber: true
                    })}
                    className={errors.battery_level ? 'border-red-500' : ''}
                  />
                  {errors.battery_level && (
                    <p className="text-sm text-red-600">{errors.battery_level.message}</p>
                  )}
                </div>
              </div>

              {/* Checkboxes */}
              <div className="flex flex-col sm:flex-row gap-6 pt-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="calibrated"
                    checked={calibratedValue}
                    onCheckedChange={(checked) => setValue('calibrated', !!checked)}
                  />
                  <Label htmlFor="calibrated" className="text-sm font-medium cursor-pointer">
                    Calibrated
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="updated"
                    checked={updatedValue}
                    onCheckedChange={(checked) => setValue('updated', !!checked)}
                  />
                  <Label htmlFor="updated" className="text-sm font-medium cursor-pointer">
                    Updated
                  </Label>
                </div>
              </div>
            </div>

            <Separator />

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="submit"
                disabled={isLoading || backendStatus === 'offline'}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : backendStatus === 'offline' ? (
                  'Backend Offline'
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit to Archive
                  </>
                )}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => reset()}
                disabled={isLoading}
                className="sm:w-auto"
                size="lg"
              >
                Reset Form
              </Button>
            </div>
          </form>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 text-center">
              <strong>Endpoint:</strong> <code>POST {API_BASE_URL}/api/archives</code>
            </p>
          </div>

          {/* Recently Created Archives */}
          {createdArchives.length > 0 && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="text-sm font-semibold text-green-800 mb-2">Recently Created Archives:</h4>
              <div className="space-y-1">
                {createdArchives.map((id, index) => (
                  <div key={id} className="text-xs text-green-700 font-mono bg-green-100 px-2 py-1 rounded">
                    {index + 1}. {id}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Toaster />
    </div>
  )
}

export default App
