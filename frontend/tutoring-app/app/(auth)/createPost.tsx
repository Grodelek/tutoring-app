import React, { useState, useRef } from "react";
import {
  Animated,
  View,
  TextInput,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  Pressable,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { handleSubmitPost } from "@/api/postApi";
import { C, T, R } from "@/constants/theme";
import { Card } from "@/components/ui/Card";

const SUBJECTS = ["Polski", "Matematyka", "J.Angielski", "J.Rosyjski"];

function SectionLabel({ children }: { children: string }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

const CreatePost: React.FC = () => {
  const insets = useSafeAreaInsets();

  const [subject,         setSubject]         = useState<string | null>(null);
  const [inputText,       setInputText]        = useState("");
  const [dropdownMounted, setDropdownMounted]  = useState(false);
  const dropdownAnim = useRef(new Animated.Value(0)).current;

  const filteredSubjects = SUBJECTS.filter((s) =>
    s.toLowerCase().includes(inputText.toLowerCase())
  );

  const openDropdown = () => {
    setDropdownMounted(true);
    Animated.spring(dropdownAnim, {
      toValue: 1, useNativeDriver: true, tension: 280, friction: 22,
    }).start();
  };

  const closeDropdown = () => {
    Animated.timing(dropdownAnim, {
      toValue: 0, duration: 160, useNativeDriver: true,
    }).start(() => setDropdownMounted(false));
  };

  const selectSubject = (s: string) => {
    setSubject(s);
    setInputText(s);
    closeDropdown();
  };

  const clearSubject = () => {
    setSubject(null);
    setInputText("");
    openDropdown();
  };

  const [description,    setDescription]    = useState("");
  const [durationTime,   setDurationTime]   = useState("");
  const [price,          setPrice]          = useState("");
  const [descFocused,    setDescFocused]    = useState(false);
  const [durationFocused,setDurationFocused]= useState(false);
  const [priceFocused,   setPriceFocused]   = useState(false);

  const handleSubmit = async () => {
    if (!subject) {
      Alert.alert("Błąd", "Wybierz przedmiot.");
      return;
    }
    if (!description.trim() || !durationTime.trim() || !price.trim()) {
      Alert.alert("Błąd", "Wypełnij wszystkie pola.");
      return;
    }
    await handleSubmitPost({ subject, description, price, durationTime });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: C.bg }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Nowa oferta</Text>
          <Text style={styles.subtitle}>
            Opisz swoją lekcję i pomóż uczniom osiągnąć cele.
          </Text>
        </View>

        {/* Przedmiot */}
        <Card>
          <SectionLabel>Przedmiot</SectionLabel>
          <View style={[styles.inputWrap, subject ? styles.inputWrapConfirmed : null]}>
            <MaterialCommunityIcons
              name={subject ? "check-circle" : "magnify"}
              size={18}
              color={subject ? C.amber : C.textDim}
            />
            <TextInput
              value={inputText}
              onChangeText={(text: string) => {
                setInputText(text);
                setSubject(null);
                openDropdown();
              }}
              onFocus={openDropdown}
              onBlur={() => setTimeout(closeDropdown, 150)}
              placeholder="Wpisz lub wybierz przedmiot…"
              placeholderTextColor={C.textFaint}
              style={styles.input}
              returnKeyType="done"
            />
            {inputText.length > 0 && (
              <Pressable onPress={clearSubject} hitSlop={8}>
                <MaterialCommunityIcons name="close-circle" size={18} color={C.textDim} />
              </Pressable>
            )}
          </View>

          {dropdownMounted && (
            <Animated.View
              style={[
                styles.dropdown,
                {
                  opacity: dropdownAnim,
                  transform: [{
                    translateY: dropdownAnim.interpolate({
                      inputRange: [0, 1], outputRange: [-8, 0],
                    }),
                  }],
                },
              ]}
            >
              {filteredSubjects.length > 0 ? (
                <ScrollView
                  keyboardShouldPersistTaps="always"
                  nestedScrollEnabled
                  style={{ maxHeight: 172 }}
                  showsVerticalScrollIndicator={false}
                >
                  {filteredSubjects.map((s) => (
                    <Pressable
                      key={s}
                      onPress={() => selectSubject(s)}
                      style={[styles.dropdownItem, subject === s && styles.dropdownItemActive]}
                    >
                      <Text style={[styles.dropdownText, subject === s && styles.dropdownTextActive]}>
                        {s}
                      </Text>
                      {subject === s && (
                        <MaterialCommunityIcons name="check" size={16} color={C.amber} />
                      )}
                    </Pressable>
                  ))}
                </ScrollView>
              ) : (
                <Text style={styles.dropdownEmpty}>Brak wyników</Text>
              )}
            </Animated.View>
          )}
        </Card>

        {/* Opis */}
        <Card>
          <SectionLabel>Opis lekcji</SectionLabel>
          <View style={[styles.inputWrap, styles.inputWrapMulti, descFocused && styles.inputWrapFocused]}>
            <MaterialCommunityIcons
              name="text-box-outline"
              size={18}
              color={descFocused ? C.amber : C.textDim}
              style={{ marginTop: 2 }}
            />
            <TextInput
              placeholder="Opisz poziom, zakres i czego może spodziewać się uczeń."
              placeholderTextColor={C.textFaint}
              value={description}
              onChangeText={setDescription}
              style={[styles.input, styles.inputMulti]}
              autoCapitalize="none"
              autoComplete="off"
              autoCorrect={false}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              onFocus={() => setDescFocused(true)}
              onBlur={() => setDescFocused(false)}
            />
          </View>
        </Card>

        {/* Czas i cena */}
        <Card>
          <View style={styles.twoCol}>
            {/* Czas trwania */}
            <View style={styles.colItem}>
              <SectionLabel>Czas trwania</SectionLabel>
              <View style={[styles.inputWrap, durationFocused && styles.inputWrapFocused]}>
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={18}
                  color={durationFocused ? C.teal : C.textDim}
                />
                <TextInput
                  placeholder="45"
                  placeholderTextColor={C.textFaint}
                  value={durationTime}
                  onChangeText={setDurationTime}
                  style={styles.input}
                  keyboardType="numeric"
                  returnKeyType="done"
                  autoComplete="off"
                  autoCorrect={false}
                  onSubmitEditing={() => Keyboard.dismiss()}
                  onFocus={() => setDurationFocused(true)}
                  onBlur={() => setDurationFocused(false)}
                />
              </View>
              <Text style={styles.helperText}>minut</Text>
            </View>

            <View style={styles.colDivider} />

            {/* Cena */}
            <View style={styles.colItem}>
              <SectionLabel>Cena</SectionLabel>
              <View style={[styles.inputWrap, priceFocused && styles.inputWrapFocused]}>
                <MaterialCommunityIcons
                  name="currency-usd"
                  size={18}
                  color={priceFocused ? C.amber : C.textDim}
                />
                <TextInput
                  placeholder="60"
                  placeholderTextColor={C.textFaint}
                  value={price}
                  onChangeText={setPrice}
                  style={styles.input}
                  keyboardType="numeric"
                  returnKeyType="done"
                  autoComplete="off"
                  autoCorrect={false}
                  onSubmitEditing={() => Keyboard.dismiss()}
                  onFocus={() => setPriceFocused(true)}
                  onBlur={() => setPriceFocused(false)}
                />
              </View>
              <Text style={styles.helperText}>zł / lekcja</Text>
            </View>
          </View>
        </Card>

        {/* CTA */}
        <Pressable style={styles.ctaBtn} onPress={handleSubmit}>
          <MaterialCommunityIcons name="send-outline" size={20} color="#241608" />
          <Text style={styles.ctaText}>Opublikuj ofertę</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 20,
    gap: 14,
  },
  header: {
    gap: 6,
    marginBottom: 4,
  },
  title: {
    fontFamily: T.family.black,
    fontWeight: T.weight.black,
    fontSize: 28,
    color: C.text,
    letterSpacing: -0.7,
  },
  subtitle: {
    fontFamily: T.family.medium,
    fontSize: 14,
    color: C.textDim,
  },
  sectionLabel: {
    fontFamily: T.family.black,
    fontWeight: T.weight.black,
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: C.textDim,
    marginBottom: 12,
  },
  inputWrapConfirmed: {
    borderColor: C.amber,
  },
  dropdown: {
    marginTop: 6,
    backgroundColor: C.bgDeep,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: R.sm,
    overflow: "hidden",
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  dropdownItemActive: {
    backgroundColor: C.amber + "18",
  },
  dropdownText: {
    fontFamily: T.family.medium,
    fontSize: 15,
    color: C.text,
  },
  dropdownTextActive: {
    fontFamily: T.family.bold,
    fontWeight: T.weight.bold,
    color: C.amber,
  },
  dropdownEmpty: {
    fontFamily: T.family.medium,
    fontSize: 14,
    color: C.textDim,
    textAlign: "center",
    paddingVertical: 14,
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
    paddingVertical: 10,
  },
  inputWrapMulti: {
    alignItems: "flex-start",
    paddingVertical: 12,
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
  inputMulti: {
    minHeight: 88,
    textAlignVertical: "top",
  },
  twoCol: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 0,
  },
  colItem: {
    flex: 1,
  },
  colDivider: {
    width: 16,
  },
  helperText: {
    fontFamily: T.family.medium,
    fontSize: 12,
    color: C.textFaint,
    marginTop: 6,
  },
  ctaBtn: {
    backgroundColor: C.amber,
    borderRadius: R.full,
    paddingVertical: 15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
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
});

export default CreatePost;
