import { View, type ViewProps, useColorScheme } from 'react-native';

// Direct import of Colors
const Colors = {
  light: {
    background: '#fff'
  },
  dark: {
    background: '#000'
  }
};

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView(props: ThemedViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const theme = useColorScheme() ?? 'light';
  const backgroundColor = lightColor 
    ? lightColor 
    : darkColor 
    ? darkColor 
    : Colors[theme].background;

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
