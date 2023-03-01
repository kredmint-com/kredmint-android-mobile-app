import React, { useState, useEffect } from 'react';

import { registerRootComponent } from 'expo';
import { StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';

import {
  NavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as SplashScreen from 'expo-splash-screen';
import WebViewUI from './screens/Home';
import Onboarding from './screens/Onboarding';

import * as Linking from 'expo-linking';
import { HOST } from './constants';
import Enach from './screens/Enach';

const Stack = createStackNavigator();

const App = () => {
  const [showRealApp, setRealAppState] = useState(false);
  const navRef = useNavigationContainerRef();
  const url = Linking.useURL();

  useEffect(() => {
    async function setData() {
      const appData = await AsyncStorage.getItem('appLaunched');
      if (appData == null) {
        setRealAppState(false);
        await AsyncStorage.setItem('appLaunched', 'true');
      } else {
        setRealAppState(true);
      }
    }
    setData();
  }, []);

  //Handle getInitialUrl
  // useEffect(() => {
  //   // Do something with URL
  //   const getUrlAsync = async () => {
  //     // Get the deep link used to open the app
  //     const initialUrl = await Linking.getInitialURL();
  //     console.log('initialUrl', initialUrl);
  //     // The setTimeout is just for testing purpose
  //     // setTimeout(() => {
  //     //   setUrl(initialUrl);
  //     //   setProcessing(false);
  //     // }, 1000);
  //   };

  //   getUrlAsync();
  // }, []);

  // useEffect(() => {
  //   // Do something with URL
  //   console.log('Url received from Deeplink', url);
  //   if (url) {
  //     handleURL(url);
  //   } else {
  //     console.log('No URL');
  //   }
  // }, [url]);

  SplashScreen.preventAutoHideAsync();
  setTimeout(SplashScreen.hideAsync, 1000);

  onDoneCb = () => {
    setRealAppState(true);
  };
  if (!showRealApp) {
    return <Onboarding onDoneCb={onDoneCb} />;
  }

  const handleURL = async (url) => {
    const { hostname, path, queryParams } = Linking.parse(url);
    console.log('handle url', hostname, path, queryParams);
    // alert(
    //   `Hey ${hostname} and ${queryParams.message} url=${url} hostname=${hostname}`
    // );
    if (hostname === 'home' && queryParams.message === 'enach_success') {
      const newWebviewUrl = `${HOST}/submitted/?message=${queryParams?.message}`;
      WebBrowser.coolDownAsync();
      navRef.navigate('Home', { customUrl: newWebviewUrl });
      // navRef.navigate({
      //   routeName: 'Home',
      //   params: { customUrl: newWebviewUrl },
      //   // key: 'homePage' + Math.random() * 10000,¯
      // });
      // close open browser if any
    } else if (hostname === 'home') {
      navRef.navigate('Home');
      // do something for failure
      console.log(path, queryParams);
    } else {
      console.log(path, queryParams);
    }
  };
  // console.log('showRealApp', showRealApp);
  return (
    <>
      <NavigationContainer ref={navRef}>
        <Stack.Navigator
          enableURLHandling={false}
          screenOptions={{
            headerShown: false,
          }}
          initialRouteName="Home"
        >
          <Stack.Screen
            name="Home"
            component={WebViewUI}
            options={{
              animationEnabled: false,
            }}
          />
          <Stack.Screen
            name="Enach"
            component={Enach}
            options={{
              animationEnabled: false,
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
};

registerRootComponent(App);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
