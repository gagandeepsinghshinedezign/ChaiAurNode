import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

const uploadFileToCloudinary = async (filePath) => {
  try {
    if (!filePath || !fs.existsSync(filePath)) {
      throw new Error('File does not exist at the specified path')
      return null
    }
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: 'auto'
    })
    console.log('File uploaded to Cloudinary:', result.secure_url)
    return result
  } catch (error) {
    fs.unlinkSync(filePath);
    console.error('Error uploading file to Cloudinary:', error);
    throw error;
  }
}
export { uploadFileToCloudinary }
