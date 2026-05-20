import {
  useFonts,
  BebasNeue_400Regular,
} from '@expo-google-fonts/bebas-neue';
import {
  Barlow_300Light,
  Barlow_400Regular,
  Barlow_500Medium,
  Barlow_600SemiBold,
} from '@expo-google-fonts/barlow';

export function useAppFonts() {
  return useFonts({
    BebasNeue_400Regular,
    Barlow_300Light,
    Barlow_400Regular,
    Barlow_500Medium,
    Barlow_600SemiBold,
  });
}

export const fonts = {
  display: 'BebasNeue_400Regular',
  title: 'BebasNeue_400Regular',
  titleBold: 'BebasNeue_400Regular',
  body: 'Barlow_400Regular',
  bodyLight: 'Barlow_300Light',
  bodyMedium: 'Barlow_500Medium',
  bodySemiBold: 'Barlow_600SemiBold',
} as const;
