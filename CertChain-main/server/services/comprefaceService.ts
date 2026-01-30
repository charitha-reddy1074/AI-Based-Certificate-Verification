import fetch from "node-fetch";
import FormData from "form-data";

const COMPREHFACE_URL = process.env.COMPRFACE_URL || "http://localhost:8000";
const COMPREHFACE_API_KEY = process.env.COMPRFACE_API_KEY || "";

export async function verifyFaceWithCompreFace(imageDataUrl: string): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    // Remove data URL prefix and obtain buffer
    const base64 = imageDataUrl.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");
    const buffer = Buffer.from(base64, "base64");

    // Build multipart/form-data - CompreFace typically accepts image file in a field named 'image' or similar
    const form = new FormData();
    form.append("image", buffer, {
      filename: "capture.jpg",
      contentType: "image/jpeg",
    });

    // If your CompreFace installation requires additional fields (e.g., gallery_id, subject_id), add them here.
    // form.append('gallery_id', 'your_gallery');

    const url = `${COMPREHFACE_URL}/api/v1/face/verify`; // adapt to your CompreFace endpoint if different

    const headers: any = { ...form.getHeaders() };
    if (COMPREHFACE_API_KEY) headers["Authorization"] = `Key ${COMPREHFACE_API_KEY}`;

    const res = await fetch(url, {
      method: "POST",
      headers,
      body: form as any,
    });

    if (!res.ok) {
      const text = await res.text();
      return { success: false, error: `CompreFace error: ${res.status} ${text}` };
    }

    const json = await res.json();

    // CompreFace responses vary; interpret `json` as needed by your deployment.
    return { success: true, data: json };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export default { verifyFaceWithCompreFace };
