import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, StatusBar, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import LinearGradient from 'react-native-linear-gradient';

import colors from '../../styles/colors';



const { width, height } = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation();
  const { userData } = useAuth();

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#EA3838" barStyle="light-content" />
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.profileContainer}>
          <Image
            source={require('../../Assets/img/logo.jpeg')} // Add a placeholder image for profile
            style={styles.profileImage}
          />
          <Text style={styles.greeting}>Hello, {userData?.displayName || 'User'}</Text>
        </View>
        <TouchableOpacity style={styles.notificationIcon} onPress={() => navigation.navigate('Notifications')}>
          <Icon name="notifications" size={width * 0.074} color="#fff" />
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationCount}>3</Text>
          </View>
        </TouchableOpacity>
        
      </View>

      {/* Options */}
      <ScrollView contentContainerStyle={styles.optionContainer}>
        <Text style={styles.welcomeTitle}>
          Welcome To {'\n'}
          Adhikar Grievance
        </Text>
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Grievance')}>
          <Image source={require('../../Assets/img/Grievance2.png')} style={styles.cardImage} />
          <LinearGradient
            colors={['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.4)']} // Bottom-to-top gradient
            style={styles.gradientOverlay}
          />
          <View style={styles.textOverlay}>
            <Text style={styles.cardText}>Grievance</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Adhikar')}>
          <Image source={require('../../Assets/img/Adhikar.png')} style={styles.cardImage} />
          <LinearGradient
            colors={['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.4)']} // Bottom-to-top gradient
            style={styles.gradientOverlay}
          />
          <View style={styles.textOverlay}>
            <Text style={styles.cardText}>Adhikar</Text>
          </View>
        </TouchableOpacity>
        {/* <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Search')}>
          <Image source={require('../../Assets/img/Other.png')} style={styles.cardImage} />
          <LinearGradient
            colors={['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.5)']} // Bottom-to-top gradient
            style={styles.gradientOverlay}
          />
          <View style={styles.textOverlay}>
            <Text style={styles.cardText}>Other</Text>
          </View>
        </TouchableOpacity> */}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.themered,
  },
  optionContainer: {
    padding: width * 0.03, // Responsive padding
    flex:1,
    borderTopLeftRadius: width * 0.05,
    borderTopRightRadius: width * 0.05,
    backgroundColor: colors.themewhite,
    justifyContent:'space-around',
    width:'100%',
    height:'100%',

  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.themered,
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.02,
    position: 'relative',
    zIndex: 1, // Ensures the header stays on top
  },
 
  
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',

  },
  profileImage: {
    width: width * 0.13,
    height: width * 0.13,
    borderRadius: (width * 0.13) / 2,
    marginRight: width * 0.03,
  },
  greeting: {
    color: colors.themewhite,
    fontSize: width * 0.045,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold'
  },
  notificationIcon: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -height * 0.006,
    right: -width * 0.013,
    backgroundColor: '#ff1744',
    borderRadius: width * 0.02,
    paddingHorizontal: width * 0.013,
    paddingVertical: height * 0.003,
  },
  notificationCount: {
    color: colors.themewhite,
    fontSize: width * 0.032,
    fontWeight: 'bold',
  },
  welcomeTitle: {
    fontSize: width * 0.053,
    fontWeight: '500',
    lineHeight: width * 0.058,
    color: '#E53535',
    marginVertical: height * 0.025,
    marginLeft: width * 0.1,
    fontFamily: 'Montserrat-Bold',
  },
  card: {
    position: 'relative',
    width: '100%',
    height: height * 0.30,
    marginVertical: height * 0.0125,
    overflow: 'hidden',
    justifyContent:'center',
    borderRadius: width * 0.03,
    alignItems:'center',
    backgroundColor:'#ffffff'
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    flex: 1, // Covers the entire card
    
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 15,
    left: width * 0.065,
    right: width * 0.065,
    top: 0,
    borderRadius: width * 0.03,

  },
  textOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },

  cardText: {
    fontSize: width * 0.045,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    lineHeight: width * 0.048,
  },
});

export default HomeScreen;



  {/* Slider for AI Suggestions */}
      {/* <View style={styles.sliderContainer}>
        <Text style={styles.sliderText}>AI Assist: {isOn ? 'On' : 'Off'}</Text>
        <Switch
          value={isOn}
          onValueChange={() => dispatch(toggleSlider())}
        />
      </View> */}


      // useEffect(() => {
      //   async function AskPermission() {
      //     await ManageExternalStorage.checkAndGrantPermission(
      //       err => {
      //         setResult(false);
      //       },
      //       res => {
      //         setResult(true);
      //       },
      //     );
      //   }
      // borderBottomLeftRadius: - width * 0.05,
      // borderBottomRightRadius: - width * 0.05,
    
      //   // AskPermission()  // This function is only executed once if the user allows the permission and this package retains that permission 
      // }, []);