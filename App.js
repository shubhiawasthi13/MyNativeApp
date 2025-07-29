import React from "react";
import { Image } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import HomeScreen from "./src/screens/Home";
import LoginScreen from "./src/screens/Login";
import RegisterScreen from "./src/screens/Register";
import CoursesScreen from "./src/screens/Courses";
import ProfileScreen from "./src/screens/Profile";
import EditProfileScreen from "./src/screens/EditProfile";
import CourseDetailsScreen from "./src/screens/CourseDetails";
import CourseProgressScreen from "./src/screens/CourseProgress";
import InterviewPrepScreen from "./src/screens/InterviewPrepScreen";
const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          title: "GrowSkill",
          headerLeft: () => (
            <Image
              source={require("./assets/brain-circuit.png")}
              style={{ width: 24, height: 24, marginLeft: 16 }}
            />
          ),
          headerTitleAlign: "left",
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Courses" component={CoursesScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="CourseDetails" component={CourseDetailsScreen} />
        <Stack.Screen name="CourseProgress" component={CourseProgressScreen} />
        <Stack.Screen name="InterviewPrep" component={InterviewPrepScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
