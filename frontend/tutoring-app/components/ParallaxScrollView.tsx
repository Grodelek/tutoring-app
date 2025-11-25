import React, { PropsWithChildren, ReactElement, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

import { ThemedView } from "@/components/ThemedView";
import { useBottomTabOverflow } from "@/components/ui/TabBarBackground";
import { useColorScheme } from "@/hooks/useColorScheme";

type Props = PropsWithChildren<{
    headerImage: ReactElement;
    headerBackgroundColor: { dark: string; light: string };
    headerHeight?: number;
}>;

export default function ParallaxScrollView({
                                               children,
                                               headerImage,
                                               headerBackgroundColor,
                                               headerHeight = 250,
                                           }: Props) {
    const colorScheme = useColorScheme() ?? "light";
    const scrollRef = useRef<Animated.ScrollView | null>(null);
    const bottom = useBottomTabOverflow();

    const scrollY = useRef(new Animated.Value(0)).current;

    const translateY = scrollY.interpolate({
        inputRange: [-headerHeight, 0, headerHeight],
        outputRange: [-headerHeight / 2, 0, headerHeight * 0.75],
    });

    const scale = scrollY.interpolate({
        inputRange: [-headerHeight, 0, headerHeight],
        outputRange: [2, 1, 1],
    });

    return (
        <ThemedView style={styles.container}>
            <Animated.ScrollView
                ref={scrollRef}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true }
                )}
                scrollEventThrottle={16}
                scrollIndicatorInsets={{ bottom }}
                contentContainerStyle={{ paddingBottom: bottom }}
            >
                <Animated.View
                    style={[
                        {
                            height: headerHeight,
                            backgroundColor: headerBackgroundColor[colorScheme],
                            overflow: "hidden",
                        },
                        {
                            transform: [
                                { translateY },
                                { scale },
                            ],
                        },
                    ]}
                >
                    {headerImage}
                </Animated.View>

                <ThemedView style={styles.content}>
                    {React.Children.map(children, (child, index) => (
                        <View style={{ marginBottom: index === React.Children.count(children) - 1 ? 0 : 16 }}>
                            {child}
                        </View>
                    ))}
                </ThemedView>
            </Animated.ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 32,
    },
});
