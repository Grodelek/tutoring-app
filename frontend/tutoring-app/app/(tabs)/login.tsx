import React, { useState, useEffect } from "react";
import {
    View,
    TextInput,
    Text,
    Pressable,
    Alert,
    StyleSheet,
    ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { postLogin } from "@/api/userApi";
import Checkbox from "expo-checkbox";
import { C, T, R } from "@/constants/theme";

const LoginForm: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [checked, setChecked] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const { setToken } = useAuth();
    const router = useRouter();
    const insets = useSafeAreaInsets();

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
        if (!email || !password) {
            Alert.alert("Błąd", "Podaj email i hasło.");
            return;
        }
        try {
            const data = await postLogin({ email, password });
            const token = data.token;
            const userId = data.userId;
            const loginUserType = data.userType;
            const tutorProfileComplete = data.tutorProfileComplete;
            if (!token) {
                Alert.alert("Błąd", "Brak tokenu w odpowiedzi.");
                return;
            }
            if (checked) {
                await AsyncStorage.setItem("savedEmail", email);
            }
            await AsyncStorage.setItem("jwtToken", token);
            await AsyncStorage.setItem("userId", userId.toString());
            if (loginUserType) {
                await AsyncStorage.setItem("userType", loginUserType);
            }
            if (typeof tutorProfileComplete === "boolean") {
                await AsyncStorage.setItem("hasCompletedTutorProfile", tutorProfileComplete ? "true" : "false");
            }

            const userType = await AsyncStorage.getItem("userType");
            const completed = await AsyncStorage.getItem("hasCompletedTutorProfile");

            if (userType === "TUTOR" && completed !== "true") {
                router.replace("/AfterLoginPopUp/moreInfoAboutTutor");

            } else {
                setToken(token);
                router.replace("/(auth)/myAccount");
            }
        } catch (error: any) {
            Alert.alert("Błąd", `Problem z połączeniem: ${error?.message ?? "Nieznany błąd"}`);
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
                    <Text style={styles.appName}>Skill Swap</Text>
                    <Text style={styles.appSub}>Znajdź swojego korepetytora</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Zaloguj się</Text>

                    <View style={[styles.inputWrap, emailFocused && styles.inputWrapFocused]}>
                        <MaterialCommunityIcons
                            name="email-outline"
                            size={18}
                            color={emailFocused ? C.amber : C.textDim}
                        />
                        <TextInput
                            placeholder="Email"
                            value={email}
                            onChangeText={setEmail}
                            style={styles.input}
                            autoCapitalize="none"
                            placeholderTextColor={C.textFaint}
                            autoComplete="email"
                            autoCorrect={false}
                            keyboardType="email-address"
                            onFocus={() => setEmailFocused(true)}
                            onBlur={() => setEmailFocused(false)}
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
                            value={password}
                            onChangeText={setPassword}
                            style={styles.input}
                            autoCapitalize="none"
                            secureTextEntry
                            placeholderTextColor={C.textFaint}
                            autoComplete="password"
                            autoCorrect={false}
                            onFocus={() => setPasswordFocused(true)}
                            onBlur={() => setPasswordFocused(false)}
                        />
                    </View>

                    <View style={styles.rememberRow}>
                        <Checkbox
                            value={checked}
                            onValueChange={handleCheckboxPress}
                            color={checked ? C.amber : undefined}
                        />
                        <Text style={styles.rememberText}>Zapamiętaj mnie</Text>
                    </View>

                    <Pressable style={styles.ctaBtn} onPress={handleSubmit}>
                        <Text style={styles.ctaText}>Zaloguj się</Text>
                    </Pressable>

                    <Pressable>
                        <Text style={styles.forgotText}>Zapomniałem hasła</Text>
                    </Pressable>

                    <View style={styles.registerRow}>
                        <Text style={styles.registerPrompt}>Nie masz konta? </Text>
                        <Pressable onPress={() => router.push("/register")}>
                            <Text style={styles.registerLink}>Zarejestruj się</Text>
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
    rememberRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    rememberText: {
        fontFamily: T.family.medium,
        fontSize: 14,
        color: C.textDim,
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
    forgotText: {
        fontFamily: T.family.medium,
        fontSize: 13,
        color: C.textDim,
        textAlign: "center",
    },
    registerRow: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 4,
    },
    registerPrompt: {
        fontFamily: T.family.medium,
        fontSize: 13,
        color: C.textDim,
    },
    registerLink: {
        fontFamily: T.family.bold,
        fontWeight: T.weight.bold,
        fontSize: 13,
        color: C.amber,
    },
});

export default LoginForm;
