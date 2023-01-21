import React from 'react';
import { Image } from 'react-native';
import Onboarding from 'react-native-onboarding-swiper';

const OnboardingPage = ({ onDoneCb }) => {
  return (
    <Onboarding
      pages={[
        {
          backgroundColor: '#224091',
          image: (
            <Image
              source={require('../../assets/grow-business.png')}
              style={{ width: 300, height: 300 }}
            />
          ),
          title: 'Grow Your Business',

          subtitle:
            'Pay your suppliers faster by getting a credit limit approved by Kreditmint and get cash discounts. By enabling your buyers to onboard on the Kreditmint platform, you can reduce your working capital requirement by letting them pay you instantly with Kreditmint, reducing cash collection costs in the process.',
        },
        {
          backgroundColor: '#224091',
          image: (
            <Image
              source={require('../../assets/easy-application.png')}
              style={{ width: 300, height: 300 }}
            />
          ),
          title: 'Quick & Easy Application',
          subtitle:
            "The application is entirely accessible online, so you won't have to make a visit or go to any bank. All you have to do is input relevant financial and KYC documents and submit them.",
        },
        {
          backgroundColor: '#224091',
          image: (
            <Image
              source={require('../../assets/avail-bg.png')}
              style={{ width: 300, height: 300 }}
            />
          ),
          title: 'Avail Credit Limit',
          subtitle:
            'We are committed to making the loan approval process seamless and we work with a number of banks and NBFCs to provide customers with access to faster approvals.',
        },
        {
          backgroundColor: '#224091',
          image: (
            <Image
              source={require('../../assets/privacy.png')}
              style={{ width: 300, height: 300 }}
            />
          ),
          title: 'Privacy & Trust',
          subtitle:
            'Our Safest Encrypted Systems offer continuous security of your information, and we only use it to get you access to your credit limit.',
        },
      ]}
      onDone={onDoneCb}
      onSkip={onDoneCb}
    />
  );
};

export default OnboardingPage;
