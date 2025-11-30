import * as ImagePicker from "expo-image-picker";

const CLOUD_NAME = "diap1nz73";
const UPLOAD_PRESET = "tutoring-app";

export const uploadImageToCloudinary = async (): Promise<string | null> => {
    try {
        // Request permission first
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        if (permissionResult.granted === false) {
            console.log("Permission to access camera roll is required!");
            return null;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
        });

        if (result.canceled || !result.assets || result.assets.length === 0) {
            return null;
        }

        const image = result.assets[0];
        const data = new FormData();
        data.append("file", {
            uri: image.uri,
            type: image.type || "image/jpeg",
            name: image.fileName || `photo_${Date.now()}.jpg`,
        } as any);
        data.append("upload_preset", UPLOAD_PRESET);

        const res = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
            {
                method: "POST",
                body: data,
            }
        );

        const json = await res.json();

        if (json.secure_url) {
            return json.secure_url;
        } else {
            console.log("Cloudinary upload failed", json);
            return null;
        }
    } catch (error) {
        console.error("Upload error:", error);
        return null;
    }
};
