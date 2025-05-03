import { useNavigation } from "expo-router";
import React from "react";
import { Button, StyleSheet, Text, View } from "react-native";

export default function Index() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Development Menu</Text>
      <Button
        title="Go to Choice Screen"
        onPress={() => navigation.navigate("choice")}
      />
      <Button
        title="Go to Result Screen"
        onPress={() =>
          navigation.navigate("result", {
            message: "Text result to print!\nPlayer is evil",
          })
        }
      />
      {/* Add more buttons here for other screens as needed */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
});