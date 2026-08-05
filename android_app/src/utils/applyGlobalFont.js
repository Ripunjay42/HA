import { Text } from 'react-native';

const FAMILY_BY_WEIGHT = {
  '300': 'Ubuntu_300Light',
  '400': 'Ubuntu_400Regular',
  normal: 'Ubuntu_400Regular',
  '500': 'Ubuntu_500Medium',
  '600': 'Ubuntu_500Medium',
  '700': 'Ubuntu_700Bold',
  '800': 'Ubuntu_700Bold',
  '900': 'Ubuntu_700Bold',
  bold: 'Ubuntu_700Bold',
};

// Custom TTF fonts on Android don't respond to `fontWeight` the way system
// fonts do -- each weight needs its own font family. This picks the closest
// loaded Ubuntu weight from whatever fontWeight utility class (font-bold,
// font-semibold, ...) ended up in the flattened style, so every screen gets
// correct-looking Ubuntu text without having to touch each className.
const resolveFamily = (style) => {
  const flat = Array.isArray(style) ? Object.assign({}, ...style.filter(Boolean)) : style || {};
  return FAMILY_BY_WEIGHT[String(flat.fontWeight)] || 'Ubuntu_400Regular';
};

// Applies once, at import time, so it's active before any <Text> in the app
// renders for the first time. TextInput doesn't go through Text.render, so
// its font is instead set directly in the shared Input component.
export default function applyGlobalFont() {
  const originalRender = Text.render;
  Text.render = function render(props, ref) {
    const origin = originalRender.call(this, props, ref);
    return {
      ...origin,
      props: {
        ...origin.props,
        style: [{ fontFamily: resolveFamily(props.style) }, origin.props.style],
      },
    };
  };
}
