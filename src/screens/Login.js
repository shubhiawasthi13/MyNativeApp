
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
 import AsyncStorage from "@react-native-async-storage/async-storage"; // add this at the top

export default function Login({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");


const handleLogin = async () => {
  if (!email || !password) {
    Alert.alert("Validation Error", "Please fill in all required fields");
    return;
  }

  try {
    const response = await fetch("https://growskill-6gaq.onrender.com/api/v1/user/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // for cookies, but not used in token-based auth
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      Alert.alert("Login Failed", data.message || "Something went wrong");
      return;
    }

    // ✅ Save token
    await AsyncStorage.setItem("token", data.token);
    await AsyncStorage.setItem("user", JSON.stringify(data.user));

    Alert.alert("Success", "Login successful!");

    navigation.navigate("Profile");
  } catch (error) {
    console.error("Login Error:", error);
    Alert.alert("Error", "Failed to login. Please try again.");
  }
};


  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Login to GrowwSkill</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={styles.registerText}>
          Don't have an account?{" "}
          <Text style={{ color: "#4f46e5" }}>Register</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f8fc",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 24,
  },
  input: {
    width: "100%",
    height: 48,
    backgroundColor: "#fff",
    borderColor: "#cbd5e1",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#4f46e5",
    paddingVertical: 12,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginBottom: 16,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  registerText: {
    color: "#64748b",
    fontSize: 14,
  },
});
