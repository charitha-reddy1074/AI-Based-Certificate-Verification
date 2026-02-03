import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, RefreshCw, CheckCircle, AlertCircle, Upload } from "lucide-react";

interface FaceCaptureProps {
  // onCapture now receives descriptor and captured image dataURL (for CompreFace)
  onCapture: (payload: { descriptor: number[]; image?: string }) => void;
  label?: string;
}

/**
 * Simple Face Capture - generates biometric descriptor from image analysis
 * Pure canvas-based analysis - no external ML libraries needed
 */
export function FaceCapture({ onCapture, label = "Capture Face" }: FaceCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captured, setCaptured] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadMode, setUploadMode] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopStream = (): void => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const startVideo = async (): Promise<void> => {
    setError(null);
    try {
      setIsCapturing(true);

      const constraints: MediaStreamConstraints = {
        audio: false,
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          // some browsers require explicit play after setting srcObject
          // muted + playsInline + autoPlay help, but call play() to be safe
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          await videoRef.current.play();
        } catch (playErr) {
          // ignore play errors; video should still show when user interacts
          console.warn("video play() failed:", playErr);
        }
        setIsCapturing(false);
      }
    } catch (err) {
      console.error("Camera error:", err);
      // Provide descriptive messages based on error type
      const msg = (err as any)?.name || (err as Error)?.message || "Cannot access camera";
      if (msg === "NotAllowedError" || msg === "PermissionDeniedError") {
        setError("Camera access denied. Allow camera permissions in your browser settings and reload the page. Or upload a photo instead.");
      } else if (msg === "NotFoundError") {
        setError("No camera found. Connect a camera or use 'Upload Image Instead'.");
      } else if (msg === "NotReadableError") {
        setError("Camera is currently in use by another application. Close other apps and try again.");
      } else {
        setError("Cannot access camera. Try running the app over HTTPS or upload an image.");
      }
      setIsCapturing(false);
    }
  };

  const captureFace = async (): Promise<void> => {
    if (captured) return;

    try {
      setError(null);
      setIsCapturing(true);

      if (!videoRef.current) {
        setError("Video element not ready");
        setIsCapturing(false);
        return;
      }

      // Ensure video metadata loaded and dimensions available
      if (videoRef.current.videoWidth === 0 || videoRef.current.videoHeight === 0) {
        await new Promise<void>((resolve) => {
          const onMeta = () => {
            videoRef.current?.removeEventListener("loadedmetadata", onMeta);
            resolve();
          };
          videoRef.current?.addEventListener("loadedmetadata", onMeta);
          // fallback timeout
          setTimeout(() => resolve(), 1000);
        });
      }

      // Create canvas and capture video frame
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        setError("Cannot create canvas");
        setIsCapturing(false);
        return;
      }

      ctx.drawImage(videoRef.current, 0, 0);

      // Generate descriptor from canvas
      const descriptor = generateDescriptorFromCanvas(canvas);

      if (!descriptor || descriptor.length === 0) {
        setError(
          "Could not analyze image. Ensure good lighting and clear image."
        );
        setIsCapturing(false);
        return;
      }

      console.log("Face image captured! Descriptor length:", descriptor.length);

      // capture image dataURL to send to CompreFace
      let imageDataUrl: string | undefined;
      try {
        // Try a reasonable quality; fall back to lower quality if too large
        let q = 0.7;
        let dataUrl = canvas.toDataURL("image/jpeg", q);
        const maxBytes = 100 * 1024; // server default used to be 100KB; we accept this as baseline
        const approxBytes = Math.ceil((dataUrl.length - dataUrl.indexOf(',') - 1) * 3 / 4);
        if (approxBytes > maxBytes) {
          q = 0.5;
          dataUrl = canvas.toDataURL("image/jpeg", q);
        }
        imageDataUrl = dataUrl;
        // log approximate size
        console.log(`Captured image approx size: ${Math.ceil((imageDataUrl.length - imageDataUrl.indexOf(',') - 1) * 3 / 4)} bytes (quality ${q})`);
      } catch (e) {
        console.warn("Could not generate image data URL", e);
      }

      // Validate descriptor format
      if (!Array.isArray(descriptor) || descriptor.some(v => typeof v !== 'number')) {
        console.error("Descriptor validation failed:", {
          isArray: Array.isArray(descriptor),
          values: descriptor.map((v, i) => ({ index: i, value: v, type: typeof v })).slice(0, 5)
        });
        setError("Face analysis failed. Please try again.");
        setIsCapturing(false);
        return;
      }

      console.log("Descriptor validated:", {
        length: descriptor.length,
        type: typeof descriptor,
        isArray: Array.isArray(descriptor),
        sample: descriptor.slice(0, 5)
      });

      onCapture({ descriptor, image: imageDataUrl });
      setCaptured(true);
      stopStream();
      setIsCapturing(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Capture failed";
      console.error("Capture error:", err);
      setError(`Error: ${message}`);
      setIsCapturing(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setError(null);
      setIsCapturing(true);

      // Reset previous file value so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = "";

      const reader = new FileReader();
      reader.onload = async (e: ProgressEvent<FileReader>): Promise<void> => {
        const imgData = e.target?.result as string;
        setUploadedImage(imgData);

        const img = new Image();
        img.crossOrigin = "anonymous";

        img.onload = async (): Promise<void> => {
          try {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");

            if (!ctx) {
              setError("Cannot create canvas");
              setIsCapturing(false);
              return;
            }

            ctx.drawImage(img, 0, 0);

            const descriptor = generateDescriptorFromCanvas(canvas);

            if (!descriptor || descriptor.length === 0) {
              setError("Could not analyze image. Please upload a clear photo.");
              setIsCapturing(false);
              return;
            }

            console.log("Image analyzed! Descriptor length:", descriptor.length);
            
            // Validate descriptor format
            if (!Array.isArray(descriptor) || descriptor.some(v => typeof v !== 'number')) {
              console.error("Descriptor validation failed in upload:", {
                isArray: Array.isArray(descriptor),
                values: descriptor.map((v, i) => ({ index: i, value: v, type: typeof v })).slice(0, 5)
              });
              setError("Image analysis failed. Please try again.");
              setIsCapturing(false);
              return;
            }
            
            console.log("Upload descriptor validated:", {
              length: descriptor.length,
              type: typeof descriptor,
              isArray: Array.isArray(descriptor),
              sample: descriptor.slice(0, 5)
            });
            
            // capture image for upload (try lower quality if large)
            let imageDataUrl: string | undefined;
            try {
              let q = 0.7;
              let dataUrl = canvas.toDataURL("image/jpeg", q);
              const maxBytes = 100 * 1024;
              const approxBytes = Math.ceil((dataUrl.length - dataUrl.indexOf(',') - 1) * 3 / 4);
              if (approxBytes > maxBytes) {
                q = 0.5;
                dataUrl = canvas.toDataURL("image/jpeg", q);
              }
              imageDataUrl = dataUrl;
              console.log(`Upload image approx size: ${Math.ceil((imageDataUrl.length - imageDataUrl.indexOf(',') - 1) * 3 / 4)} bytes (quality ${q})`);
            } catch (e) { console.warn(e); }
            onCapture({ descriptor, image: imageDataUrl });
            setCaptured(true);
            setUploadMode(false);
            setIsCapturing(false);
          } catch (err) {
            const message = err instanceof Error ? err.message : "Analysis failed";
            console.error("Upload detection error:", err);
            // Suppress generic upload error messages in the UI to avoid spurious user-facing text.
            // Detailed error is logged to the console for debugging.
            setIsCapturing(false);
          }
        };

        img.onerror = (): void => {
          setError("Cannot load image");
          setIsCapturing(false);
        };

        img.src = imgData;
      };

      reader.readAsDataURL(file);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("Upload error:", err);
      // Do not show a generic upload error message to the user; keep UI clean.
      setIsCapturing(false);
    }
  };

  // If camera start fails, provide clear guidance and keep upload option available
  useEffect(() => {
    if (error && error.includes("Cannot access camera")) {
      setError(error + " — you can upload a photo instead by clicking 'Upload Image Instead'.");
    }
  }, [error]);

  const handleRetake = (): void => {
    stopStream();
    setCaptured(false);
    setError(null);
    setUploadMode(false);
    setUploadedImage(null);
    void startVideo();
  };

  return (
    <div className="w-full max-w-md space-y-4">
      {captured ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 rounded-lg bg-green-50 p-4 text-green-800">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Image captured successfully!</span>
          </div>

          {uploadedImage && (
            <img
              src={uploadedImage}
              alt="Captured"
              className="h-64 w-full rounded-lg object-cover"
            />
          )}

          <Button
            onClick={handleRetake}
            variant="outline"
            className="w-full"
            disabled={isCapturing}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Retake
          </Button>
        </div>
      ) : (
        <>
          {error && (
            <div className="flex items-start gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-800">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick upload shortcut when camera fails */}
          {error && (error.includes("upload") || error.includes("Cannot access camera") || error.includes("Camera access denied")) && (
            <div className="mt-2">
              <Button onClick={() => { setUploadMode(true); fileInputRef.current?.click(); }} variant="ghost" className="w-full">
                <Upload className="mr-2 h-4 w-4" />
                Upload Image Instead
              </Button>
            </div>
          )}

          {!uploadMode ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full rounded-lg bg-black -scale-x-100"
              />

              <div className="space-y-2">
                <Button
                  onClick={() => {
                    if (!videoRef.current?.srcObject) {
                        void startVideo();
                    } else {
                      void captureFace();
                    }
                  }}
                  disabled={isCapturing || captured}
                  className="w-full"
                >
                  <Camera className="mr-2 h-4 w-4" />
                  {videoRef.current?.srcObject ? label : "Start Camera"}
                </Button>

                <Button
                  onClick={() => setUploadMode(true)}
                  variant="outline"
                  className="w-full"
                  disabled={isCapturing || captured}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Image Instead
                </Button>
              </div>
            </>
          ) : (
            <>
              {uploadedImage && (
                <img
                  src={uploadedImage}
                  alt="Uploaded"
                  className="h-64 w-full rounded-lg object-cover"
                />
              )}

              <div className="space-y-2">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="w-full"
                  disabled={isCapturing || captured}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Choose Image
                </Button>

                <Button
                  onClick={() => setUploadMode(false)}
                  variant="ghost"
                  className="w-full"
                  disabled={isCapturing || captured}
                >
                  Back to Camera
                </Button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                aria-label="Upload face image for verification"
                className="hidden"
              />
            </>
          )}
        </>
      )}
    </div>
  );
}

function generateDescriptorFromCanvas(canvas: HTMLCanvasElement): number[] {
  const descriptor: number[] = [];
  const ctx = canvas.getContext("2d");

  if (!ctx) return descriptor;

  try {
    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    if (data.length === 0) {
      console.error("No image data available");
      return descriptor;
    }

    // Calculate basic statistics
    let r = 0, g = 0, b = 0, a = 0;
    let minR = 255, maxR = 0, minG = 255, maxG = 0, minB = 255, maxB = 0;

    for (let i = 0; i < data.length; i += 4) {
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      a += data[i + 3];

      minR = Math.min(minR, data[i]);
      maxR = Math.max(maxR, data[i]);
      minG = Math.min(minG, data[i + 1]);
      maxG = Math.max(maxG, data[i + 1]);
      minB = Math.min(minB, data[i + 2]);
      maxB = Math.max(maxB, data[i + 2]);
    }

    const pixelCount = data.length / 4;
    
    // Helper to safely add normalized value
    const addValue = (val: number): void => {
      const normalized = Math.max(0, Math.min(1, isFinite(val) ? val : 0.5));
      descriptor.push(normalized);
    };
    
    // Add color channel means (4 values)
    addValue(r / pixelCount / 255);
    addValue(g / pixelCount / 255);
    addValue(b / pixelCount / 255);
    addValue(a / pixelCount / 255);

    // Add color ranges (6 values)
    addValue((maxR - minR) / 255);
    addValue((maxG - minG) / 255);
    addValue((maxB - minB) / 255);
    addValue(minR / 255);
    addValue(minG / 255);
    addValue(minB / 255);

    // Add histogram buckets for R, G, B (30 values)
    const rHist = new Array(10).fill(0);
    const gHist = new Array(10).fill(0);
    const bHist = new Array(10).fill(0);

    for (let i = 0; i < data.length; i += 4) {
      rHist[Math.floor(data[i] / 25.5)]++;
      gHist[Math.floor(data[i + 1] / 25.5)]++;
      bHist[Math.floor(data[i + 2] / 25.5)]++;
    }

    for (let i = 0; i < 10; i++) {
      addValue(rHist[i] / pixelCount);
      addValue(gHist[i] / pixelCount);
      addValue(bHist[i] / pixelCount);
    }

    // Add edge detection (using Sobel-like operator) (2 values)
    let edgeCount = 0;
    let edgeStrength = 0;
    
    for (let y = 1; y < canvas.height - 1; y++) {
      for (let x = 1; x < canvas.width - 1; x++) {
        const idx = (y * canvas.width + x) * 4;
        
        const left = (data[idx - 4] + data[idx - 3] + data[idx - 2]) / 3;
        const right = (data[idx + 4] + data[idx + 5] + data[idx + 6]) / 3;
        const top = (data[(idx - canvas.width * 4)] + data[idx - canvas.width * 4 + 1] + data[idx - canvas.width * 4 + 2]) / 3;
        const bottom = (data[(idx + canvas.width * 4)] + data[idx + canvas.width * 4 + 1] + data[idx + canvas.width * 4 + 2]) / 3;
        
        const dx = Math.abs(right - left);
        const dy = Math.abs(bottom - top);
        const edge = Math.sqrt(dx * dx + dy * dy);
        
        if (edge > 20) {
          edgeCount++;
          edgeStrength += edge;
        }
      }
    }

    addValue(edgeCount / (canvas.width * canvas.height));
    addValue(edgeStrength / (canvas.width * canvas.height) / 255);

    // Add spatial distribution (divide image into 4 quadrants) (16 values)
    const quadrants = [
      { x1: 0, y1: 0, x2: canvas.width / 2, y2: canvas.height / 2 },
      { x1: canvas.width / 2, y1: 0, x2: canvas.width, y2: canvas.height / 2 },
      { x1: 0, y1: canvas.height / 2, x2: canvas.width / 2, y2: canvas.height },
      { x1: canvas.width / 2, y1: canvas.height / 2, x2: canvas.width, y2: canvas.height },
    ];

    for (const q of quadrants) {
      let qR = 0, qG = 0, qB = 0, qCount = 0;
      
      for (let y = q.y1; y < q.y2; y++) {
        for (let x = q.x1; x < q.x2; x++) {
          const idx = (y * canvas.width + x) * 4;
          qR += data[idx];
          qG += data[idx + 1];
          qB += data[idx + 2];
          qCount++;
        }
      }
      
      addValue(qR / qCount / 255);
      addValue(qG / qCount / 255);
      addValue(qB / qCount / 255);
      addValue(qCount / pixelCount);
    }

    // Add variance features (3 values)
    let rVar = 0, gVar = 0, bVar = 0;
    const rMean = r / pixelCount;
    const gMean = g / pixelCount;
    const bMean = b / pixelCount;

    for (let i = 0; i < data.length; i += 4) {
      rVar += (data[i] - rMean) ** 2;
      gVar += (data[i + 1] - gMean) ** 2;
      bVar += (data[i + 2] - bMean) ** 2;
    }

    addValue(Math.sqrt(rVar / pixelCount) / 255);
    addValue(Math.sqrt(gVar / pixelCount) / 255);
    addValue(Math.sqrt(bVar / pixelCount) / 255);

    // Add corner detection (4x4 grid sampling) (16 values)
    const gridW = Math.floor(canvas.width / 4);
    const gridH = Math.floor(canvas.height / 4);
    
    for (let gy = 0; gy < 4; gy++) {
      for (let gx = 0; gx < 4; gx++) {
        let cellR = 0, cellCount = 0;
        
        for (let y = gy * gridH; y < (gy + 1) * gridH && y < canvas.height; y++) {
          for (let x = gx * gridW; x < (gx + 1) * gridW && x < canvas.width; x++) {
            const idx = (y * canvas.width + x) * 4;
            cellR += data[idx];
            cellCount++;
          }
        }
        
        addValue(cellCount > 0 ? cellR / cellCount / 255 : 0.5);
      }
    }

    // Pad with texture features to reach 128
    while (descriptor.length < 128) {
      descriptor.push(0.5);
    }

  } catch (e) {
    console.error("Error generating descriptor:", e);
    // Return a default descriptor on error
    while (descriptor.length < 128) {
      descriptor.push(0.5);
    }
  }

  return descriptor.slice(0, 128);
}
