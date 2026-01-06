import { Storage } from '@google-cloud/storage';

// Initialize GCS
const storage = new Storage();
const bucketName = process.env.GCS_BUCKET_NAME; // Make sure this is 'ssm-image-post' in your .env

export async function uploadToGCS(imageBuffer, filename) {
  try {
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(filename);

    console.log(`Uploading ${filename} to GCS...`);

    // UPDATED: Removed 'public: true' because your bucket uses Uniform Access Control.
    // Since your bucket says "Access granted to public principals", the file 
    // will be public automatically upon upload.
    await file.save(imageBuffer, {
      contentType: 'image/png',
      resumable: false 
    });

    // Construct the standard public URL
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${filename}`;
    console.log(`Upload successful: ${publicUrl}`);
    
    return publicUrl;

  } catch (error) {
    console.error("GCS Upload Error:", error);
    throw new Error("Failed to upload image to storage.");
  }
}
