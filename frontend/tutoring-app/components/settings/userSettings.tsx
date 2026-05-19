import React, { useState } from "react";
import {
    View,
    ScrollView,
    Pressable,
    StyleSheet,
    Text,
    ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@context/AuthContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { C, T, R } from "@/constants/theme";

const UserSettings = () => {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { setToken } = useAuth();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await AsyncStorage.removeItem("jwtToken");
            setToken(null);
            setTimeout(() => router.replace("/login"), 400);
        } catch {
            router.replace("/login");
        }
    };

    return (
        <View style={[styles.screen, { paddingTop: insets.top }]}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
                <MaterialCommunityIcons name="arrow-left" size={24} color={C.text} />
            </Pressable>

            <ScrollView
                contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.heading}>Ustawienia</Text>

                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Konto</Text>
                    <View style={styles.card}>
                        <Pressable style={styles.menuRow}>
                            <View style={[styles.menuIcon, { backgroundColor: C.amber + "22" }]}>
                                <MaterialCommunityIcons name="account-edit-outline" size={20} color={C.amber} />
                            </View>
                            <Text style={styles.menuText}>Edytuj profil</Text>
                            <MaterialCommunityIcons name="chevron-right" size={20} color={C.textFaint} />
                        </Pressable>

                        <View style={styles.divider} />

                        <Pressable style={styles.menuRow}>
                            <View style={[styles.menuIcon, { backgroundColor: C.teal + "22" }]}>
                                <MaterialCommunityIcons name="bell-outline" size={20} color={C.teal} />
                            </View>
                            <Text style={styles.menuText}>Powiadomienia</Text>
                            <MaterialCommunityIcons name="chevron-right" size={20} color={C.textFaint} />
                        </Pressable>

                        <View style={styles.divider} />

                        <Pressable style={styles.menuRow}>
                            <View style={[styles.menuIcon, { backgroundColor: C.purple + "22" }]}>
                                <MaterialCommunityIcons name="shield-lock-outline" size={20} color={C.purple} />
                            </View>
                            <Text style={styles.menuText}>Prywatność</Text>
                            <MaterialCommunityIcons name="chevron-right" size={20} color={C.textFaint} />
                        </Pressable>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Sesja</Text>
                    <Pressable
                        style={[styles.logoutBtn, isLoggingOut && { opacity: 0.6 }]}
                        onPress={handleLogout}
                        disabled={isLoggingOut}
                    >
                        {isLoggingOut ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <>
                                <MaterialCommunityIcons name="logout" size={20} color="#fff" />
                                <Text style={styles.logoutText}>Wyloguj się</Text>
                            </>
                        )}
                    </Pressable>
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
    backBtn: {
        padding: 16,
    },
    content: {
        paddingHorizontal: 20,
        paddingTop: 4,
        gap: 20,
    },
    heading: {
        fontFamily: T.family.black,
        fontWeight: T.weight.black,
        fontSize: 28,
        color: C.text,
        letterSpacing: -0.7,
        marginBottom: 4,
    },
    section: {
        gap: 10,
    },
    sectionLabel: {
        fontFamily: T.family.black,
        fontWeight: T.weight.black,
        fontSize: 11,
        letterSpacing: 1.5,
        textTransform: "uppercase",
        color: C.textDim,
        paddingHorizontal: 4,
    },
    card: {
        backgroundColor: C.surface,
        borderRadius: R.md,
        borderWidth: 1,
        borderColor: C.border,
        overflow: "hidden",
    },
    menuRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    menuIcon: {
        width: 36,
        height: 36,
        borderRadius: R.xs,
        justifyContent: "center",
        alignItems: "center",
    },
    menuText: {
        flex: 1,
        fontFamily: T.family.medium,
        fontSize: 15,
        color: C.text,
    },
    divider: {
        height: 1,
        backgroundColor: C.border,
        marginLeft: 66,
    },
    logoutBtn: {
        backgroundColor: "#C0392B",
        borderRadius: R.md,
        paddingVertical: 15,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
        borderBottomWidth: 3,
        borderBottomColor: "#922B21",
    },
    logoutText: {
        fontFamily: T.family.extraBold,
        fontWeight: T.weight.extraBold,
        fontSize: 15,
        color: "#fff",
    },
});

export default UserSettings;
