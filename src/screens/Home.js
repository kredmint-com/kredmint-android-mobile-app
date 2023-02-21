import React, { useEffect } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Platform,
  // Linking,
  BackHandler,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { Linking } from 'expo';
import { WebView } from 'react-native-webview';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { HOST, postMessageTypes, randomNumber } from '../constants';

// const SAVE_FROM_WEB = `(function() {
//   var values = [],
//   keys = Object.keys(localStorage),
//   i = keys.length;
//   while ( i-- ) {
//       values.push({key: keys[i], value: localStorage.getItem(keys[i])});
//   }
//   window.ReactNativeWebView.postMessage(JSON.stringify({message: 'webview/save', payload: values}));
// })();`;

function WebViewUI({ route, navigation }) {
  const [webViewUrl, setWebViewUrl] = React.useState(`${HOST}/`);
  const [initScript, setInitScript] = React.useState();
  const [isBrowserInProgress, setBrowserProgressState] = React.useState(false);

  let webviewPropCanGoBack = null;
  // const [canGoBack, setCanGoBack] = React.useState(false);
  const { customUrl = '' } = route?.params || {};
  // console.log('customUrl', customUrl);
  const webviewRef = React.useRef();

  useEffect(() => {
    if (customUrl) {
      setWebViewUrl(customUrl);
    }
  }, [customUrl]);

  useEffect(() => {
    if (webViewUrl && isBrowserInProgress) {
      setBrowserProgressState(false);
      // webviewRef?.current?.reload();
    }
  }, [webViewUrl]);

  const onAndroidBackPress = () => {
    // console.log('canGoBack', webviewPropCanGoBack, webviewRef);
    if (webviewPropCanGoBack && webviewRef) {
      webviewRef.current.goBack();
      return true;
    }
    // if (webviewRef.current) {
    //   webviewRef.current.goBack();
    //   return true; // prevent default behavior (exit app)
    // }
    return false;
  };

  useEffect(() => {
    if (Platform.OS === 'android') {
      BackHandler &&
        BackHandler.addEventListener('hardwareBackPress', onAndroidBackPress);
    }

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', onAndroidBackPress);
    };
  }, []); // Never re-run this effect

  // const handleURL = async (url) => {
  //   const { hostname, path, queryParams } = Linking.parse(url);
  //   if (path === 'submitted') {
  //     const newWebviewUrl = `${HOST}/${path}/?message=${queryParams?.message}`;
  //     setWebViewUrl(newWebviewUrl);
  //     // close open browser if any
  //     const closeResult = await WebBrowser.coolDownAsync();
  //   } else if (path === 'home') {
  //     console.log(path, queryParams);
  //   } else {
  //     console.log(path, queryParams);
  //   }
  // };

  // useEffect(() => {
  //   // Do something with URL
  //   console.log('handleUrl', url);
  //   if (url) {
  //     handleURL(url);
  //   } else {
  //     console.log('No URL');
  //   }
  // }, [url]);

  function LoadingIndicatorView() {
    return (
      <ActivityIndicator
        color="#009b88"
        size="large"
        // style={styles.ActivityIndicatorStyle}
        style={{ position: 'absolute', left: 0, right: 0, bottom: 0, top: 0 }}
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
          const appLaunched = await AsyncStorage.getItem('appLaunched');
          webviewRef.current.injectJavaScript(`(function() {})();`);
          setInitScript(`(function() {})();`);
          await AsyncStorage.clear();
          await AsyncStorage.setItem('appLaunched', appLaunched);
          break;
        }
        default:
          break;
      }

      if (
        parsedData?.message === 'ENACH' &&
        parsedData?.data?.status === 'initiated'
      ) {
        const data = {
          eNachUrl: parsedData?.data?.url,
          id: parsedData?.data?.id,
          token: parsedData?.data?.token,
        };
        const url = `${HOST}/eNach/?URL=${encodeURIComponent(
          data.eNachUrl
        )}&id=${data.id}&token=${data.token}&isApp=true`;

        // const redirectUri = Linking.createURL('/');
        // const redirectUri =
        //   'exp://192.168.0.101:19000/--/home?message=enach_success';
        setBrowserProgressState(true);
        // const redirectUri = 'kredmintlink://home?message=enach_success';
        const browser = await WebBrowser.openAuthSessionAsync(url, url, {
          showInRecents: true,
          createTask: false,
          showTitle: false,
          secondaryToolbarColor: '#000',
          enableBarCollapsing: true,
        });
        setBrowserProgressState(false);
        // console.log('browser', browser);
        if (browser?.type === 'dismiss') {
          if (webViewUrl.indexOf('?') !== -1) {
            setWebViewUrl(`${HOST}/?event=reload&${randomNumber()}`);
          } else {
            setWebViewUrl(`${HOST}/?event=reload&${randomNumber()}`);
          }
          // webviewRef?.current?.reload();
        }
        // setTimeout(async () => {
        //   const closeResult = await WebBrowser.coolDownAsync();
        //   console.log('closeResult', closeResult);
        // }, 5000);
        // setTimeout(
        //   () => console.log('Result', JSON.stringify(result, null, 2)),
        //   1000
        // );
      }
      // if (
      //   parsedData?.message === 'ENACH' &&
      //   parsedData?.data?.status === 'completed'
      // ) {
      //   WebBrowser.maybeCompleteAuthSession();
      // }
    } catch (e) {
      console.log(e);
    }
  };

  // async function handleInit() {
  //   const allKeys = await AsyncStorage.getAllKeys();
  //   if (allKeys.length === 0) {
  //     setInitScript(SAVE_FROM_WEB);
  //   } else {
  //     let jsStr = '';
  //     const keysData = await Promise.all(
  //       allKeys.map((key) => AsyncStorage.getItem(key))
  //     );
  //     allKeys.forEach((key, index) => {
  //       jsStr = jsStr + `localStorage.setItem("${key}", "${keysData[index]}");`;
  //     });
  //     const SAVE_FROM_RN = `(function() {
  //       ${jsStr}
  //     })();`;
  //     setInitScript(SAVE_FROM_RN);
  //   }
  // }

  // const refreshHandler = () => {
  //   intervalId = setInterval(() => {
  //     webviewRef.current?.injectJavaScript(SAVE_FROM_WEB);
  //   }, 3000);
  //   return () => {
  //     intervalId && clearInterval(intervalId);
  //   };
  // };

  // useEffect(() => {
  //   handleInit().then(refreshHandler);
  // }, []);

  useEffect(() => {
    getScript();
  }, []);

  // const onWebViewLoadStart = () => {
  //   webviewRef.injectJavaScript(
  //     'if(window.opener!==window.ReactNativeWebView){window.opener=window.ReactNativeWebView;}'
  //   );
  // };

  async function getScript() {
    const allKeys = await AsyncStorage.getAllKeys();
    console.log('allKeys', allKeys);
    let jsStr = '';
    const keysData = await Promise.all(
      allKeys.map((key) => AsyncStorage.getItem(key))
    );

    allKeys.forEach((key, index) => {
      if (key.includes('web_')) {
        const newKey = key.replace('web_', '');
        jsStr =
          jsStr + `localStorage.setItem("${newKey}", "${keysData[index]}");`;
      }
    });

    const SAVE_FROM_RN = `(function() {
          ${jsStr}
        })();`;
    setInitScript(SAVE_FROM_RN);
  }

  // console.log('getScript', getScript());
  return (
    <>
      <SafeAreaView style={styles.flexContainer}>
        {initScript && (
          <WebView
            source={{ uri: webViewUrl }}
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
            // onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
            // onShouldStartLoadWithRequest={(event) => {
            //   console.log('heyBorher');
            //   if (!event.url.includes('kredmint')) {
            //     Linking.openURL(event.url);
            //     return false;
            //   }
            //   return true;
            // }}
            onRenderProcessGone={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              // log this in GA or Firebase
              console.warn('WebView Crashed: ', nativeEvent.didCrash);
            }}
            renderError={(errorName) => (
              <Text
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  top: 0,
                }}
              >
                Oops.. something went wrong!
              </Text>
            )}
            pullToRefreshEnabled={true}
          />
        )}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  ActivityIndicatorStyle: {
    flex: 1,
    justifyContent: 'center',
  },
  flexContainer: {
    flex: 1,
  },
  tabBarContainer: {
    backgroundColor: '#d3d3d3',
    height: 56,
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  button: {
    fontSize: 24,
  },
  arrow: {
    color: '#ef4771',
  },
  icon: {
    width: 20,
    height: 20,
  },
});
export default WebViewUI;
