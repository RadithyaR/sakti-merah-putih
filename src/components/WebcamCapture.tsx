'use client'

import { useState, useRef, useEffect } from 'react'
import { Camera, RotateCcw, Check } from 'lucide-react'

interface WebcamCaptureProps {
  onCapture: (imageData: string) => void
}

export default function WebcamCapture({ onCapture }: WebcamCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    startCamera()
    return () => {
      stopCamera()
    }
  }, [])

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (err) {
      setError('Tidak dapat mengakses webcam. Pastikan webcam terhubung dan izin diberikan.')
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
  }

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    context?.drawImage(video, 0, 0, canvas.width, canvas.height)

    const imageData = canvas.toDataURL('image/jpeg', 0.9)
    setCapturedImage(imageData)
    onCapture(imageData)
  }

  const handleRetake = () => {
    setCapturedImage(null)
    startCamera()
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-lg bg-red-100">
            <Camera className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-text-primary">Foto Anggota</h3>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-lg bg-primary/10">
          <Camera className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-text-primary">Foto Anggota</h3>
          <p className="text-sm text-text-secondary">
            {capturedImage ? 'Foto berhasil diambil' : 'Ambil foto anggota dari webcam'}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Video Preview or Captured Image */}
        <div className="relative bg-surface rounded-lg overflow-hidden aspect-video">
          {capturedImage ? (
            <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Controls */}
        <div className="flex gap-3">
          {!capturedImage ? (
            <button
              onClick={handleCapture}
              className="flex-1 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-semibold flex items-center justify-center gap-2"
            >
              <Camera className="w-5 h-5" />
              Ambil Foto
            </button>
          ) : (
            <>
              <button
                onClick={handleRetake}
                className="flex-1 py-3 border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors font-semibold flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                Ambil Ulang
              </button>
              <div className="flex-1 py-3 bg-green-100 text-green-700 rounded-lg font-semibold flex items-center justify-center gap-2">
                <Check className="w-5 h-5" />
                Foto Tersimpan
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
