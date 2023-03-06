import { StatusBar, Dimensions, StyleSheet, useColorScheme, View, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import MapView, { PROVIDER_GOOGLE, Region } from "react-native-maps";
import { getCurrentPositionAsync, useForegroundPermissions, PermissionStatus } from "expo-location";

export default function App() {
	const [alertDisplayed, setAlertDisplayed] = useState(false);
	const [curLoc, setCurLoc] = useState({ lat: NaN, lon: NaN });
	const [locationPermissionInformation, requestPermission] = useForegroundPermissions();
	const colorTheme = useColorScheme();
	const { width, height } = Dimensions.get("window");

	const ASPECT_RATIO = width / height;
	const LONGITUDE_DELTA = 0.02 * ASPECT_RATIO;
	const initialPosition: Region = {
		latitude: curLoc.lat || 0,
		longitude: curLoc.lon || 0,
		latitudeDelta: 0.02,
		longitudeDelta: LONGITUDE_DELTA,
	};

	useEffect(() => {
		async function verifyPermissions() {
			if (locationPermissionInformation?.status === PermissionStatus.UNDETERMINED) {
				const permissionResponse = await requestPermission();
				return permissionResponse.granted;
			}
			if (locationPermissionInformation?.status === PermissionStatus.DENIED && !alertDisplayed) {
				setAlertDisplayed(true);
				Alert.alert(
					"Insufficient Permissions!",
					"You need to grant location permissions to use the map"
				);
				return false;
			}
			return true;
		}
		async function getLocation() {
			try {
				const hasPermission = await verifyPermissions();
				if (!hasPermission) {
					setCurLoc({
						lat: 52,
						lon: 13,
					});
					return;
				}
				const location = await getCurrentPositionAsync();
				setCurLoc({
					lat: location.coords.latitude,
					lon: location.coords.longitude,
				});
			} catch (e) {
				console.log(e);
			}
		}
		getLocation();
	}, [locationPermissionInformation]);

	const backgroundColor = {
		backgroundColor: colorTheme === "dark" ? "#222121" : "white",
	};

	return (
		<>
			<SafeAreaView style={[styles.rootContainer]}>
				<StatusBar barStyle={"dark-content"} translucent backgroundColor='transparent' />
				<View style={styles.mapContainer}>
					{curLoc.lat && curLoc.lon ? (
						<MapView style={styles.mapStyle} provider={PROVIDER_GOOGLE} region={initialPosition} />
					) : (
						<View></View>
					)}
				</View>
				<View style={styles.optionsStyle}></View>
			</SafeAreaView>
		</>
	);
}

const styles = StyleSheet.create({
	rootContainer: {
		flex: 1,
	},
	mapContainer: {
		flex: 3,
		backgroundColor: "blue",
	},
	mapStyle: {
		width: "100%",
		height: "100%",
	},
	optionsStyle: {
		flex: 1,
		backgroundColor: "yellow",
	},
	buttonMap: {
		width: "50%",
		padding: 30,
		backgroundColor: "blue",
	},
});
