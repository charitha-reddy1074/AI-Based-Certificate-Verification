import { Rekognition } from "@aws-sdk/client-rekognition";

const AWS_REGION = process.env.AWS_REGION || "us-east-1";
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || "";
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY || "";

const rekognition = new Rekognition({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

export async function verifyFaceWithRekognition(
  storedFaceImage: string,
  loginFaceImage: string
): Promise<{ success: boolean; isMatch?: boolean; similarity?: number; error?: string }> {
  try {
    if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
      console.warn("AWS credentials not configured");
      return { success: false, error: "AWS Rekognition not configured" };
    }

    // Convert base64 dataURLs to buffers
    const storedBase64 = storedFaceImage.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");
    const loginBase64 = loginFaceImage.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");

    const storedBuffer = Buffer.from(storedBase64, "base64");
    const loginBuffer = Buffer.from(loginBase64, "base64");

    console.log(`📸 Verifying face with Amazon Rekognition... (stored: ${storedBuffer.length} bytes, login: ${loginBuffer.length} bytes)`);

    // Compare faces using AWS Rekognition CompareFaces
    const response = await rekognition.compareFaces({
      SourceImage: {
        Bytes: storedBuffer,
      },
      TargetImage: {
        Bytes: loginBuffer,
      },
      SimilarityThreshold: 80, // 80% similarity threshold
    });

    console.log(`  ✓ AWS Rekognition response:`, {
      faceMatches: response.FaceMatches?.length || 0,
    });

    // Check if faces match
    if (!response.FaceMatches || response.FaceMatches.length === 0) {
      console.log(`  ✗ No matching faces found`);
      return { success: true, isMatch: false, similarity: 0 };
    }

    const match = response.FaceMatches[0];
    const similarity = match.Similarity || 0;

    console.log(`  ✓ Face match found! Similarity: ${similarity.toFixed(2)}%`);

    return {
      success: true,
      isMatch: similarity >= 80, // Match if >= 80% similarity
      similarity,
    };
  } catch (err: any) {
    console.error("AWS Rekognition error:", err.message);
    return { success: false, error: err.message };
  }
}

export default { verifyFaceWithRekognition };
