import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  StatusBar,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function InterviewPrepScreen({ route }) {
  const { courseTitle } = route.params;
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const token = await AsyncStorage.getItem("token");

        const response = await axios.post(
          "https://growskill-6gaq.onrender.com/api/v1/generate",
          { courseTitle },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setQuestions(response.data.questions);
      } catch (err) {
        console.error("❌ Failed to generate interview questions", err);
        Alert.alert("Error", "Failed to generate interview questions.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [courseTitle]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={{ marginTop: 10, fontSize: 16 }}>Generating questions...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <StatusBar backgroundColor="#3b82f6" barStyle="light-content" />
      <Text style={styles.header}>Interview Preparation</Text>
      <Text style={styles.subTitle}>Course: {courseTitle}</Text>

      {questions.map((q, idx) => (
        <View key={idx} style={styles.qCard}>
          <Text style={styles.qNumber}>Q{idx + 1}</Text>
          <Text style={styles.qText}>{q}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f9f9f9",
    padding: 16,
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 4,
  },
  subTitle: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 20,
  },
  qCard: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  qNumber: {
    fontWeight: "bold",
    color: "#3b82f6",
    marginBottom: 6,
  },
  qText: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 22,
  },
});
