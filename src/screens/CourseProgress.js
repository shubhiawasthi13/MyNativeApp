 import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRoute } from "@react-navigation/native";
import { Video } from "expo-av";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Buffer } from "buffer";
import { useNavigation } from "@react-navigation/native";



export default function CourseProgress() {
  const route = useRoute();
  const { courseId } = route.params;

  const [courseDetails, setCourseDetails] = useState(null);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [videoRefs, setVideoRefs] = useState({});
  // inside your component
const navigation = useNavigation();

  const isLectureViewed = (lectureId) => {
    return progress.some((p) => p.lectureId === lectureId && p.viewed === true);
  };

  const updateLectureProgress = async (lectureId) => {
    try {
      const token = await AsyncStorage.getItem("token");
      await axios.post(
        `https://growskill-6gaq.onrender.com/api/v1/progress/${courseId}/lectures/${lectureId}/view`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setProgress((prev) => [...prev, { lectureId, viewed: true }]);
    } catch (err) {
      console.error("Error updating progress", err);
    }
  };

  const markCourseCompleted = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      await axios.post(
        `https://growskill-6gaq.onrender.com/api/v1/progress/${courseId}/complete`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      Alert.alert("Success", "Course marked as completed");
    } catch (err) {
      console.error("Error marking course completed", err);
      Alert.alert("Error", "Failed to mark course as completed");
    }
  };

  const markCourseIncomplete = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      await axios.post(
        `https://growskill-6gaq.onrender.com/api/v1/progress/${courseId}/incomplete`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      Alert.alert("Success", "Course marked as incomplete");
    } catch (err) {
      console.error("Error marking course incomplete", err);
      Alert.alert("Error", "Failed to mark course as incomplete");
    }
  };

  const DownloadCertificate = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const response = await axios.post(
        "https://growskill-6gaq.onrender.com/api/v1/certificate",
        { courseName: courseDetails.courseTitle },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "arraybuffer", // Important for PDF blob
        }
      );

      const base64Data = Buffer.from(response.data, "binary").toString(
        "base64"
      );
      const fileUri = FileSystem.documentDirectory + "certificate.pdf";

      await FileSystem.writeAsStringAsync(fileUri, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert("Downloaded", "Certificate saved to local storage.");
      }
    } catch (err) {
      console.error("Certificate download error:", err);
      Alert.alert("Error", "Failed to download certificate");
    }
  };
const generateQuestions = () => {
  navigation.navigate("InterviewPrep", {
    courseTitle: courseDetails?.courseTitle,
  });
};

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const res = await axios.get(
          `https://growskill-6gaq.onrender.com/api/v1/progress/${courseId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setCourseDetails(res.data.data.courseDetails);
        setProgress(res.data.data.progress);
      } catch (error) {
        console.error("Failed to fetch course progress", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, [courseId]);

  const allLecturesViewed =
    courseDetails?.lectures?.length > 0 &&
    courseDetails.lectures.every((lecture) => isLectureViewed(lecture._id));

  if (loading) {
    return <ActivityIndicator size="large" color="#007AFF" />;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>{courseDetails?.courseTitle}</Text>
      {courseDetails?.lectures?.map((lecture, index) => (
        <View key={lecture._id} style={styles.lectureItem}>
          <Text style={styles.lectureTitle}>
            {index + 1}. {lecture.lectureTitle}
          </Text>
          <Text style={styles.status}>
            {isLectureViewed(lecture._id) ? "✅ Viewed" : "❌ Not Viewed"}
          </Text>

          {lecture.videoUrl ? (
            <Video
              ref={(ref) => (videoRefs[lecture._id] = ref)}
              source={{ uri: lecture.videoUrl }}
              rate={1.0}
              volume={1.0}
              isMuted={false}
              resizeMode="contain"
              shouldPlay={false}
              useNativeControls
              style={styles.video}
              onPlaybackStatusUpdate={(status) => {
                if (status.didJustFinish && !isLectureViewed(lecture._id)) {
                  updateLectureProgress(lecture._id);
                }
              }}
            />
          ) : (
            <Text style={{ fontStyle: "italic", color: "#999" }}>
              No video available
            </Text>
          )}
        </View>
      ))}

      <View style={{ marginTop: 20 }}>
        {allLecturesViewed ? (
          <TouchableOpacity
            onPress={markCourseIncomplete}
            style={styles.incompleteBtn}
          >
            <Text style={styles.btnText}>Mark as Incomplete</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={markCourseCompleted}
            style={styles.completeBtn}
          >
            <Text style={styles.btnText}>Mark as Completed</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={{ marginTop: 20 }}>
        {allLecturesViewed ? (
          <TouchableOpacity
            onPress={DownloadCertificate}
            style={styles.completeBtn}
          >
            <Text style={styles.btnText}>Download Certificate</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      <View style={{ marginTop: 20 }}>
        {allLecturesViewed ? (
          <TouchableOpacity
            onPress={generateQuestions}
            style={styles.completeBtn}
          >
            <Text style={styles.btnText}>Interview Prepration</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  heading: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  lectureItem: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  lectureTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 5 },
  status: { fontSize: 14, marginBottom: 8 },
  video: {
    width: "100%",
    height: 200,
    backgroundColor: "#000",
    borderRadius: 10,
  },
  completeBtn: {
    backgroundColor: "#28a745",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  incompleteBtn: {
    backgroundColor: "#dc3545",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
