import React, { useEffect, useState } from "react";
import {
    View,
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    Platform,
} from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { addMoreInfo, Availability, ExperienceTime, LessonType } from "@/api/userApi";

const MoreInfoAboutTutor: React.FC = () => {
    const [experienceTime, setExperienceTime] = useState<ExperienceTime | null>(null);
    const [availability, setAvailability] = useState<Availability | null>(null);
    const [lessonType, setLessonType] = useState<LessonType | null>(null);
    const [username, setUsername] = useState<string | null>(null);

    useEffect(() => {
        AsyncStorage.getItem("username").then(setUsername);
    }, []);

    const showAlert = (message: string) => {
        if (Platform.OS === "web") {
            alert(message);
        } else {
            Alert.alert("Info", message);
        }
    };

    const handleSubmit = async () => {
        try {
            if (!experienceTime || !availability || !lessonType) {
                showAlert("Please select all fields.");
                return;
            }
            await addMoreInfo({
                experienceTime,
                availability,
                lessonType,
            });
            AsyncStorage.setItem("hasCompletedTutorProfile", "true");
            showAlert("Success! Profile completed!");
            router.push("/login");
        } catch (error) {
            console.log("Error while saving tutor info", error);
            showAlert("Error while saving tutor info");
        }
    };

    const renderOptionRow = <T extends string>(
        label: string,
        options: T[],
        selected: T | null,
        onSelect: (value: T) => void,
    ) => (
        <>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.optionRow}>
                {options.map((opt) => (
                    <TouchableOpacity
                        key={opt}
                        style={[
                            styles.optionButton,
                            selected === opt && styles.optionButtonActive,
                        ]}
                        onPress={() => onSelect(opt)}
                    >
                        <Text
                            style={[
                                styles.optionButtonText,
                                selected === opt && styles.optionButtonTextActive,
                            ]}
                        >
                            {opt.replace(/_/g, " ")}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </>
    );

    return (
        <View style={styles.screen}>
            <View style={styles.formContainer}>
                <Text style={styles.title}>TUTOR PROFILE</Text>
                <Text style={styles.subtitle}>Tell us more about yourself</Text>

                {renderOptionRow<ExperienceTime>(
                    "Experience",
                    ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"],
                    experienceTime,
                    setExperienceTime,
                )}

                {renderOptionRow<Availability>(
                    "Availability",
                    ["WEEKDAYS_ONLY", "WEEKENDS_ONLY", "EVENING_ONLY", "FLEXIBLE"],
                    availability,
                    setAvailability,
                )}

                {renderOptionRow<LessonType>(
                    "Teaching style",
                    ["PROFESSIONAL", "CASUAL", "FLEXIBLE"],
                    lessonType,
                    setLessonType,
                )}

                <TouchableOpacity onPress={handleSubmit} style={styles.primaryButton}>
                    <Text style={styles.primaryButtonText}>Complete registration</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: "#0B0C10",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
    },
    formContainer: {
        width: "100%",
        maxWidth: 420,
        backgroundColor: "#111827",
        paddingVertical: 28,
        paddingHorizontal: 24,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 6,
    },
    title: {
        fontSize: 24,
        color: "#F9FAFB",
        fontWeight: "700",
        textAlign: "center",
        marginBottom: 8,
        letterSpacing: 1.5,
    },
    subtitle: {
        color: "#9CA3AF",
        textAlign: "center",
        fontSize: 13,
        marginBottom: 24,
    },
    label: {
        color: "#9CA3AF",
        fontSize: 13,
        marginBottom: 4,
    },
    input: {
        backgroundColor: "#1F2937",
        paddingVertical: 12,
        paddingHorizontal: 14,
        marginBottom: 14,
        borderRadius: 10,
        color: "#F9FAFB",
        fontSize: 14,
        borderWidth: 1,
        borderColor: "#111827",
    },
    primaryButton: {
        backgroundColor: "#2563EB",
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 8,
    },
    primaryButtonText: {
        color: "#F9FAFB",
        fontWeight: "700",
        fontSize: 15,
    },
    optionRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 14,
    },
    optionButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: "#374151",
        backgroundColor: "#1F2937",
    },
    optionButtonActive: {
        backgroundColor: "#2563EB",
        borderColor: "#2563EB",
    },
    optionButtonText: {
        color: "#9CA3AF",
        fontSize: 13,
    },
    optionButtonTextActive: {
        color: "#fff",
        fontWeight: "600",
    },
});

export default MoreInfoAboutTutor;

