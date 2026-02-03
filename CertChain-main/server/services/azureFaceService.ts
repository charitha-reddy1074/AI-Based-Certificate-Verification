import fetch from "node-fetch";

const AZURE_FACE_API_KEY = process.env.AZURE_FACE_API_KEY || "";
const AZURE_FACE_ENDPOINT = process.env.AZURE_FACE_ENDPOINT || "https://eastus.api.cognitive.microsoft.com";

export async function verifyFaceWithAzure(
  storedFaceImage: string,
  loginFaceImage: string
): Promise<{ success: boolean; isIdentical?: boolean; confidence?: number; error?: string }> {
  try {
    if (!AZURE_FACE_API_KEY) {
      console.warn("Azure Face API key not configured");
      return { success: false, error: "Azure Face API not configured" };
    }

    // Convert base64 dataURLs to buffers
    const storedBase64 = storedFaceImage.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");
    const loginBase64 = loginFaceImage.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");

    const storedBuffer = Buffer.from(storedBase64, "base64");
    const loginBuffer = Buffer.from(loginBase64, "base64");

    console.log(`📸 Verifying face with Azure... (stored: ${storedBuffer.length} bytes, login: ${loginBuffer.length} bytes)`);

    // Azure Face API verify endpoint
    // https://learn.microsoft.com/en-us/rest/api/faceapi/face/verify-face-to-face
    const url = `${AZURE_FACE_ENDPOINT}/face/v1.0/verify`;

    const headers = {
      "Ocp-Apim-Subscription-Key": AZURE_FACE_API_KEY,
      "Content-Type": "application/octet-stream",
    };

    // First, detect face in stored image
    console.log("  → Detecting face in stored image...");
    const detectStoredRes = await fetch(`${AZURE_FACE_ENDPOINT}/face/v1.0/detect`, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": AZURE_FACE_API_KEY,
        "Content-Type": "application/octet-stream",
      },
      body: storedBuffer as any,
    });

    if (!detectStoredRes.ok) {
      const text = await detectStoredRes.text();
      return { success: false, error: `Azure detect (stored) failed: ${detectStoredRes.status} ${text}` };
    }

    const detectedStored = await detectStoredRes.json();
    if (!Array.isArray(detectedStored) || detectedStored.length === 0) {
      return { success: false, error: "No face detected in stored image" };
    }

    const storedFaceId = (detectedStored[0] as any).faceId;
    console.log(`  ✓ Stored face detected: ${storedFaceId}`);

    // Detect face in login image
    console.log("  → Detecting face in login image...");
    const detectLoginRes = await fetch(`${AZURE_FACE_ENDPOINT}/face/v1.0/detect`, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": AZURE_FACE_API_KEY,
        "Content-Type": "application/octet-stream",
      },
      body: loginBuffer as any,
    });

    if (!detectLoginRes.ok) {
      const text = await detectLoginRes.text();
      return { success: false, error: `Azure detect (login) failed: ${detectLoginRes.status} ${text}` };
    }

    const detectedLogin = await detectLoginRes.json();
    if (!Array.isArray(detectedLogin) || detectedLogin.length === 0) {
      return { success: false, error: "No face detected in login image" };
    }

    const loginFaceId = (detectedLogin[0] as any).faceId;
    console.log(`  ✓ Login face detected: ${loginFaceId}`);

    // Now verify the two faces
    console.log("  → Comparing faces...");
    const verifyRes = await fetch(url, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": AZURE_FACE_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        faceId1: storedFaceId,
        faceId2: loginFaceId,
      }) as any,
    });

    if (!verifyRes.ok) {
      const text = await verifyRes.text();
      return { success: false, error: `Azure verify failed: ${verifyRes.status} ${text}` };
    }

    const result = (await verifyRes.json()) as any;
    console.log(`  ✓ Azure Face API result: isIdentical=${result.isIdentical}, confidence=${result.confidence}`);

    return {
      success: true,
      isIdentical: result.isIdentical === true,
      confidence: result.confidence,
    };
  } catch (err: any) {
    console.error("Azure Face API error:", err.message);
    return { success: false, error: err.message };
  }
}

export default { verifyFaceWithAzure };
