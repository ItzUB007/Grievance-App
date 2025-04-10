import React from 'react';
import { View, Text,ImageBackground, TouchableOpacity, StyleSheet, Image,Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { responsiveFontSize, responsiveHeight,responsiveWidth } from 'react-native-responsive-dimensions';
import colors from '../../styles/colors';
import imageBG from '../../Assets/img/adhikar-bg.png'
const { width, height } = Dimensions.get('window');
const AdhikarScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.mainCointainer}>
    <ImageBackground source={imageBG} resizeMode="cover" style={styles.image}>
    <View style={styles.container}>
       
      <View style={styles.logoContainer}>
     
      <Image source={require('../../Assets/img/logoadhikar.png')} style={styles.logo} />
         
      </View>
      <Text style={styles.title}>Welcome To Adhikar</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('AddaMember')}>
        <Text style={styles.buttonText}>Add a Member</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('UpdateaMember')}>
        <Text style={styles.buttonText}>Update a Member</Text>
      </TouchableOpacity>
     
    </View>
    </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  mainCointainer : {
  backgroundColor : '#000000',
  flex:1,
  opacity:0.8,

  },
  image: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    
    padding: responsiveWidth(5),
    
  },

  
  logoContainer: {
    backgroundColor:'#C32C2C',
    width:responsiveWidth(46),
    height:responsiveHeight(23),
    borderRadius: (width * 0.5)/2,
    display:'flex',
    justifyContent:'center',
    alignItems:'center',
    marginBottom:responsiveWidth(2)

  },
  logo: {
    width:responsiveWidth(35),
    height:responsiveHeight(15),
  },
  title: {
    fontSize: responsiveFontSize(3),
    color: colors.themewhite,
    fontWeight: '700',
    marginBottom: 40,
    marginTop:responsiveWidth(4),
    fontFamily: 'Montserrat-Bold',
  },
  button: {
    width: '80%',
    padding: 15,
    backgroundColor: colors.themered,
    alignItems: 'center',
    borderRadius:(width * 0.50)/2,
    marginVertical: 10,
  },
  buttonText: {
    color: colors.themewhite,
    fontSize: responsiveFontSize(1.5),
    fontWeight: '600',
  },
});

export default AdhikarScreen;
