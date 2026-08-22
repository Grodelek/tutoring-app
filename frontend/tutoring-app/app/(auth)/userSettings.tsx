import React, { useState } from "react";
import {
    View,
    ScrollView,
    Pressable,
    StyleSheet,
    Text,
    Alert,
    ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@context/AuthContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { C, T, R } from "@/constants/theme";
import { getMyAccount, deleteUser } from "@/api/userApi";

const UserSettings = () => {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { logout } = useAuth();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await logout();
            router.replace("/(tabs)/login");
        } catch {
            router.replace("/(tabs)/login");
        }
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            "Usuń konto",
            "Ta operacja jest nieodwracalna. Wszystkie Twoje dane zostaną trwale usunięte.",
            [
                { text: "Anuluj", style: "cancel" },
                {
                    text: "Usuń konto",
                    style: "destructive",
                    onPress: confirmDelete,
                },
            ]
        );
    };

    const confirmDelete = async () => {
        setIsDeleting(true);
        try {
            const user = await getMyAccount();
            await deleteUser(user.id);
            await logout();
            router.replace("/(tabs)/login");
        } catch (e: any) {
            Alert.alert("Błąd", e.message ?? "Nie udało się usunąć konta.");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleNotifications = () => {
        Alert.alert("Wkrótce", "Ustawienia powiadomień będą dostępne w następnej wersji.");
    };

    const handlePrivacy = () => {
        Alert.alert("Wkrótce", "Ustawienia prywatności będą dostępne w następnej wersji.");
    };

    return (
        <View style={[styles.screen, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={C.text} />
                </Pressable>
            </View>

            <ScrollView
                contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.heading}>Ustawienia</Text>

                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Konto</Text>
                    <View style={styles.card}>
                        <Pressable
                            style={({ pressed }) => [styles.menuRow, pressed && styles.pressed]}
                            onPress={() => router.push("/(auth)/editProfile")}
                        >
                            <MaterialCommunityIcons name="account-edit-outline" size={20} color={C.amber} />
                            <Text style={styles.menuText}>Edytuj profil</Text>
                            <MaterialCommunityIcons name="chevron-right" size={20} color={C.textFaint} />
                        </Pressable>

                        <View style={styles.divider} />

                        <Pressable
                            style={({ pressed }) => [styles.menuRow, pressed && styles.pressed]}
                            onPress={handleNotifications}
                        >
                            <MaterialCommunityIcons name="bell-outline" size={20} color={C.teal} />
                            <Text style={styles.menuText}>Powiadomienia</Text>
                            <View style={styles.comingSoonBadge}>
                                <Text style={styles.comingSoonText}>Wkrótce</Text>
                            </View>
                        </Pressable>

                        <View style={styles.divider} />

                        <Pressable
                            style={({ pressed }) => [styles.menuRow, pressed && styles.pressed]}
                            onPress={handlePrivacy}
                        >
                            <MaterialCommunityIcons name="shield-lock-outline" size={20} color={C.purple} />
                            <Text style={styles.menuText}>Prywatność</Text>
                            <View style={styles.comingSoonBadge}>
                                <Text style={styles.comingSoonText}>Wkrótce</Text>
                            </View>
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

                <View style={styles.section}>
                    <Text style={[styles.sectionLabel, { color: "#C0392B" }]}>Strefa niebezpieczna</Text>
                    <Pressable
                        style={[styles.deleteBtn, isDeleting && { opacity: 0.6 }]}
                        onPress={handleDeleteAccount}
                        disabled={isDeleting}
                    >
                        {isDeleting ? (
                            <ActivityIndicator size="small" color="#C0392B" />
                        ) : (
                            <>
                                <MaterialCommunityIcons name="delete-outline" size={20} color="#C0392B" />
                                <Text style={styles.deleteText}>Usuń konto</Text>
                            </>
                        )}
                    </Pressable>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: C.bg },

    header: { paddingHorizontal: 8, paddingVertical: 4 },
    backBtn: { padding: 12 },

    content: { paddingHorizontal: 20, paddingTop: 4, gap: 20 },

    heading: {
        fontFamily: T.family.black,
        fontWeight: T.weight.black,
        fontSize: 28,
        color: C.text,
        letterSpacing: -0.7,
        marginBottom: 4,
    },

    section: { gap: 10 },
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
    pressed: { opacity: 0.6 },
    menuText: {
        flex: 1,
        fontFamily: T.family.medium,
        fontSize: 15,
        color: C.text,
    },
    divider: { height: 1, backgroundColor: C.border, marginLeft: 50 },

    comingSoonBadge: {
        backgroundColor: C.surface,
        borderWidth: 1,
        borderColor: C.border,
        borderRadius: R.full,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    comingSoonText: {
        fontFamily: T.family.medium,
        fontSize: 11,
        color: C.textFaint,
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

    deleteBtn: {
        backgroundColor: C.surface,
        borderRadius: R.md,
        paddingVertical: 15,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
        borderWidth: 1.5,
        borderColor: "#C0392B",
    },
    deleteText: {
        fontFamily: T.family.extraBold,
        fontWeight: T.weight.extraBold,
        fontSize: 15,
        color: "#C0392B",
    },
});

export default UserSettings;
