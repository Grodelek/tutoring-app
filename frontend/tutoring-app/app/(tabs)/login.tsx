import React, { useState, useEffect } from "react";
import {
    View,
    TextInput,
    Text,
    TouchableOpacity,
    Alert,
    StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { postLogin } from "@/api/userApi";
import Checkbox from "expo-checkbox";

const LoginForm: React.FC = () => {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
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

    const handleSubmit = async () => {
        if (!email || !username || !password) {
            Alert.alert("Error", "Please fill in email, username and password.");
            return;
        }

        try {
            const data = await postLogin({ email, username, password });
            const token = data.token;
            const userId = data.userId;

            if (checked) {
                await AsyncStorage.setItem("savedEmail", email);
                await AsyncStorage.setItem("password", password);
            }

            if (token) {
                await AsyncStorage.setItem("jwtToken", token);
                await AsyncStorage.setItem("username", username);
                await AsyncStorage.setItem("userId", userId.toString());

                setToken(token);
                Alert.alert("Success", "User logged in successfully!");
                router.replace("/(auth)");
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
                />
                <TextInput
                    placeholder="Username"
                    value={username}
                    onChangeText={setUsername}
                    style={styles.input}
                    autoCapitalize="none"
                    placeholderTextColor="#aaa"
                />
                <TextInput
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    style={styles.input}
                    autoCapitalize="none"
                    secureTextEntry
                    placeholderTextColor="#aaa"
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
        backgroundColor: "#202040",
        alignItems: "center",
        justifyContent: "center",
    },
    formContainer: {
        backgroundColor: "#202040",
        padding: 30,
        borderRadius: 10,
        width: "85%",
    },
    title: {
        fontSize: 24,
        color: "white",
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 30,
    },
    input: {
        backgroundColor: "#2f2f4f",
        padding: 12,
        marginBottom: 15,
        borderRadius: 6,
        color: "#fff",
    },
    rememberMeContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 15,
    },
    rememberMeText: {
        color: "#ccc",
        marginLeft: 5,
    },
    loginButton: {
        backgroundColor: "#4a63f0",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
        marginBottom: 15,
    },
    loginButtonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
    forgotPassword: {
        color: "#b29eff",
        textAlign: "center",
        marginTop: 10,
    },
});

export default LoginForm;
