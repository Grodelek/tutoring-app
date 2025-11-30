import React, { useState } from "react";
import { View, Button, Image, ActivityIndicator } from "react-native";
import { uploadImageToCloudinary } from "./UploadImageToCloudinary";
interface UploadPhotoProps {
    onUploaded?: (url: string) => void;
}
const UploadPhoto: React.FC<UploadPhotoProps> = ({ onUploaded }) => {
    const [loading, setLoading] = useState(false);
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);

    const handleUpload = async () => {
        try {
            setLoading(true);
            const url = await uploadImageToCloudinary();

            if (url) {
                setPhotoUrl(url);
                if (onUploaded) onUploaded(url);
            }
        } catch (e) {
            console.log("Upload error:", e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ alignItems: "center", marginTop: 20 }}>
            <Button title="Upload Photo" onPress={handleUpload} />

            {loading && (
                <ActivityIndicator size="large" style={{ marginTop: 20 }} />
            )}

            {photoUrl && (
                <Image
                    source={{ uri: photoUrl }}
                    style={{
                        width: 200,
                        height: 200,
                        borderRadius: 10,
                        marginTop: 20,
                    }}
                />
            )}
        </View>
    );
};

export default UploadPhoto;
