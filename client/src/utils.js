import bananasImg from './images/bananas.jpg';
import beetrootImg from './images/beetroot.jpg';
import bitterGourdImg from './images/bitter_gourd.jpg';
import bottleGourdImg from './images/bottle_gourd.jpg';
import capsicumImg from './images/capsicum.jpg';
import carrotImg from './images/carrot.jpg';
import cauliflowerImg from './images/cauliflower.jpg';
import corianderImg from './images/coriander.jpg';
import fenugreekImg from './images/fenugreek.jpg';
import greenChilliImg from './images/green_chilli.jpg';
import lemonsImg from './images/lemons.jpg';
import onionImg from './images/onion.jpg';
import potatoImg from './images/potato.jpg';
import radishImg from './images/radish.jpg';
import ridgeGourdImg from './images/ridge_gourd.jpg';
import spinachImg from './images/spinach.jpg';
import tomatoImg from './images/tomato.jpg';

export const rupee = (n) => `\u20B9${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

export function timeAgo(date) {
  if (!date) return '';
  const mins = Math.floor((Date.now() - new Date(date)) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.floor(hrs / 24);
  return days === 1 ? 'yesterday' : `${days} days ago`;
}

const VEG_IMAGES = {
  tomato: tomatoImg,
  tomatoes: tomatoImg,
  onion: onionImg,
  onions: onionImg,
  potato: potatoImg,
  potatoes: potatoImg,
  carrot: carrotImg,
  carrots: carrotImg,
  'green chilli': greenChilliImg,
  'green chili': greenChilliImg,
  'green chillies': greenChilliImg,
  'green chilies': greenChilliImg,
  chilli: greenChilliImg,
  chili: greenChilliImg,
  capsicum: capsicumImg,
  cauliflower: cauliflowerImg,
  spinach: spinachImg,
  palak: spinachImg,
  coriander: corianderImg,
  dhaniya: corianderImg,
  fenugreek: fenugreekImg,
  methi: fenugreekImg,
  lemon: lemonsImg,
  lemons: lemonsImg,
  banana: bananasImg,
  bananas: bananasImg,
  beetroot: beetrootImg,
  radish: radishImg,
  'bottle gourd': bottleGourdImg,
  lauki: bottleGourdImg,
  'ridge gourd': ridgeGourdImg,
  turai: ridgeGourdImg,
  'bitter gourd': bitterGourdImg,
  karela: bitterGourdImg,
};

export const imageFor = (name = '') => {
  if (!name) return null;
  const key = name.toLowerCase().trim().replace(/[-_]+/g, ' ');
  return VEG_IMAGES[key] || null;
};

const EMOJI = {
  tomato: '\u{1F345}', onion: '\u{1F9C5}', potato: '\u{1F954}', carrot: '\u{1F955}', 'green chilli': '\u{1F336}\uFE0F',
  capsicum: '\u{1FAD1}', cauliflower: '\u{1F966}', spinach: '\u{1F96C}', coriander: '\u{1F33F}', fenugreek: '\u{1F33F}',
  lemon: '\u{1F34B}', banana: '\u{1F34C}', brinjal: '\u{1F346}', corn: '\u{1F33D}', garlic: '\u{1F9C4}', cucumber: '\u{1F952}',
  broccoli: '\u{1F966}', beetroot: '\u{1F360}', radish: '\u{1F955}',
};
export const emojiFor = (name = '') => EMOJI[name.toLowerCase()] || '\u{1F96C}';

export const CATEGORIES = ['Everyday', 'Leafy', 'Roots', 'Gourds', 'Fruits'];
export const UNITS = ['kg', 'bunch', 'dozen', 'piece'];
export const STATUS_LABEL = {
  placed: 'Placed', accepted: 'Accepted', out_for_delivery: 'Out for delivery', delivered: 'Delivered', cancelled: 'Cancelled',
};
export const COMMON_VEG = ['Tomato', 'Onion', 'Potato', 'Carrot', 'Spinach', 'Coriander', 'Cauliflower', 'Cabbage', 'Brinjal', 'Okra', 'Capsicum', 'Green Chilli', 'Cucumber', 'Beetroot', 'Radish', 'Bottle Gourd', 'Lemon', 'Garlic', 'Ginger', 'Peas'];
