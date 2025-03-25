import cloudinary from "cloudinary";

cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
});



const uploadOnCloudinary = async (file) => {
      try {

            const result = await cloudinary.uploader.upload(file);
            return result;
            
      } 
      catch (error) {
            console.log(error); 
      }
}


export {
     uploadOnCloudinary 
}