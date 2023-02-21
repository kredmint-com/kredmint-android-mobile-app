// export const HOST = 'http://192.168.0.106:3000';
// export const HOST = 'https://merchant2.kredmint.in';
export const HOST = 'https://merchant2-dev.kredmint.in';

export const randomNumber = () => {
  return Math.random() * 10000;
};

export const postMessageTypes = {
  SAVE: 'set_item_localStorage',
  DELETE: 'delete_item_localStorage',
  LOGOUT: 'logout',
};
