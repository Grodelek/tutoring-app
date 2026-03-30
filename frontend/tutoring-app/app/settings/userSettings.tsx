import React, { useState } from "react";
import {
    View,
    ScrollView,
    Pressable,
    StyleSheet,
    Text,
    SafeAreaView,
    ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";

const UserSettings = () => {
    const router = useRouter();
    const { token, setToken } = useAuth();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await AsyncStorage.removeItem("jwtToken");
            setToken(null);
            setTimeout(() => {
                router.replace("/login");
            }, 500);
        } catch (error) {
            console.error("Logout error:", error);
            router.replace("/login");
        }
    };

    const backToMyAccount = () => {
        router.push("/(auth)/myAccount");
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Settings</Text>
                </View>
                <View style={styles.section}>
                    <Pressable
                        style={({ pressed }) => [
                            styles.backButton,
                            pressed && styles.backButtonPressed,
                        ]}
                        onPress={backToMyAccount}
                    >
                        <Ionicons name="arrow-back" size={20} color="#fff" />
                        <Text style={styles.backButtonText}>Back to Account</Text>
                    </Pressable>

                    <Pressable
                        style={({ pressed }) => [
                            styles.logoutButton,
                            pressed && styles.logoutButtonPressed,
                        ]}
                        onPress={handleLogout}
                        disabled={isLoggingOut}
                    >
                        {isLoggingOut ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <>
                                <Ionicons name="log-out-outline" size={20} color="#fff" />
                                <Text style={styles.logoutButtonText}>Logout</Text>
                            </>
                        )}
                    </Pressable>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#1a1a1a",
    },
    container: {
        flex: 1,
        backgroundColor: "#1a1a1a",
    },
    content: {
        paddingBottom: 40,
    },
    header: {
        paddingVertical: 20,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#333",
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#fff",
    },
    section: {
        paddingHorizontal: 16,
        paddingVertical: 20,
        gap: 12,
    },
    backButton: {
        backgroundColor: "#404040",
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 12,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    backButtonPressed: {
        backgroundColor: "#525252",
        opacity: 0.85,
    },
    backButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    logoutButton: {
        backgroundColor: "#dc2626",
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 12,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    logoutButtonPressed: {
        backgroundColor: "#b91c1c",
        opacity: 0.9,
    },
    logoutButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
});

export default UserSettings;