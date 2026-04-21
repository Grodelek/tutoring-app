import React, { useState, useEffect } from "react";
import {
    View,
    TextInput,
    Text,
    TouchableOpacity,
    Alert,
    StyleSheet,
    Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { postLogin } from "@/api/userApi";
import Checkbox from "expo-checkbox";

const LoginForm: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [checked, setChecked] = useState(false);
    const { setToken } = useAuth();
    const router = useRouter();

    useEffect(() => {
        const loadStorage = async () => {
            const savedChecked = await AsyncStorage.getItem("rememberMe");
            const savedEmail = await AsyncStorage.getItem("savedEmail");

            if (savedChecked === "true" && savedEmail) {
                setChecked(true);
                setEmail(savedEmail);
            }
        };

        loadStorage();
    }, []);

    const handleCheckboxPress = async (newValue: boolean) => {
        setChecked(newValue);

        if (newValue) {
            await AsyncStorage.setItem("rememberMe", "true");
            await AsyncStorage.setItem("savedEmail", email);
        } else {
            await AsyncStorage.removeItem("rememberMe");
            await AsyncStorage.removeItem("savedEmail");
        }
    };

    const navigateAfterLogin = async () => {
        try {
            const userType = await AsyncStorage.getItem("userType");
            const isTutorProfileCompleted = await AsyncStorage.getItem("hasCompletedTutorProfile");
            if (userType === "TUTOR" && isTutorProfileCompleted !== "true") {
                router.push("/registerForm/moreInfoAboutTutor");
            } else {
                router.replace("/(auth)");
            }
        } catch (e) {
            router.replace("/(auth)");
        }
    };

    const handleSubmit = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please fill in email and password.");
            return;
        }
        try {
            const data = await postLogin({ email, password });
            const token = data.token;
            const userId = data.userId;

            if (checked) {
                await AsyncStorage.setItem("savedEmail", email);
            }

            if (token) {
                await AsyncStorage.setItem("jwtToken", token);
                await AsyncStorage.setItem("userId", userId.toString());

                setToken(token);
                await navigateAfterLogin();

                Alert.alert("Success", "User logged in successfully!");
                await navigateAfterLogin();
            } else {
                Alert.alert("Error", "Token not found in response");
            }
        } catch (error: any) {
            Alert.alert(
                "Error",
                `Problem with connection: ${error?.message ?? "Unknown error"}`
            );
        }
    };

    return (
        <View style={styles.screen}>
            <View style={styles.formContainer}>
                <Text style={styles.title}>LOGIN</Text>

                <TextInput
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    style={styles.input}
                    autoCapitalize="none"
                    placeholderTextColor="#aaa"
                    autoComplete="email"
                    autoCorrect={false}
                    onFocus={(e) => {
                        if (Platform.OS === 'web') {
                            e.currentTarget?.focus();
                        }
                    }}
                />
                <TextInput
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    style={styles.input}
                    autoCapitalize="none"
                    secureTextEntry
                    placeholderTextColor="#aaa"
                    autoComplete="password"
                    autoCorrect={false}
                    onFocus={(e) => {
                        if (Platform.OS === 'web') {
                            e.currentTarget?.focus();
                        }
                    }}
                />

                <View style={styles.rememberMeContainer}>
                    <Checkbox value={checked} onValueChange={handleCheckboxPress} />
                    <Text style={styles.rememberMeText}>Remember me</Text>
                </View>

                <TouchableOpacity style={styles.loginButton} onPress={handleSubmit}>
                    <Text style={styles.loginButtonText}>LOGIN</Text>
                </TouchableOpacity>

                <TouchableOpacity>
                    <Text style={styles.forgotPassword}>Forgot password?</Text>
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
        marginBottom: 24,
        letterSpacing: 1.5,
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
    rememberMeContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 18,
    },
    rememberMeText: {
        color: "#9CA3AF",
        marginLeft: 8,
        fontSize: 13,
    },
    loginButton: {
        backgroundColor: "#2563EB",
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: "center",
        marginBottom: 12,
    },
    loginButtonText: {
        color: "#F9FAFB",
        fontWeight: "700",
        fontSize: 15,
    },
    forgotPassword: {
        color: "#9CA3AF",
        textAlign: "center",
        marginTop: 10,
        fontSize: 13,
    },
});

export default LoginForm;

