import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { Video } from "expo-av";
 import * as Linking from "expo-linking"; 

export default function CourseDetails({ route, navigation }) {
  const { course } = route.params;
  const [fullCourse, setFullCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchased, setPurchased] = useState(false);

  useEffect(() => {
    const fetchCourseDetail = async () => {
      try {
        const token = await AsyncStorage.getItem("token");

        const response = await axios.get(
          `https://growskill-6gaq.onrender.com/api/v1/purchase/course/${course._id}/detail-with-status`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data) {
          setFullCourse(response.data.course);
          setPurchased(response.data.purchased);
        }
      } catch (error) {
        console.error("Error fetching course detail:", error);
        Alert.alert("Error", "Could not load course details.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetail();
  }, [course._id]);


const handleBuyCourse = async () => {
  try {
    const token = await AsyncStorage.getItem("token");

    const response = await axios.post(
      "https://growskill-6gaq.onrender.com/api/v1/purchase/checkout/create-checkout-session",
      { courseId: course._id },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data.success && response.data.url) {
      Linking.openURL(response.data.url); // ✅ Open Stripe Checkout
    } else {
      Alert.alert("Error", "Could not initiate checkout.");
    }
  } catch (error) {
    console.error("Checkout error:", error);
    Alert.alert("Error", "Something went wrong during checkout.");
  }
};


  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>All Courses</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : fullCourse ? (
        <>
          <Text style={styles.description}>{fullCourse.courseTitle}</Text>
          <Text style={styles.description}>
            By: {fullCourse.creator?.name || "Unknown"}
          </Text>
          <Text style={styles.description}>
            Last updated: {new Date(fullCourse.updatedAt).toLocaleDateString()}
          </Text>
          <Text style={styles.description}>
            Enrolled Students: {fullCourse.enrolledStudents?.length || 0}
          </Text>

          <Text style={styles.title}>Description</Text>
          <Text style={styles.description}>{fullCourse.description}</Text>

          {/* 🔽 First Lecture Video (if purchased) */}
          {fullCourse.lectures.length > 0 && (
            <View style={styles.videoContainer}>
              <Video
                source={{ uri: fullCourse.lectures[0].videoUrl }}
                rate={1.0}
                volume={1.0}
                isMuted={false}
                resizeMode="contain"
                useNativeControls
                style={styles.video}
              />
            </View>
          )}
        </>
      ) : (
        <Text style={styles.description}>Course not found.</Text>
      )}

    {purchased ? (
  <TouchableOpacity
    style={styles.continueBtn}
    onPress={() =>
      navigation.navigate("CourseProgress", { courseId: fullCourse._id })
    }
  >
    <Text style={styles.btnText}>Continue</Text>
  </TouchableOpacity>
) : (
<TouchableOpacity style={styles.buyBtn} onPress={handleBuyCourse}>
  <Text style={styles.btnText}>Buy Course</Text>
</TouchableOpacity>

)}
      <Text style={styles.title}>Course Content</Text>

      {fullCourse?.lectures?.length > 0 ? (
        fullCourse.lectures.map((lecture, idx) => (
          <View key={lecture._id || idx} style={styles.lectureRow}>
            <Ionicons
              name={purchased ? "play-circle" : "lock-closed"}
              size={20}
              color={purchased ? "green" : "gray"}
              style={{ marginRight: 8 }}
            />
            <Text>{lecture.lectureTitle || `Lecture ${idx + 1}`}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.description}>No lectures available.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#1f2937",
  },
  description: {
    fontSize: 16,
    marginBottom: 12,
  },
  lectureRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#ccc",
    flexDirection: "row",
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
  },
  continueBtn: {
    backgroundColor: "#6200ee",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
    marginTop: 10,
  },
  buyBtn: {
    backgroundColor: "#ff5722",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
    marginTop: 10,
  },
  videoContainer: {
    marginTop: 12,
    aspectRatio: 16 / 9,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  video: {
    width: "100%",
    height: "100%",
  },
});
