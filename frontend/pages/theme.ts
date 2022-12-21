import { extendTheme } from '@chakra-ui/react';

const colors = {
  main: '#4267B2',
  gray: '#D9D9D9',
  opponent: '#CC0E38',
  win: '#7AB242',
  lose: '#FF0000',
  online: '#6ADC10',
  offline: '#BEC8BC',
  ingame: '#4267B2',
  crown: '#F4C621',
};

const theme = extendTheme({ colors });

export default theme;
