import React, { useState } from "react";
import {
    View,
    TextInput,
    Alert,
    StyleSheet,
    Text,
    Pressable,
    Platform,
    ScrollView,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { postRegister } from "@/api/userApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { C, T, R } from "@/constants/theme";

const RegisterForm: React.FC = () => {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [userType, setUserType] = useState<"TUTOR" | "STUDENT">("STUDENT");
    const [emailFocused, setEmailFocused] = useState(false);
    const [usernameFocused, setUsernameFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const insets = useSafeAreaInsets();

    const showAlert = (message: string) => {
        if (Platform.OS === "web") {
            alert(message);
        } else {
            Alert.alert("Błąd", message);
        }
    };

    const handleSubmit = async () => {
        try {
            if (username.length < 6) {
                showAlert("Nazwa użytkownika musi mieć co najmniej 6 znaków.");
                return;
            }
            await postRegister({ email, username, password, userType });
            setEmail("");
            setUsername("");
            setPassword("");
            await AsyncStorage.setItem("userType", userType);
            await AsyncStorage.setItem("hasCompletedTutorProfile", "false");
            Alert.alert("Sukces", "Konto zostało zarejestrowane!");
            router.push("/login");
        } catch (error) {
            console.log("Registration error:", error);
            showAlert("Błąd podczas rejestracji konta.");
        }
    };

    return (
        <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <ScrollView
                contentContainerStyle={styles.scroll}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.brand}>
                    <View style={styles.logoCircle}>
                        <MaterialCommunityIcons name="school" size={36} color={C.amber} />
                    </View>
                    <Text style={styles.appName}>TutoringApp</Text>
                    <Text style={styles.appSub}>Stwórz nowe konto</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Rejestracja</Text>

                    <View style={[styles.inputWrap, emailFocused && styles.inputWrapFocused]}>
                        <MaterialCommunityIcons
                            name="email-outline"
                            size={18}
                            color={emailFocused ? C.amber : C.textDim}
                        />
                        <TextInput
                            placeholder="Email"
                            placeholderTextColor={C.textFaint}
                            value={email}
                            onChangeText={setEmail}
                            style={styles.input}
                            autoCapitalize="none"
                            autoComplete="email"
                            autoCorrect={false}
                            keyboardType="email-address"
                            onFocus={() => setEmailFocused(true)}
                            onBlur={() => setEmailFocused(false)}
                        />
                    </View>

                    <View style={[styles.inputWrap, usernameFocused && styles.inputWrapFocused]}>
                        <MaterialCommunityIcons
                            name="account-outline"
                            size={18}
                            color={usernameFocused ? C.amber : C.textDim}
                        />
                        <TextInput
                            placeholder="Nazwa użytkownika (min. 6 znaków)"
                            placeholderTextColor={C.textFaint}
                            value={username}
                            onChangeText={setUsername}
                            style={styles.input}
                            autoCapitalize="none"
                            autoComplete="username"
                            autoCorrect={false}
                            onFocus={() => setUsernameFocused(true)}
                            onBlur={() => setUsernameFocused(false)}
                        />
                    </View>

                    <View style={[styles.inputWrap, passwordFocused && styles.inputWrapFocused]}>
                        <MaterialCommunityIcons
                            name="lock-outline"
                            size={18}
                            color={passwordFocused ? C.amber : C.textDim}
                        />
                        <TextInput
                            placeholder="Hasło"
                            placeholderTextColor={C.textFaint}
                            value={password}
                            onChangeText={setPassword}
                            style={styles.input}
                            autoCapitalize="none"
                            secureTextEntry
                            autoComplete="password"
                            autoCorrect={false}
                            onFocus={() => setPasswordFocused(true)}
                            onBlur={() => setPasswordFocused(false)}
                        />
                    </View>

                    <Text style={styles.roleLabel}>Jestem:</Text>
                    <View style={styles.roleRow}>
                        {(["STUDENT", "TUTOR"] as const).map((type) => (
                            <Pressable
                                key={type}
                                style={[styles.roleBtn, userType === type && styles.roleBtnActive]}
                                onPress={() => setUserType(type)}
                            >
                                <MaterialCommunityIcons
                                    name={type === "STUDENT" ? "account-school-outline" : "human-male-board"}
                                    size={18}
                                    color={userType === type ? "#241608" : C.textDim}
                                />
                                <Text style={[styles.roleBtnText, userType === type && styles.roleBtnTextActive]}>
                                    {type === "STUDENT" ? "Student" : "Korepetytor"}
                                </Text>
                            </Pressable>
                        ))}
                    </View>

                    <Pressable onPress={handleSubmit} style={styles.ctaBtn}>
                        <Text style={styles.ctaText}>Zarejestruj się</Text>
                    </Pressable>

                    <View style={styles.loginRow}>
                        <Text style={styles.loginPrompt}>Masz już konto? </Text>
                        <Pressable onPress={() => router.push("/login")}>
                            <Text style={styles.loginLink}>Zaloguj się</Text>
                        </Pressable>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: C.bg,
    },
    scroll: {
        flexGrow: 1,
        justifyContent: "center",
        paddingHorizontal: 20,
        paddingVertical: 40,
        gap: 28,
    },
    brand: {
        alignItems: "center",
        gap: 8,
    },
    logoCircle: {
        width: 72,
        height: 72,
        borderRadius: R.lg,
        backgroundColor: C.surface,
        borderWidth: 2,
        borderColor: C.amber + "44",
        justifyContent: "center",
        alignItems: "center",
    },
    appName: {
        fontFamily: T.family.black,
        fontWeight: T.weight.black,
        fontSize: 28,
        color: C.text,
        letterSpacing: -0.5,
    },
    appSub: {
        fontFamily: T.family.medium,
        fontSize: 14,
        color: C.textDim,
    },
    card: {
        backgroundColor: C.surface,
        borderRadius: R.lg,
        padding: 24,
        borderWidth: 1,
        borderColor: C.border,
        gap: 14,
    },
    cardTitle: {
        fontFamily: T.family.extraBold,
        fontWeight: T.weight.extraBold,
        fontSize: 22,
        color: C.text,
        marginBottom: 4,
    },
    inputWrap: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        backgroundColor: C.bgDeep,
        borderWidth: 2,
        borderColor: C.border,
        borderRadius: R.sm,
        paddingHorizontal: 12,
        paddingVertical: 11,
    },
    inputWrapFocused: {
        borderColor: C.amber,
    },
    input: {
        flex: 1,
        fontFamily: T.family.medium,
        fontSize: 15,
        color: C.text,
    },
    roleLabel: {
        fontFamily: T.family.black,
        fontWeight: T.weight.black,
        fontSize: 11,
        letterSpacing: 1.5,
        textTransform: "uppercase",
        color: C.textDim,
        marginBottom: -4,
    },
    roleRow: {
        flexDirection: "row",
        gap: 10,
    },
    roleBtn: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 12,
        borderRadius: R.sm,
        borderWidth: 2,
        borderColor: C.border,
        backgroundColor: C.bgDeep,
    },
    roleBtnActive: {
        backgroundColor: C.amber,
        borderColor: C.amberDark,
    },
    roleBtnText: {
        fontFamily: T.family.bold,
        fontWeight: T.weight.bold,
        fontSize: 14,
        color: C.textDim,
    },
    roleBtnTextActive: {
        color: "#241608",
    },
    ctaBtn: {
        backgroundColor: C.amber,
        borderRadius: R.full,
        paddingVertical: 14,
        alignItems: "center",
        borderBottomWidth: 4,
        borderBottomColor: C.amberDark,
        marginTop: 4,
    },
    ctaText: {
        fontFamily: T.family.extraBold,
        fontWeight: T.weight.extraBold,
        fontSize: 16,
        color: "#241608",
    },
    loginRow: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    loginPrompt: {
        fontFamily: T.family.medium,
        fontSize: 13,
        color: C.textDim,
    },
    loginLink: {
        fontFamily: T.family.bold,
        fontWeight: T.weight.bold,
        fontSize: 13,
        color: C.amber,
    },
});

export default RegisterForm;
