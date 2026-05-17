import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  FlatList,
  Text,
  Alert,
  StyleSheet,
  RefreshControl,
  Pressable,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { fetchUserById, Lesson } from "@/api/userApi";
import { fetchConversationHistoryFromApi } from "@/api/conversationApi";
import { C, T } from "@/constants/theme";

function hexAlpha(hex: string, a: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

function formatTime(raw?: string): string {
  if (!raw) return "";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return "";
  const now = new Date();
  const diffMin = Math.floor((now.getTime() - date.getTime()) / 60000);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);
  if (diffMin < 1) return "teraz";
  if (diffMin < 60) return `${diffMin} min`;
  if (diffH < 24) return `${diffH} h`;
  if (diffD === 1) return "wczoraj";
  if (diffD < 7) return `${diffD} dni`;
  return date.toLocaleDateString("pl-PL");
}

interface Conversation {
  id: string | number;
  user1Id: string;
  user2Id: string;
  lastMessageSnippet?: string;
  unreadCount?: number;
}

interface User {
  id: string;
  email: string;
  password: string;
  roles: string;
  username: string;
  photoPath: string;
  description: string;
  lessons: Lesson[];
  confirmed: boolean;
}

function ConversationRow({
  item,
  userId,
  onPress,
}: {
  item: Conversation;
  userId: string | null;
  onPress: () => void;
}) {
  const [receiver, setReceiver] = useState<User | null>(null);

  useEffect(() => {
    if (!userId) return;
    const otherId = item.user1Id === userId ? item.user2Id : item.user1Id;
    fetchUserById(otherId).then(setReceiver).catch(() => {});
  }, [item, userId]);

  const unread = item.unreadCount ?? 0;
  const snippet = item.lastMessageSnippet ?? "Kliknij, aby rozpocząć rozmowę";
  const timeLabel = formatTime((item as any).lastMessageAt);
  const initial = receiver?.username?.charAt(0).toUpperCase() ?? "?";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <View style={styles.avatarWrap}>
        {receiver?.photoPath ? (
          <Image source={{ uri: receiver.photoPath }} style={styles.avatarImg} />
        ) : (
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>{initial}</Text>
          </View>
        )}
        {unread > 0 && (
          <View style={styles.unreadDot}>
            <Text style={styles.unreadDotText}>{unread > 9 ? "9+" : unread}</Text>
          </View>
        )}
      </View>

      <View style={styles.rowBody}>
        <View style={styles.rowTop}>
          <Text
            style={[styles.rowName, unread > 0 && styles.rowNameBold]}
            numberOfLines={1}
          >
            {receiver?.username ?? "…"}
          </Text>
          {timeLabel ? <Text style={styles.rowTime}>{timeLabel}</Text> : null}
        </View>
        <Text
          style={[styles.rowSnippet, unread > 0 && styles.rowSnippetBold]}
          numberOfLines={1}
        >
          {snippet}
        </Text>
      </View>

      <MaterialCommunityIcons name="chevron-right" size={18} color={C.textFaint} />
    </Pressable>
  );
}

const ConversationHistoryScreen: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const loadConversations = useCallback(async (uid: string) => {
    try {
      const data = await fetchConversationHistoryFromApi(uid);
      setConversations(Array.isArray(data) ? data : []);
    } catch (e: any) {
      Alert.alert("Błąd", `Problem z połączeniem: ${e.message}`);
      setConversations([]);
    }
  }, []);

  const loadAll = useCallback(async () => {
    try {
      const [uid, token] = await Promise.all([
        AsyncStorage.getItem("userId"),
        AsyncStorage.getItem("jwtToken"),
      ]);
      if (uid && token) {
        setUserId(uid);
        await loadConversations(uid);
      }
    } catch (e: any) {
      Alert.alert("Błąd", `Problem z ładowaniem danych: ${e.message}`);
    }
  }, [loadConversations]);

  useFocusEffect(useCallback(() => { loadAll(); }, [loadAll]));

  const onRefresh = async () => {
    setRefreshing(true);
    if (userId) await loadConversations(userId);
    setRefreshing(false);
  };

  const handlePress = (item: Conversation) => {
    if (!userId) return;
    const conversationId = String(item.id);
    const receiverId =
      String(item.user1Id) === String(userId)
        ? String(item.user2Id)
        : String(item.user1Id);
    router.push({
      pathname: "/messages/[conversationId]",
      params: { conversationId, receiverId },
    });
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Chat</Text>
          <Text style={styles.headerSub}>Twoje rozmowy z tutorami</Text>
        </View>
        <View style={styles.headerIcon}>
          <MaterialCommunityIcons name="message-text" size={20} color={C.teal} />
        </View>
      </View>

      <FlatList<Conversation>
        data={conversations}
        keyExtractor={(item) => String(item.id)}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={C.teal}
          />
        }
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + 16 },
          conversations.length === 0 && styles.listEmpty,
        ]}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIcon}>
              <MaterialCommunityIcons
                name="message-text-outline"
                size={32}
                color={C.teal}
              />
            </View>
            <Text style={styles.emptyTitle}>Brak rozmów</Text>
            <Text style={styles.emptyBody}>
              Połącz się z tutorem, aby rozpocząć pierwszą rozmowę!
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <ConversationRow
            item={item}
            userId={userId}
            onPress={() => handlePress(item)}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: C.bg,
  },

  // ── header ──
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: C.border,
  },
  headerTitle: {
    fontFamily: T.family.extraBold,
    fontWeight: T.weight.extraBold,
    fontSize: 24,
    letterSpacing: -0.55,
    color: C.text,
  },
  headerSub: {
    fontFamily: T.family.medium,
    fontSize: 12,
    color: C.textDim,
    marginTop: 2,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: hexAlpha(C.teal, 0.13),
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: hexAlpha(C.teal, 0.25),
  },

  // ── list ──
  list: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  listEmpty: {
    flexGrow: 1,
    justifyContent: "center",
  },
  separator: {
    height: 1,
    backgroundColor: C.border,
    marginLeft: 76,
  },

  // ── row ──
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
    gap: 12,
  },
  rowPressed: {
    opacity: 0.7,
  },

  // ── avatar ──
  avatarWrap: {
    position: "relative",
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: hexAlpha(C.teal, 0.15),
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: hexAlpha(C.teal, 0.3),
  },
  avatarImg: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: hexAlpha(C.teal, 0.3),
  },
  avatarInitial: {
    fontFamily: T.family.black,
    fontWeight: "900",
    fontSize: 20,
    color: C.teal,
  },
  unreadDot: {
    position: "absolute",
    top: -2,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: C.coral,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: C.bg,
  },
  unreadDotText: {
    fontFamily: T.family.bold,
    fontWeight: T.weight.bold,
    fontSize: 10,
    color: "#fff",
  },

  // ── row text ──
  rowBody: {
    flex: 1,
    gap: 3,
  },
  rowTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowName: {
    fontFamily: T.family.bold,
    fontWeight: T.weight.bold,
    fontSize: 15,
    color: C.text,
    flex: 1,
    marginRight: 8,
  },
  rowNameBold: {
    fontFamily: T.family.extraBold,
    fontWeight: T.weight.extraBold,
  },
  rowTime: {
    fontFamily: T.family.medium,
    fontSize: 11,
    color: C.textFaint,
  },
  rowSnippet: {
    fontFamily: T.family.medium,
    fontSize: 13,
    color: C.textDim,
  },
  rowSnippetBold: {
    fontFamily: T.family.bold,
    fontWeight: T.weight.bold,
    color: C.text,
  },

  // ── empty ──
  emptyWrap: {
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: hexAlpha(C.teal, 0.13),
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: hexAlpha(C.teal, 0.25),
    marginBottom: 4,
  },
  emptyTitle: {
    fontFamily: T.family.extraBold,
    fontWeight: T.weight.extraBold,
    fontSize: 18,
    color: C.text,
  },
  emptyBody: {
    fontFamily: T.family.medium,
    fontSize: 14,
    color: C.textDim,
    textAlign: "center",
    lineHeight: 20,
  },
});

export default ConversationHistoryScreen;
