import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Platform,
  BackHandler,
  Image,
  Button,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { WebView } from "react-native-webview";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { HOST, postMessageTypes, randomNumber } from "../constants";
import Enach from "./Enach";

function WebViewUI({ route, navigation }) {
  const [webViewUrl, setWebViewUrl] = React.useState(`${HOST}/`);
  const [initScript, setInitScript] = React.useState();
  const [isWebviewRenderError, setWebviewRenderError] = React.useState(null);

  const [isBrowserInProgress, setBrowserProgressState] = React.useState(false);

  const [showEnach, setShowEnach] = useState(false);

  let webviewPropCanGoBack = null;

  const { customUrl = "" } = route?.params || {};
  console.log("customUrl received", customUrl);

  const webviewRef = React.useRef();

  useEffect(() => {
    if (customUrl) {
      setWebViewUrl(customUrl);
    }
  }, [customUrl]);

  useEffect(() => {
    if (webViewUrl && isBrowserInProgress) {
      setBrowserProgressState(false);
    }
  }, [webViewUrl]);

  const onAndroidBackPress = () => {
    if (webviewPropCanGoBack && webviewRef) {
      webviewRef.current.goBack();
      return true;
    }

    return false;
  };

  useEffect(() => {
    if (Platform.OS === "android") {
      BackHandler &&
        BackHandler.addEventListener("hardwareBackPress", onAndroidBackPress);
    }

    return () => {
      BackHandler.removeEventListener("hardwareBackPress", onAndroidBackPress);
    };
  }, []);

  function LoadingIndicatorView() {
    return (
      <ActivityIndicator
        color="#009b88"
        size="large"
        style={{ position: "absolute", left: 0, right: 0, bottom: 0, top: 0 }}
      />
    );
  }

  const onMessage = async ({ nativeEvent }) => {
    const data = nativeEvent?.data;
    try {
      const parsedData = JSON.parse(data);
      switch (parsedData.message) {
        case postMessageTypes.SAVE: {
          const data = parsedData.payload;
          if (data?.key && data?.value)
            await AsyncStorage.setItem(data.key, data.value);
          break;
        }

        case postMessageTypes.DELETE: {
          const data = parsedData.payload;
          if (data?.key) {
            await AsyncStorage.removeItem(data.key);
          }
          break;
        }

        case postMessageTypes.LOGOUT: {
          const appLaunched = await AsyncStorage.getItem("appLaunched");
          webviewRef.current.injectJavaScript(`(function() {})();`);
          setInitScript(`(function() {})();`);
          await AsyncStorage.clear();
          await AsyncStorage.setItem("appLaunched", appLaunched);
          break;
        }
        default:
          break;
      }

      if (
        parsedData?.message === "ENACH" &&
        parsedData?.data?.status === "initiated"
      ) {
        const data = {
          eNachUrl: parsedData?.data?.url,
          id: parsedData?.data?.id,
          token: parsedData?.data?.token,
        };
        const url = `${HOST}/eNach/?URL=${encodeURIComponent(
          data.eNachUrl
        )}&id=${data.id}&token=${data.token}&isApp=true`;
        setShowEnach(true);
        //navigation.push("Enach", { customUrl: data.eNachUrl });
        console.log("navigation", navigation);

        setBrowserProgressState(true);
      }
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getScript();
  }, []);

  async function getScript() {
    const allKeys = await AsyncStorage.getAllKeys();
    console.log("allKeys", allKeys);
    let jsStr = "";
    const keysData = await Promise.all(
      allKeys.map((key) => AsyncStorage.getItem(key))
    );

    allKeys.forEach((key, index) => {
      if (key.includes("web_")) {
        const newKey = key.replace("web_", "");
        jsStr =
          jsStr + `localStorage.setItem("${newKey}", "${keysData[index]}");`;
      }
    });

    const SAVE_FROM_RN = `(function() {
          ${jsStr}
        })();`;
    setInitScript(SAVE_FROM_RN);
  }
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.flexContainer}>
        {!showEnach ? (
          <View style={{ flex: 1 }}>
            {initScript && !isWebviewRenderError && (
              <WebView
                androidHardwareAccelerationDisabled={true}
                // androidLayerType={'hardware'}
                source={{
                  uri: webViewUrl,
                }}
                renderLoading={LoadingIndicatorView}
                startInLoadingState={true}
                ref={webviewRef}
                domStorageEnabled={true}
                injectedJavaScript={initScript}
                allowFileAccess={true}
                allowUniversalAccessFromFileURLs={true}
                allowingReadAccessToURL={true}
                javaScriptEnabled={true}
                onMessage={onMessage}
                setSupportMultipleWindows={false}
                // onNavigationStateChange={onNavigationStateChange}
                onNavigationStateChange={(navState) => {
                  webviewPropCanGoBack = navState.canGoBack;
                }}
                onRenderProcessGone={(syntheticEvent) => {
                  const { nativeEvent } = syntheticEvent;
                  // log this in GA or Firebase
                  console.warn("WebView Crashed: ", nativeEvent.didCrash);
                }}
                onError={() => {
                  setWebviewRenderError(true);
                }}
                pullToRefreshEnabled={true}
              />
            )}
            {isWebviewRenderError && (
              <View style={{ flex: 1, justifyContent: "center" }}>
                <Image
                  source={require("../../assets/network-error.png")}
                  // style={{ width: 300, height: 300 }}
                />
                <View style={styles.errorTextContainer}>
                  <Text style={styles.errorHeading}>Network issue</Text>
                  <Text style={styles.errorSubheading}>
                    Please try again, something bad happened and we lost the
                    connection.
                  </Text>
                </View>
                <TouchableOpacity
                  style={{
                    color: "#ffffff",
                    backgroundColor: "#224091",
                    width: "auto",
                    marginLeft: 10,
                    marginRight: 10,
                    marginTop: 15,
                    height: 52,
                    borderRadius: 4,
                    alignItems: "center",
                    // textAlign: 'center',
                    justifyContent: "center",
                  }}
                  onPress={() => {
                    setWebviewRenderError(false);
                    // webviewRef.current.reload();
                  }}
                >
                  <Text style={styles.tryAgainButton}>Try again</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            <Enach
              customUrl={
                "https://app.digio.in/#/enach-mandate-direct/ENA230228112651116ANVDG75AT5TGAP/07121/7017370753"
              }
              enachData={(data) => {
                console.log("HOME=====>", data);
              }}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  ActivityIndicatorStyle: {
    flex: 1,
    justifyContent: "center",
  },
  flexContainer: {
    flex: 1,
  },
  tabBarContainer: {
    backgroundColor: "#d3d3d3",
    height: 56,
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 16,
    justifyContent: "space-between",
  },
  button: {
    fontSize: 24,
  },
  arrow: {
    color: "#ef4771",
  },
  icon: {
    width: 20,
    height: 20,
  },
  errorTextContainer: {
    marginTop: 30,
    textAlign: "center",
    paddingLeft: 16,
    paddingRight: 16,
    // flex: 1,
    // justifyContent: 'center',
  },
  errorHeading: {
    textAlign: "center",
    color: "#224091",
    fontWeight: "bold",
    fontSize: 20,
  },
  errorSubheading: {
    marginTop: 16,
    color: "#808080",
    textAlign: "center",
    fontSize: 14,
  },
  tryAgainButton: {
    textAlign: "center",
    color: "#fff",
    fontWeight: `bold`,
    fontSize: 18,
    // height: 52,
    justifyContent: "center",
    verticalAlign: "middle",
  },
});
export default WebViewUI;
