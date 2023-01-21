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
// import { Linking } from 'expo';
import { WebView } from 'react-native-webview';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { HOST } from '../constants';

// const HOST = 'http://192.168.0.101:3000';
// const HOST = 'https://merchant2-dev.kredmint.in';
// const HOST = 'https://merchant2.kredmint.in';

function WebViewUI({ route, navigation }) {
  const [webViewUrl, setWebViewUrl] = React.useState(`${HOST}/`);
  let webviewPropCanGoBack = null;
  // const [canGoBack, setCanGoBack] = React.useState(false);
  const { customUrl = '' } = route?.params || {};
  // console.log('customUrl', customUrl);
  const webviewRef = React.useRef();

  useEffect(() => {
    console.log('customUrl effect', customUrl);
    if (customUrl) {
      setWebViewUrl(customUrl);
    }
  }, [customUrl]);

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
        style={styles.ActivityIndicatorStyle}
      />
    );
  }

  const onNavigationStateChange = (navState) => {
    console.log('this.webView', this.webView);
    setCanGoBack(navState.canGoBack);
  };

  const onMessage = async ({ nativeEvent }) => {
    const data = nativeEvent?.data;
    // console.log(
    //   'datata',
    //   JSON.parse(data).message,
    //   data?.message,
    //   data?.data?.status
    // );
    try {
      const parsedData = JSON.parse(data);
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
        console.log('url', url);

        const browser = await WebBrowser.openBrowserAsync(url);

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
  return (
    <>
      <SafeAreaView style={styles.flexContainer}>
        <WebView
          source={{ uri: webViewUrl }}
          renderLoading={LoadingIndicatorView}
          startInLoadingState={true}
          ref={webviewRef}
          domStorageEnabled={true}
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
        />
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
